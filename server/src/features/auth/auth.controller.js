const User = require('./auth.model');
const { sendOtpMail } = require('../../utils/mailer');
const { logActivity } = require('../activity/activity.controller');

const ADMIN_EMAIL = 'harishnair3107@gmail.com';

const registerEmployee = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (email === ADMIN_EMAIL) return res.status(403).json({ message: 'Admin cannot register via this route.' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            username,
            password,
            email,
            role: 'employee',
            status: 'pending'
        });

        res.status(201).json({ message: 'Registration request sent. Waiting for admin approval.', user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'employee' });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending approval by admin' });
        }

        res.json({
            message: 'Login successful',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email } = req.body;
        if (email !== ADMIN_EMAIL) return res.status(401).json({ message: 'Access denied. Unauthorized email.' });

        let user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            // Create admin if not exists (only for this specific email)
            user = await User.create({
                username: 'Admin',
                email: ADMIN_EMAIL,
                password: 'SYSTEM_MANAGED', // No password login
                role: 'admin',
                status: 'active'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        const sent = await sendOtpMail(email, otp);
        if (!sent) return res.status(500).json({ message: 'Failed to send OTP' });

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyAdminOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (email !== ADMIN_EMAIL) return res.status(401).json({ message: 'Access denied' });

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(401).json({ message: 'Invalid or expired OTP' });

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            message: 'Admin Login successful',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingEmployees = async (req, res) => {
    try {
        const employees = await User.find({ status: 'pending', role: 'employee' });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveEmployee = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { returnDocument: 'after' });
        if (!user) return res.status(404).json({ message: 'Employee not found' });

        await logActivity({
            user: user._id, // In this case, the approved user is the subject/target
            username: 'Admin',
            action: 'Approved',
            details: `Admin approved registration for ${user.username}`,
            role: 'admin'
        });

        res.json({ message: 'Employee approved', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectEmployee = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Employee not found' });

        await logActivity({
            user: user._id,
            username: 'Admin',
            action: 'Rejected',
            details: `Admin rejected registration for ${user.username}`,
            role: 'admin'
        });

        res.json({ message: 'Employee request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActiveEmployees = async (req, res) => {
    try {
        const employees = await User.find({ status: 'active', role: 'employee' }).select('-password -otp -otpExpires');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerEmployee, 
    employeeLogin, 
    adminLogin, 
    verifyAdminOtp, 
    getPendingEmployees, 
    approveEmployee, 
    rejectEmployee,
    getActiveEmployees
};
