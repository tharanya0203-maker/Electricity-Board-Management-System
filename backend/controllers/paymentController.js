const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const User = require('../models/User');
const generateReceipt = require('../utils/generateReceipt');
const { calculateTotalBill } = require('../utils/billCalculator');

// @desc    Make a payment for a bill
// @route   POST /api/payments
// @access  Private
const makePayment = async (req, res) => {
  try {
    const { billId, amountPaid, transactionId } = req.body;

    // Find the bill
    const bill = await Bill.findById(billId).populate('userId');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify the user owns this bill or is an admin/subadmin
    if (req.user.id.toString() !== bill.userId._id.toString() && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if bill is already paid
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Validate payment amount
    const totalAmount = calculateTotalBill(bill.billAmount, bill.dueAmount || 0);
    if (amountPaid < totalAmount) {
      return res.status(400).json({ message: `Payment amount is less than total bill amount of ₹${totalAmount}` });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: bill.userId._id,
      billId: bill._id,
      amountPaid,
      transactionId
    });

    // Update bill status to paid
    bill.status = 'paid';
    await bill.save();

    // If there's a due amount, clear it
    if (bill.dueAmount > 0) {
      bill.dueAmount = 0;
      await bill.save();
    }

    res.status(201).json({
      payment,
      message: 'Payment successful',
      bill: {
        ...bill.toObject(),
        status: 'paid'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during payment' });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/user/:userId
// @access  Private
const getUserPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Payment.find({ userId })
      .populate('userId', 'name email ebId')
      .populate('billId', 'month year unitsConsumed billAmount status')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all payments (admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('userId', 'name email ebId')
      .populate('billId', 'month year unitsConsumed billAmount status')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download receipt for a payment
// @route   GET /api/payments/:paymentId/receipt
// @access  Private
const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the payment
    const payment = await Payment.findById(paymentId)
      .populate('userId', 'name email ebId address')
      .populate('billId', 'month year unitsConsumed billAmount dueAmount status');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is authorized to access this receipt
    if (req.user.id.toString() !== payment.userId._id.toString() && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare payment data for receipt
    const paymentData = {
      name: payment.userId.name,
      ebId: payment.userId.ebId,
      address: payment.userId.address,
      month: payment.billId.month,
      year: payment.billId.year,
      unitsConsumed: payment.billId.unitsConsumed,
      billAmount: payment.billId.billAmount,
      dueAmount: payment.billId.dueAmount || 0,
      totalAmount: payment.billId.billAmount + (payment.billId.dueAmount || 0),
      amountPaid: payment.amountPaid,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate.toLocaleDateString(),
      status: payment.billId.status
    };

    // Generate and send PDF receipt
    generateReceipt(paymentData, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating receipt' });
  }
};

module.exports = {
  makePayment,
  getUserPaymentHistory,
  getAllPayments,
  downloadReceipt
};