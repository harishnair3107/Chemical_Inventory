const express = require('express');
const {
    registerEmployee,
    employeeLogin,
    adminLogin,
    verifyAdminOtp,
    approveEmployee,
    rejectEmployee,
    removeEmployee,
    logoutEmployee,
    getActiveEmployees
} = require('./auth.controller');
const router = express.Router();

// Employee routes
router.post('/register', registerEmployee);
router.post('/login', employeeLogin);
router.post('/logout', logoutEmployee);

// Admin routes
router.post('/admin/login', adminLogin);
router.post('/admin/verify', verifyAdminOtp);
router.get('/pending', getPendingEmployees);
router.get('/employees', getActiveEmployees);
router.put('/approve/:id', approveEmployee);
router.delete('/reject/:id', rejectEmployee);
router.delete('/remove/:id', removeEmployee);

module.exports = router;
