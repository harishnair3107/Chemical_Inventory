const Sale = require('./sale.model');

const getSalesLogs = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.userId = userId;
        }

        const sales = await Sale.find(query).sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSalesStats = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.userId = userId;
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const monthlySales = await Sale.aggregate([
            { $match: { ...query, createdAt: { $gte: startOfMonth }, isPaymentReceived: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const yearlySales = await Sale.aggregate([
            { $match: { ...query, createdAt: { $gte: startOfYear }, isPaymentReceived: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            monthly: monthlySales[0]?.total || 0,
            yearly: yearlySales[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSalePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPaymentReceived, paymentMethod } = req.body;
        
        const sale = await Sale.findById(id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        
        // Cannot change if already locked, unless admin maybe? But prompt says "once payment done status is active employee cannot change it".
        // Controller will enforce it primarily, but front-end will hide it.
        // Let's just update it here.
        if (sale.isPaymentReceived) {
            return res.status(400).json({ message: 'Payment is already finalized and locked.' });
        }

        if (paymentMethod) sale.paymentMethod = paymentMethod;
        if (isPaymentReceived !== undefined) sale.isPaymentReceived = isPaymentReceived;

        await sale.save();
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSalesLogs, getSalesStats, updateSalePayment };
