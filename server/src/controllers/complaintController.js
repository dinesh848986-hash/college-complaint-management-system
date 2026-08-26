const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and location',
      });
    }

    let attachmentData = {
      filename: null,
      originalName: null,
      path: null,
      mimetype: null,
      size: 0,
      url: null,
    };

    if (req.file) {
      attachmentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      };
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority: priority || 'Medium',
      status: 'Submitted',
      attachment: attachmentData,
      statusHistory: [
        {
          status: 'Submitted',
          changedAt: new Date(),
          comment: 'Complaint officially submitted by student.',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints submitted by the logged-in student
// @route   GET /api/complaints
// @access  Private (Student)
const getStudentComplaints = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    // Strict ownership: students can ONLY view their own complaints
    const query = { student: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { location: searchRegex }];
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email studentId department');

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details by ID
// @route   GET /api/complaints/:id
// @access  Private (Student/Admin)
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'student',
      'name email studentId department phone'
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Security check: Only the owner student or an admin can access
    const isOwner = complaint.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints across all students (Admin only)
// @route   GET /api/complaints/admin
// @access  Private (Admin)
const getAdminComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { assignedDepartment: searchRegex },
        { assignedStaff: searchRegex },
      ];
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email studentId department phone');

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint details, status lifecycle, department assignment, admin comments, resolution (Admin only)
// @route   PATCH /api/complaints/:id
// @access  Private (Admin)
const updateComplaint = async (req, res, next) => {
  try {
    const {
      status,
      assignedDepartment,
      assignedStaff,
      adminComments,
      resolutionDetails,
      priority,
      statusComment,
    } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const validStatuses = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
    ];

    // Status change lifecycle tracking
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: "${status}". Valid statuses are: ${validStatuses.join(', ')}`,
        });
      }

      if (status !== complaint.status) {
        const comment =
          statusComment ||
          adminComments ||
          `Status transitioned from "${complaint.status}" to "${status}" by administrator.`;

        complaint.statusHistory.push({
          status,
          changedAt: new Date(),
          comment,
        });

        complaint.status = status;
      }
    }

    // Update departmental assignments
    if (assignedDepartment !== undefined) {
      complaint.assignedDepartment = assignedDepartment.trim();
    }

    if (assignedStaff !== undefined) {
      complaint.assignedStaff = assignedStaff.trim();
    }

    // Update admin notes and resolution details
    if (adminComments !== undefined) {
      complaint.adminComments = adminComments.trim();
    }

    if (resolutionDetails !== undefined) {
      complaint.resolutionDetails = resolutionDetails.trim();
    }

    // Optional priority adjustment
    if (priority !== undefined) {
      const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority: "${priority}". Valid priorities are: ${validPriorities.join(', ')}`,
        });
      }
      complaint.priority = priority;
    }

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      'student',
      'name email studentId department phone'
    );

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Admin can delete any; Student can delete only own 'Submitted' complaint)
// @route   DELETE /api/complaints/:id
// @access  Private (Owner Student / Admin)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const isOwner = complaint.student.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this complaint',
      });
    }

    // If student is deleting, only allow if complaint has not progressed past 'Submitted'
    if (!isAdmin && complaint.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete complaint that is already "${complaint.status}". Only newly submitted complaints can be canceled.`,
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  getAdminComplaints,
  updateComplaint,
  deleteComplaint,
};
