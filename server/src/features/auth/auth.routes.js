const express = require('express');
const {
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
} = require('./auth.controller');
const router = express.Router();

// Employee routes
router.post('/register', registerEmployee);
router.post('/login', employeeLogin);
router.post('/logout', logoutEmployee);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin routes
router.post('/admin/login', adminLogin);
router.post('/admin/verify', verifyAdminOtp);
router.get('/pending', getPendingEmployees);
router.get('/employees', getActiveEmployees);
router.put('/approve/:id', approveEmployee);
router.delete('/reject/:id', rejectEmployee);
router.delete('/remove/:id', removeEmployee);

module.exports = router;
