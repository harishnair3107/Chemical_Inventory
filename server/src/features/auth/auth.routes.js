const express = require('express');
const {
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
} = require('./auth.controller');
const router = express.Router();

// Employee routes
router.post('/register', registerEmployee);
router.post('/login', employeeLogin);
router.post('/logout', logoutEmployee);
router.post('/forgot-password', forgotPassword);
router.get('/reset-status/:userId', getEmployeeResetStatus);

// Admin routes
router.post('/admin/login', adminLogin);
router.get('/reset-requests', getResetRequests);
router.put('/complete-reset/:id', completeResetRequest);
router.get('/pending', getPendingEmployees);
router.get('/employees', getActiveEmployees);
router.put('/approve/:id', approveEmployee);
router.delete('/reject/:id', rejectEmployee);
router.delete('/remove/:id', removeEmployee);

module.exports = router;
