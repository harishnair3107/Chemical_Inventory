const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: { type: String, enum: ['Salary', 'Electricity', 'Water', 'Land Tax'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true }, // The month/year this expense applies to
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
