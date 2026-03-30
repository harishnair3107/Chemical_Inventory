const Activity = require('./activity.model');

const getActivities = async (req, res) => {
    try {
        const { role, userId, date, actions } = req.query;
        let query = {};

        if (role === 'employee' && userId) {
            query.user = userId;
        }

        if (actions) {
            query.action = { $in: actions.split(',') };
        }

        const { targetRole } = req.query;
        if (targetRole) {
            query.role = targetRole;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
        // Admin sees everything if no specific filter

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .limit(100);
            
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logActivity = async (data) => {
    try {
        await Activity.create(data);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

const updateActivityStatus = async (req, res) => {
    try {
        const { isDelivered, isPaymentReceived } = req.body;
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { isDelivered, isPaymentReceived },
            { returnDocument: 'after' }
        );
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActivities, logActivity, updateActivityStatus };
