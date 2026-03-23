const mongoose = require('mongoose');

const chemicalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    formula: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    storageLocation: { type: String, required: true },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['Available', 'Low', 'Refilled', 'Completed'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Chemical', chemicalSchema);
