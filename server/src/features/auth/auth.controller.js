const User = require('./auth.model');
const Settings = require('../settings/settings.model');
const { sendOtpMail } = require('../../utils/mailer');
const { logActivity } = require('../activity/activity.controller');
const { logAttendance } = require('../attendance/attendance.controller');

const getAdminEmail = async () => {
    const settings = await Settings.findOne();
    return settings ? settings.adminEmail : 'harishnair3107@gmail.com';
};

const registerEmployee = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const adminEmail = await getAdminEmail();
        if (email === adminEmail) return res.status(403).json({ message: 'Admin cannot register via this route.' });

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

        await logActivity({
            user: user._id,
            username: user.username,
            action: 'Login',
            details: `${user.username} logged into the system`,
            role: 'employee'
        });

        await logAttendance({
            user: user._id,
            username: user.username,
            action: 'Login',
            role: 'employee'
        });

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
const adminEmail = await getAdminEmail();
        if (email !== adminEmail) return res.status(401).json({ message: 'Access denied. Unauthorized email.' });

        let user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            // Create admin if not exists (only for this specific email)
            user = await User.create({
                username: 'Admin',
                email: adminEmail,
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
        const adminEmail = await getAdminEmail();
        if (email !== adminEmail) return res.status(401).json({ message: 'Access denied' });

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

const removeEmployee = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Employee not found' });

        await logActivity({
            user: user._id,
            username: 'Admin',
            action: 'Removed',
            details: `Admin removed employee account: ${user.username}`,
            role: 'admin'
        });

        res.json({ message: 'Employee removed successfully' });
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

const logoutEmployee = async (req, res) => {
    try {
        const { userId, username } = req.body;
        if (!userId || !username) return res.status(400).json({ message: 'User details required' });

        await logActivity({
            user: userId,
            username: username,
            action: 'Logout',
            details: `${username} logged out of the system`,
            role: 'employee'
        });

        await logAttendance({
            user: userId,
            username: username,
            action: 'Logout',
            role: 'employee'
        });

        res.json({ message: 'Logout activity recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        const sent = await sendOtpMail(
            email, 
            otp, 
            'Password Reset Code', 
            'Your password reset code for Chemical Inventory Management is:'
        );
        
        if (!sent) return res.status(500).json({ message: 'Failed to send reset code' });

        res.json({ message: 'Reset code sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(401).json({ message: 'Invalid or expired reset code' });

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        await logActivity({
            user: user._id,
            username: user.username,
            action: 'Password Reset',
            details: `${user.username} reset their password`,
            role: user.role
        });

        res.json({ message: 'Password updated successfully' });
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
    removeEmployee,
    logoutEmployee,
    getActiveEmployees,
    forgotPassword,
    resetPassword
};
