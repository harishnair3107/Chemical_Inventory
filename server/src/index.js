const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/inventory', require('./features/inventory/inventory.routes'));
app.use('/api/activity', require('./features/activity/activity.routes'));
app.use('/api/attendance', require('./features/attendance/attendance.routes'));

// Health Check
app.get('/', (req, res) => {
    res.send('Chemical Inventory Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
