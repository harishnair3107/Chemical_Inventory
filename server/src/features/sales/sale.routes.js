const express = require('express');
const { getSalesLogs, getSalesStats, updateSalePayment } = require('./sale.controller');
const router = express.Router();

router.get('/logs', getSalesLogs);
router.get('/stats', getSalesStats);
router.patch('/:id/payment', updateSalePayment);

module.exports = router;
