const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    chemicalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemical', required: true },
    chemicalName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Cheque', 'Cash', 'N/A'], default: 'N/A' },
    isPaymentReceived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
