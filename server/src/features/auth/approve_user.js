const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./auth.model');

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

async function approveUser() {
    try {
        console.log('Connecting to', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOneAndUpdate(
            { email: 'employee@test.com' },
            { status: 'active' },
            { new: true }
        );
        console.log('User approved:', user);
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

approveUser();
