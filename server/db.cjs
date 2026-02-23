const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jrose11-stats';
        await mongoose.connect(uri);
        console.log('📦 Connected to MongoDB');
    } catch (err) {
        console.error('❌ Could not connect to MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;
