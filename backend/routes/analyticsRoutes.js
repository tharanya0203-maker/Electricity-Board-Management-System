const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getMonthlyConsumption,
  getConsumptionComparison,
  getYearlySummary,
  getHighUsageAlerts
} = require('../controllers/analyticsController');

router.route('/user/:userId/monthly')
  .get(protect, getMonthlyConsumption);

router.route('/user/:userId/comparison')
  .get(protect, getConsumptionComparison);

router.route('/user/:userId/yearly')
  .get(protect, getYearlySummary);

router.route('/user/:userId/alerts')
  .get(protect, getHighUsageAlerts);

module.exports = router;