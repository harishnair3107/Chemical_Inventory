const Sale = require('../sales/sale.model');
const Chemical = require('../inventory/inventory.model');

const getTopSold = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const topSold = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: "$chemicalName", totalQuantity: { $sum: "$quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        res.json(topSold.map(item => ({ name: item._id, quantity: item.totalQuantity })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConsumptionTrend = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trend = await Sale.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        chemical: "$chemicalName"
                    },
                    quantity: { $sum: "$quantity" }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        res.json(trend.map(item => ({
            date: item._id.date,
            chemical: item._id.chemical,
            quantity: item.quantity
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSalesHeatmap = async (req, res) => {
    try {
        const heatmap = await Sale.aggregate([
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    salesCount: { $sum: 1 }
                }
            }
        ]);

        res.json(heatmap.map(item => ({
            day: item._id.dayOfWeek - 1, // Convert 1-7 (Sun-Sat) to 0-6
            hour: item._id.hour,
            count: item.salesCount
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryForecast = async (req, res) => {
    try {
        const chemicals = await Chemical.find({ quantity: { $gt: 0 } });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Calculate average daily consumption over last 30 days
        const salesStats = await Sale.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$chemicalName", totalQuantity: { $sum: "$quantity" } } }
        ]);

        const forecast = chemicals.map(chem => {
            const sale = salesStats.find(s => s._id === chem.name);
            const avgDaily = sale ? (sale.totalQuantity / 30) : 0;
            const daysRemaining = avgDaily > 0 ? (chem.quantity / avgDaily) : Infinity;
            
            return {
                name: chem.name,
                currentQuantity: chem.quantity,
                unit: chem.unit,
                avgDailyConsumption: avgDaily.toFixed(2),
                daysUntilEmpty: daysRemaining === Infinity ? 'N/A' : Math.round(daysRemaining),
                predictedDate: daysRemaining === Infinity ? 'N/A' : new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0]
            };
        });

        res.json(forecast.sort((a, b) => (typeof a.daysUntilEmpty === 'number' ? a.daysUntilEmpty : 999) - (typeof b.daysUntilEmpty === 'number' ? b.daysUntilEmpty : 999)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfitabilityRanking = async (req, res) => {
    try {
        const ranking = await Sale.aggregate([
            { $match: { isPaymentReceived: true } },
            { $group: { _id: "$chemicalName", totalRevenue: { $sum: "$amount" } } },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.json(ranking.map(item => ({ name: item._id, revenue: item.totalRevenue })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTopSold,
    getConsumptionTrend,
    getSalesHeatmap,
    getInventoryForecast,
    getProfitabilityRanking
};
