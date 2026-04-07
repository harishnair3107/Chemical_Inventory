const Sale = require('./sale.model');
const Expense = require('../expense/expense.model');

const getSalesLogs = async (req, res) => {
    try {
        const { userId, paymentMethod } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        if (paymentMethod && paymentMethod !== 'All') query.paymentMethod = paymentMethod;

        const sales = await Sale.find(query).sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSalesStats = async (req, res) => {
    try {
        const { userId, month, year, paymentMethod } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        if (paymentMethod && paymentMethod !== 'All') query.paymentMethod = paymentMethod;

        const now = new Date();
        const selectedYear = year ? parseInt(year) : now.getFullYear();
        const selectedMonth = month ? parseInt(month) : now.getMonth();

        // 1. Monthly Filter Configuration
        // Create range for specifically selected month/year
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

        // 2. Yearly Filter Configuration
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

        // 3. Aggregate Monthly Sales (Paid only)
        const monthlySalesObj = await Sale.aggregate([
            { $match: { ...query, isPaymentReceived: true, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const monthlySales = monthlySalesObj[0]?.total || 0;

        // 4. Aggregate Yearly Sales (Paid only)
        const yearlySalesObj = await Sale.aggregate([
            { $match: { ...query, isPaymentReceived: true, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const yearlySales = yearlySalesObj[0]?.total || 0;

        // 5. Calculate Expenses
        // Monthly Expenses = Salary + Electricity for the specific month
        const monthlyExpensesObj = await Expense.aggregate([
            { $match: { date: { $gte: startOfMonth, $lte: endOfMonth }, category: { $in: ['Salary', 'Electricity'] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const monthlyExpenses = monthlyExpensesObj[0]?.total || 0;

        // Yearly Expenses = All expenses (Salary, Electricity, Water, Land) for the specific year
        const yearlyExpensesObj = await Expense.aggregate([
            { $match: { date: { $gte: startOfYear, $lte: endOfYear } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const yearlyExpenses = yearlyExpensesObj[0]?.total || 0;

        res.json({
            monthlySales,
            yearlySales,
            monthlyProfit: monthlySales - monthlyExpenses,
            yearlyProfit: yearlySales - yearlyExpenses
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
