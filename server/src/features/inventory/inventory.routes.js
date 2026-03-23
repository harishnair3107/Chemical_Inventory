const express = require('express');
const { getAllChemicals, getChemicalById, createChemical, updateChemical, deleteChemical, updateStatus, getAlerts, getInventoryReport } = require('./inventory.controller');
const router = express.Router();

router.get('/', getAllChemicals);
router.get('/alerts', getAlerts);
router.get('/report', getInventoryReport);
router.get('/:id', getChemicalById);
router.post('/', createChemical);
router.put('/:id', updateChemical);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteChemical);

module.exports = router;
