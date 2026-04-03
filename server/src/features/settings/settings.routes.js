const express = require('express');
const { getSettings, updateSettings, testSmtp } = require('./settings.controller');
const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-mail', testSmtp);

module.exports = router;
