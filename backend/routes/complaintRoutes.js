const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { 
  raiseComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById
} = require('../controllers/complaintController');

router.route('/')
  .post(protect, raiseComplaint)
  .get(protect, adminOnly, getAllComplaints);

router.route('/my')
  .get(protect, getMyComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, adminOnly, updateComplaintStatus);

module.exports = router;