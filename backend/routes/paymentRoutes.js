const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { 
  makePayment,
  getUserPaymentHistory,
  getAllPayments,
  downloadReceipt
} = require('../controllers/paymentController');

router.route('/')
  .post(protect, makePayment)
  .get(protect, adminOnly, getAllPayments);

router.route('/user/:userId')
  .get(protect, getUserPaymentHistory);

router.route('/:paymentId/receipt')
  .get(protect, downloadReceipt);

module.exports = router;