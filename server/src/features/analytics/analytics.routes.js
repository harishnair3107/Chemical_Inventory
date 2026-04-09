const express = require('express');
const {
    getTopSold,
    getConsumptionTrend,
    getSalesHeatmap,
    getInventoryForecast,
    getProfitabilityRanking
} = require('./analytics.controller');
const router = express.Router();

router.get('/top-sold', getTopSold);
router.get('/consumption-trend', getConsumptionTrend);
router.get('/heatmap', getSalesHeatmap);
router.get('/forecast', getInventoryForecast);
router.get('/profitability', getProfitabilityRanking);

module.exports = router;
