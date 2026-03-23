const Chemical = require('./inventory.model');
const logActivity = require('../activity/activity.controller').logActivity; // Assuming logActivity is in activity.controller

const getAllChemicals = async (req, res) => {
    try {
        const chemicals = await Chemical.find();
        res.json(chemicals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChemicalById = async (req, res) => {
    try {
        const chemical = await Chemical.findById(req.params.id);
        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });
        res.json(chemical);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createChemical = async (req, res) => {
    try {
        const { userId, username, ...chemicalData } = req.body;
        const chemical = new Chemical(chemicalData);
        await chemical.save();

        if (userId && username) {
            await logActivity({
                user: userId,
                username,
                action: 'Inventory Added',
                details: `${username} added new chemical: ${chemical.name}`,
                role: 'employee'
            });
        }

        res.status(201).json(chemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateChemical = async (req, res) => {
    try {
        const chemical = await Chemical.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });
        res.json(chemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteChemical = async (req, res) => {
    try {
        const chemical = await Chemical.findByIdAndDelete(req.params.id);
        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });
        res.json({ message: 'Chemical deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status, userId, username } = req.body;
        const chemical = await Chemical.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );

        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });

        await logActivity({
            user: userId,
            username,
            action: 'Status Update',
            details: `${username} updated ${chemical.name} to ${status}`,
            role: 'employee'
        });

        res.json(chemical);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAlerts = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringSoon = await Chemical.find({
            expiryDate: { $lte: thirtyDaysFromNow, $gt: today }
        });

        const lowStock = await Chemical.find({
            quantity: { $lt: 10 }
        });

        res.json({ expiringSoon, lowStock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryReport = async (req, res) => {
    try {
        const chemicals = await Chemical.find();
        // Simple JSON report, client can convert to CSV
        res.json({
            generatedAt: new Date(),
            totalChemicals: chemicals.length,
            data: chemicals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllChemicals,
    getChemicalById,
    createChemical,
    updateChemical,
    deleteChemical,
    updateStatus,
    getAlerts,
    getInventoryReport
};
