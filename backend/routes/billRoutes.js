const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { 
  addMonthlyUnits,
  getUserBills,
  getAllBills,
  updateBillStatus,
  getUserUsageHistory,
  getPredictedBill
} = require('../controllers/billController');

// All routes except adding units are protected
router.route('/')
  .post(protect, (req, res, next) => {
    // Allow admin and subadmin to add units
    if (req.user.role === 'admin' || req.user.role === 'subadmin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  }, addMonthlyUnits)
  .get(protect, adminOnly, getAllBills);

router.route('/user/:userId')
  .get(protect, getUserBills);

router.route('/:id')
  .put(protect, adminOnly, updateBillStatus);

router.route('/user/:userId/history')
  .get(protect, getUserUsageHistory);

router.route('/user/:userId/predict')
  .get(protect, getPredictedBill);

module.exports = router;