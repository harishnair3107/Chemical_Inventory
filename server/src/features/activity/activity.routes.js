const express = require('express');
const { getActivities, updateActivityStatus } = require('./activity.controller');
const router = express.Router();

router.get('/', getActivities);
router.patch('/:id/status', updateActivityStatus);

module.exports = router;
