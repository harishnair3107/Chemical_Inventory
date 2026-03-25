const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    chemicalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemical', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, required: true },
    isDelivered: { type: Boolean, default: false },
    isPaymentReceived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryUpdate', updateSchema);
