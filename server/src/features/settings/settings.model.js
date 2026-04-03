const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    lowStockThreshold: { type: Number, default: 10 },
    expiryAlertDays: { type: Number, default: 30 },
    adminEmail: { type: String, default: 'harishnair3107@gmail.com' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
