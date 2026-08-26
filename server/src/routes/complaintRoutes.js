const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All complaint routes are protected
router.use(protect);

router.post('/', upload.single('attachment'), createComplaint);
router.get('/', getStudentComplaints);
router.get('/:id', getComplaintById);

module.exports = router;
