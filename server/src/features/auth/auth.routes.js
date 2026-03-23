const express = require('express');
const {
    registerEmployee,
    employeeLogin,
    adminLogin,
    verifyAdminOtp,
    getPendingEmployees,
    approveEmployee,
    rejectEmployee
} = require('./auth.controller');
const router = express.Router();

// Employee routes
router.post('/register', registerEmployee);
router.post('/login', employeeLogin);

// Admin routes
router.post('/admin/login', adminLogin);
router.post('/admin/verify', verifyAdminOtp);
router.get('/pending', getPendingEmployees);
router.put('/approve/:id', approveEmployee);
router.delete('/reject/:id', rejectEmployee);

module.exports = router;
