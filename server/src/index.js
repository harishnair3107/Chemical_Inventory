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
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://chemicalapp.netlify.app',
    'http://localhost:5173'
].filter(Boolean); // Remote null/undefined

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/inventory', require('./features/inventory/inventory.routes'));
app.use('/api/activity', require('./features/activity/activity.routes'));
app.use('/api/attendance', require('./features/attendance/attendance.routes'));
app.use('/api/settings', require('./features/settings/settings.routes'));

// Health Check
app.get('/', (req, res) => {
    res.send('Chemical Inventory Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
