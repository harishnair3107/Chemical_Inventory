const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    action: { type: String, enum: ['Login', 'Logout'], required: true },
    role: { type: String, default: 'employee' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
