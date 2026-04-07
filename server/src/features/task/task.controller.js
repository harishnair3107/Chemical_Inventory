const Task = require('./task.model');
const User = require('../auth/auth.model'); // Assuming auth.model.js exports User
const Activity = require('../activity/activity.model'); 

const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, assignedBy, deadline } = req.body;

        const task = await Task.create({ title, description, assignedTo, assignedBy, deadline });

        // Optional: log to activity
        const assigner = await User.findById(assignedBy);
        const assignee = await User.findById(assignedTo);
        if (assigner && assignee) {
            await Activity.create({
                userId: assigner._id,
                username: assigner.username,
                role: assigner.role,
                action: 'Task Assigned',
                details: `${assigner.username} assigned task "${title}" to ${assignee.username}`
            });
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const { assignedTo, assignedBy } = req.query;
        let query = {};

        if (assignedTo) query.assignedTo = assignedTo;
        if (assignedBy) query.assignedBy = assignedBy;

        const tasks = await Task.find(query).populate('assignedTo', 'username email').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, revertReason, userId } = req.body;
        
        const task = await Task.findById(id).populate('assignedTo', 'username role');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = status;
        if (revertReason) task.revertReason = revertReason;

        await task.save();

        if (userId) {
             const user = await User.findById(userId);
             if (user) {
                 await Activity.create({
                    userId: user._id,
                    username: user.username,
                    role: user.role,
                    action: `Task ${status}`,
                    details: `${user.username} marked task "${task.title}" as ${status}`
                 });
             }
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTask, getTasks, updateTaskStatus };
