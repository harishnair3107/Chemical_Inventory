const mongoose = require('mongoose');

const resetRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    adminNote: { type: String, default: '' },
    newPasswordSet: { type: String, default: '' } // Optionally store the new pass temporarily for the employee
}, { timestamps: true });

module.exports = mongoose.model('ResetRequest', resetRequestSchema);
