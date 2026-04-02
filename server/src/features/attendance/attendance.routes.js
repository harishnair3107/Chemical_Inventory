const express = require('express');
const router = express.Router();
const { getAttendance } = require('./attendance.controller');

router.get('/', getAttendance);

module.exports = router;
