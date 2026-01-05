const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.post('/', ReportController.generateReport);

module.exports = router;
