const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    action: { type: String, required: true }, // e.g., 'Status Update', 'Refilled', 'Completed', 'Approved'
    details: { type: String, required: true }, // e.g., 'Updated Ethanol to Refilled'
    targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of Chemical or User
    role: { type: String, enum: ['admin', 'employee'], required: true },
    isDelivered: { type: Boolean, default: false },
    isPaymentReceived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
