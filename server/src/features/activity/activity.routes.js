const express = require('express');
const { getActivities } = require('./activity.controller');
const router = express.Router();

router.get('/', getActivities);

module.exports = router;
