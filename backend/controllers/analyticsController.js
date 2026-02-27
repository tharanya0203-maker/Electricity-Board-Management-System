const Bill = require('../models/Bill');
const User = require('../models/User');
const { calculateBill, predictNextMonth } = require('../utils/billCalculator');

// @desc    Get monthly consumption analytics for a user
// @route   GET /api/analytics/user/:userId/monthly
// @access  Private
const getMonthlyConsumption = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get last 6 months of data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const bills = await Bill.find({ 
      userId,
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ year: 1, month: 1 });

    // Group by month and year
    const monthlyData = bills.map(bill => ({
      month: `${bill.month} ${bill.year}`,
      units: bill.unitsConsumed,
      billAmount: bill.billAmount,
      status: bill.status
    }));

    res.json(monthlyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get consumption comparison for last 6 months
// @route   GET /api/analytics/user/:userId/comparison
// @access  Private
const getConsumptionComparison = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get last 6 months of data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const bills = await Bill.find({ 
      userId,
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ year: 1, month: 1 });

    // Prepare comparison data
    const comparisonData = {
      totalUnits: 0,
      totalAmount: 0,
      avgUnits: 0,
      avgAmount: 0,
      maxUnits: 0,
      maxAmount: 0,
      minUnits: Infinity,
      minAmount: Infinity,
      monthlyData: []
    };

    bills.forEach(bill => {
      comparisonData.totalUnits += bill.unitsConsumed;
      comparisonData.totalAmount += bill.billAmount;
      
      if (bill.unitsConsumed > comparisonData.maxUnits) {
        comparisonData.maxUnits = bill.unitsConsumed;
      }
      if (bill.billAmount > comparisonData.maxAmount) {
        comparisonData.maxAmount = bill.billAmount;
      }
      if (bill.unitsConsumed < comparisonData.minUnits) {
        comparisonData.minUnits = bill.unitsConsumed;
      }
      if (bill.billAmount < comparisonData.minAmount) {
        comparisonData.minAmount = bill.billAmount;
      }

      comparisonData.monthlyData.push({
        month: `${bill.month} ${bill.year}`,
        units: bill.unitsConsumed,
        billAmount: bill.billAmount,
        status: bill.status
      });
    });

    comparisonData.avgUnits = bills.length > 0 ? Math.round(comparisonData.totalUnits / bills.length) : 0;
    comparisonData.avgAmount = bills.length > 0 ? Math.round(comparisonData.totalAmount / bills.length) : 0;
    comparisonData.minUnits = comparisonData.minUnits === Infinity ? 0 : comparisonData.minUnits;
    comparisonData.minAmount = comparisonData.minAmount === Infinity ? 0 : comparisonData.minAmount;

    res.json(comparisonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get yearly consumption summary
// @route   GET /api/analytics/user/:userId/yearly
// @access  Private
const getYearlySummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bills = await Bill.find({ userId });

    // Group by year
    const yearlyData = {};
    bills.forEach(bill => {
      if (!yearlyData[bill.year]) {
        yearlyData[bill.year] = {
          totalUnits: 0,
          totalAmount: 0,
          months: {}
        };
      }
      
      yearlyData[bill.year].totalUnits += bill.unitsConsumed;
      yearlyData[bill.year].totalAmount += bill.billAmount;
      
      if (!yearlyData[bill.year].months[bill.month]) {
        yearlyData[bill.year].months[bill.month] = {
          units: bill.unitsConsumed,
          amount: bill.billAmount
        };
      }
    });

    res.json(yearlyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get high usage alerts
// @route   GET /api/analytics/user/:userId/alerts
// @access  Private
const getHighUsageAlerts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own data or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get last 3 months of data
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const bills = await Bill.find({ 
      userId,
      createdAt: { $gte: threeMonthsAgo }
    }).sort({ year: -1, month: -1 });

    if (bills.length < 2) {
      return res.json({
        alerts: [],
        message: 'Insufficient data for usage analysis'
      });
    }

    // Calculate average of previous months
    const previousBills = bills.slice(1); // Exclude the most recent
    const avgUnits = previousBills.reduce((sum, bill) => sum + bill.unitsConsumed, 0) / previousBills.length;
    
    // Check if current month is higher than average
    const currentBill = bills[0]; // Most recent bill
    const alerts = [];

    if (currentBill.unitsConsumed > avgUnits * 1.2) { // Alert if 20% higher than average
      alerts.push({
        type: 'high_usage',
        message: `High usage detected: ${currentBill.unitsConsumed} units compared to average of ${Math.round(avgUnits)} units`,
        month: `${currentBill.month} ${currentBill.year}`,
        units: currentBill.unitsConsumed,
        average: Math.round(avgUnits),
        percentage: Math.round(((currentBill.unitsConsumed - avgUnits) / avgUnits) * 100)
      });
    }

    res.json({
      alerts,
      currentMonth: {
        month: `${currentBill.month} ${currentBill.year}`,
        units: currentBill.unitsConsumed
      },
      average: Math.round(avgUnits)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMonthlyConsumption,
  getConsumptionComparison,
  getYearlySummary,
  getHighUsageAlerts
};