const express = require('express');
const { createTask, getTasks, updateTaskStatus } = require('./task.controller');
const router = express.Router();

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
