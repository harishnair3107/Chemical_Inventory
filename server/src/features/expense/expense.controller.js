const Expense = require('./expense.model');

const createExpense = async (req, res) => {
    try {
        const { category, amount, date, notes } = req.body;
        const expense = await Expense.create({ category, amount, date, notes });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createExpense, getExpenses };
