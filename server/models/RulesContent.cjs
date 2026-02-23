const mongoose = require('mongoose');

const rulesContentSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    section_key: String,
    title: String,
    icon: String,
    order: Number,
    subsections: [{
        subtitle: String,
        content: String
    }],
    created_date: Date,
    updated_date: Date,
    created_by_id: String,
    created_by: String,
    is_sample: Boolean
});

module.exports = mongoose.model('RulesContent', rulesContentSchema);
