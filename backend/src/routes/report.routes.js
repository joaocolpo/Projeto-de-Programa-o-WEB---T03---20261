const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', reportController.getFinancialSummary);
router.get('/by-category', reportController.getExpensesByCategory);
router.get('/by-period', reportController.getExpensesByPeriod);

module.exports = router;
