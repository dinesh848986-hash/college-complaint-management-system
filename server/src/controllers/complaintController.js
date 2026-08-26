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

module.exports = {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
};
