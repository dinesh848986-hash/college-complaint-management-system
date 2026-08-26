const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  getAdminComplaints,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All complaint routes are protected
router.use(protect);

router.post('/', upload.single('attachment'), createComplaint);
router.get('/', getStudentComplaints);

// Admin-only global queue (must precede /:id)
router.get('/admin', authorize('admin'), getAdminComplaints);

// Individual complaint routes
router.get('/:id', getComplaintById);
router.patch('/:id', authorize('admin'), updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
