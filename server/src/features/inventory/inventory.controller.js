const Chemical = require('./inventory.model');
const InventoryUpdate = require('./update.model');
const logActivity = require('../activity/activity.controller').logActivity;

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
        const { userId, username, role, ...chemicalData } = req.body;
        
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can add chemicals' });
        }

        const chemical = new Chemical(chemicalData);
        await chemical.save();

        await logActivity({
            user: userId,
            username,
            action: 'Inventory Added',
            details: `${username} added new chemical: ${chemical.name}`,
            role: 'admin'
        });

        res.status(201).json(chemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateChemical = async (req, res) => {
    try {
        const { role, userId, username, ...updateData } = req.body;
        
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can modify chemical details' });
        }

        const chemical = await Chemical.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });

        await logActivity({
            user: userId,
            username,
            action: 'Inventory Modified',
            details: `${username} updated details for ${chemical.name}`,
            role: 'admin'
        });

        res.json(chemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteChemical = async (req, res) => {
    try {
        const { role, userId, username } = req.body;

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete chemicals' });
        }

        const chemical = await Chemical.findByIdAndDelete(req.params.id);
        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });

        await logActivity({
            user: userId,
            username,
            action: 'Inventory Deleted',
            details: `${username} deleted chemical: ${chemical.name}`,
            role: 'admin'
        });

        res.json({ message: 'Chemical deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const recordUpdate = async (req, res) => {
    try {
        let { newQuantity, soldQuantity, reason, isDelivered, isPaymentReceived, userId, username, role } = req.body;
        
        if (!userId || !username || !reason) {
            return res.status(400).json({ message: 'Missing required fields: userId, username, or reason' });
        }

        const chemical = await Chemical.findById(req.params.id);

        if (!chemical) return res.status(404).json({ message: 'Chemical not found' });

        const previousQuantity = chemical.quantity;
        let finalQuantity;
        let details = '';

        if (role === 'admin' && newQuantity !== undefined) {
            finalQuantity = Number(newQuantity);
            details = `${username} (Admin) updated ${chemical.name}. Total changed from ${previousQuantity} to ${finalQuantity}. Reason: ${reason}`;
        } else if (soldQuantity !== undefined) {
            const sold = Number(soldQuantity);
            if (sold > previousQuantity) {
                return res.status(400).json({ message: `Cannot sell ${sold}. Only ${previousQuantity} available.` });
            }
            finalQuantity = previousQuantity - sold;
            details = `${username} recorded sale of ${chemical.name}. Initial: ${previousQuantity}, Sold: ${sold}, Remaining: ${finalQuantity}. Reason: ${reason}`;
        } else if (newQuantity !== undefined) {
             // Fallback for direct update if still used
            finalQuantity = Number(newQuantity);
            if (role !== 'admin' && finalQuantity > previousQuantity) {
                return res.status(400).json({ message: 'Employees cannot increase stock' });
            }
            details = `${username} updated ${chemical.name} quantity to ${finalQuantity}. Reason: ${reason}`;
        } else {
            return res.status(400).json({ message: 'Quantity update missing' });
        }

        if (isNaN(finalQuantity)) {
            return res.status(400).json({ message: 'Invalid quantity calculation' });
        }

        chemical.quantity = finalQuantity;
        let finalStatus = 'Available';
        if (finalQuantity === 0) finalStatus = 'Out of Stock';
        else if (finalQuantity < 10) finalStatus = 'Low Stock';

        const updatedChemical = await Chemical.findByIdAndUpdate(
            req.params.id,
            { quantity: finalQuantity, status: finalStatus },
            { new: true, runValidators: true }
        );

        const updateRecord = await InventoryUpdate.create({
            chemicalId: chemical._id,
            userId,
            username,
            newQuantity: finalQuantity,
            reason,
            isDelivered,
            isPaymentReceived
        });

        await logActivity({
            user: userId,
            username,
            action: 'Stock Update',
            details,
            role: role || 'employee',
            isDelivered,
            isPaymentReceived
        });

        res.json({ message: 'Update recorded', chemical: updatedChemical, updateRecord });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
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
            details: `${username} updated ${chemical.name} status to ${status}`,
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
            quantity: { $gt: 0, $lt: 10 }
        });

        const emptyStock = await Chemical.find({
            quantity: 0
        });

        res.json({ expiringSoon, lowStock, emptyStock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventoryReport = async (req, res) => {
    try {
        const chemicals = await Chemical.find();
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
    recordUpdate,
    getAlerts,
    getInventoryReport
};
