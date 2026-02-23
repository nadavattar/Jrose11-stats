const mongoose = require('mongoose');

const tierPlacementSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    tier_type: String,
    tier: String,
    pokemon_id: String,
    rank_within_tier: Number,
    created_date: Date,
    updated_date: Date,
    created_by_id: String,
    created_by: String,
    is_sample: Boolean
});

module.exports = mongoose.model('TierPlacement', tierPlacementSchema);
