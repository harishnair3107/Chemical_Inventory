const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    // Legacy Nodemailer OTP system removed
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
