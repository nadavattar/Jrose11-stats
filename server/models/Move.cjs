const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    type: String,
    power: Number,
    accuracy: Number,
    created_date: Date,
    updated_date: Date,
    created_by_id: String,
    created_by: String,
    is_sample: Boolean
});

module.exports = mongoose.model('Move', moveSchema);
