const Attendance = require('./attendance.model');

const logAttendance = async (data) => {
    try {
        await Attendance.create(data);
    } catch (error) {
        console.error('Failed to log attendance:', error);
    }
};

const getAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

        if (date) {
            // date is in YYYY-MM-DD format from sv-SE locale
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);
            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const logs = await Attendance.find(query)
            .sort({ createdAt: -1 })
            .limit(100);
            
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { logAttendance, getAttendance };
