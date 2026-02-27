const Bill = require('../models/Bill');
const User = require('../models/User');
const { calculateBill, predictNextMonth } = require('../utils/billCalculator');

// @desc    Add monthly units for a user
// @route   POST /api/bills
// @access  Private/Admin or Subadmin
const addMonthlyUnits = async (req, res) => {
  try {
    const { userId, month, year, unitsConsumed } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate bill amount based on units consumed
    const billAmount = calculateBill(unitsConsumed);

    // Check if bill for this month/year already exists
    const existingBill = await Bill.findOne({ userId, month, year });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill for this month and year already exists' });
    }

    // Create new bill
    const bill = await Bill.create({
      userId,
      month,
      year,
      unitsConsumed,
      billAmount,
      dueAmount: req.body.dueAmount || 0  // Allow admins to set due amount as payment demand
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's bills
// @route   GET /api/bills/user/:userId
// @access  Private/Admin or own profile
const getUserBills = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is trying to access their own bills or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bills = await Bill.find({ userId }).populate('userId', 'name email ebId').sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bills (admin only)
// @route   GET /api/bills
// @access  Private/Admin
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({})
      .populate('userId', 'name email ebId')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update bill status
// @route   PUT /api/bills/:id
// @access  Private/Admin
const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.status = status;
    await bill.save();

    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's usage history for analytics
// @route   GET /api/bills/user/:userId/history
// @access  Private
const getUserUsageHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bills = await Bill.find({ 
      userId,
      createdAt: { $gte: sixMonthsAgo }
    })
    .sort({ year: 1, month: 1 }); // Sort by year and month

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get predicted bill for user
// @route   GET /api/bills/user/:userId/predict
// @access  Private
const getPredictedBill = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get last 3 months of usage data
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const bills = await Bill.find({ 
      userId,
      createdAt: { $gte: threeMonthsAgo }
    }).sort({ year: -1, month: -1 }).limit(3);

    // Extract units consumed from bills
    const unitsArray = bills.map(bill => bill.unitsConsumed);

    // Predict next month's usage
    const predictedUnits = predictNextMonth(unitsArray);
    
    // Calculate predicted bill
    const predictedBill = calculateBill(predictedUnits);

    res.json({
      predictedUnits,
      predictedBill,
      lastThreeMonths: bills,
      message: unitsArray.length >= 3 
        ? 'Prediction based on last 3 months of usage' 
        : `Prediction based on ${unitsArray.length} month(s) of usage`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addMonthlyUnits,
  getUserBills,
  getAllBills,
  updateBillStatus,
  getUserUsageHistory,
  getPredictedBill
};