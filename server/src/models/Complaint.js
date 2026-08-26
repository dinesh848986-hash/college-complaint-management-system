const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
      ],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Classroom',
          'Laboratory',
          'Hostel',
          'Wi-Fi',
          'Infrastructure',
          'Transportation',
          'Cleanliness',
          'Other',
        ],
        message: '{VALUE} is not a valid complaint category',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    attachment: {
      filename: { type: String, default: null },
      originalName: { type: String, default: null },
      path: { type: String, default: null },
      mimetype: { type: String, default: null },
      size: { type: Number, default: 0 },
      url: { type: String, default: null },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          'Submitted',
          'Under Review',
          'Assigned',
          'In Progress',
          'Resolved',
          'Closed',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'Submitted',
    },
    assignedDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    assignedStaff: {
      type: String,
      trim: true,
      default: '',
    },
    adminComments: {
      type: String,
      trim: true,
      default: '',
    },
    resolutionDetails: {
      type: String,
      trim: true,
      default: '',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index for fast query by student and sorting by creation date
complaintSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
