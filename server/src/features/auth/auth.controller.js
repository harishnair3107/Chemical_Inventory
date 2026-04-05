const User = require('./auth.model');
const Settings = require('../settings/settings.model');
const ResetRequest = require('./resetRequest.model');
const { logActivity } = require('../activity/activity.controller');
const { logAttendance } = require('../attendance/attendance.controller');

const getAdminEmail = async () => {
    const settings = await Settings.findOne();
    return settings ? settings.adminEmail : 'raunak1718@gmail.com';
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
        const { email, password } = req.body;
        const adminEmail = await getAdminEmail();
        
        console.log(`--- ADMIN LOGIN DIAGNOSTIC ---`);
        console.log(`Incoming Email: ${email}`);
        
        if (email !== adminEmail) {
            return res.status(401).json({ message: 'Access denied. Unauthorized email.' });
        }
        
        let user = await User.findOne({ email, role: 'admin' });
        
        // Auto-initialization logic for first-time or transition
        if (!user) {
            console.log(`Information: Creating new Admin record for ${email}`);
            user = await User.create({
                username: 'Admin',
                email: adminEmail,
                password: 'admin123', // Default password for transition
                role: 'admin',
                status: 'active'
            });
        } else if (user.password === 'SYSTEM_MANAGED') {
            // Update legacy admin to have a usable password
            user.password = 'admin123';
            await user.save();
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid Admin password' });
        }

        await logActivity({
            user: user._id,
            username: user.username,
            action: 'Login',
            details: `Admin logged into the system via password`,
            role: 'admin'
        });

        res.json({
            message: 'Admin Login successful',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('❌ Admin Login Error:', error);
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

        // Check if there is already a pending request
        const existingRequest = await ResetRequest.findOne({ userId: user._id, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'A reset request is already pending with the admin.' });
        }

        await ResetRequest.create({
            userId: user._id,
            username: user.username,
            email: user.email
        });

        res.json({ message: 'Password reset request sent to Admin. Please check back later or contact Admin directly.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResetRequests = async (req, res) => {
    try {
        const requests = await ResetRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const completeResetRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword, adminNote } = req.body;

        const request = await ResetRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const user = await User.findById(request.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update password
        user.password = newPassword;
        await user.save();

        // Mark request as completed
        request.status = 'completed';
        request.adminNote = adminNote;
        request.newPasswordSet = newPassword; // Store to show employee if needed
        await request.save();

        await logActivity({
            user: user._id,
            username: 'Admin',
            action: 'Password Manual Reset',
            details: `Admin reset password for ${user.username} with note: ${adminNote}`,
            role: 'admin'
        });

        res.json({ message: 'Password updated and request completed.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEmployeeResetStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const request = await ResetRequest.findOne({ userId }).sort({ updatedAt: -1 });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerEmployee, 
    employeeLogin, 
    adminLogin, 
    getPendingEmployees, 
    approveEmployee, 
    rejectEmployee,
    removeEmployee,
    logoutEmployee,
    getActiveEmployees,
    forgotPassword,
    getResetRequests,
    completeResetRequest,
    getEmployeeResetStatus
};
