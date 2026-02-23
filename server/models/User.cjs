const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    email: { type: String, unique: true },
    name: String,
    role: String,
    created_date: Date,
    updated_date: Date
});

module.exports = mongoose.model('User', userSchema);
