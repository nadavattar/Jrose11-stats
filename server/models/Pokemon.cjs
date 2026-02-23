const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Keep explicit id to avoid conflicts
    pokedex_number: Number,
    name: { type: String, required: true },
    type_primary: String,
    type_secondary: String,
    sprite_url: String,
    youtube_url: String,
    is_evolved: Boolean,
    evolution_stage: String,
    base_stats: mongoose.Schema.Types.Mixed,
    moves_level_up: mongoose.Schema.Types.Mixed,
    moves_tm: [String],
    completion_time: String,
    completion_level: Number,
    rank: mongoose.Schema.Types.Mixed,
    created_date: Date,
    updated_date: Date,
    created_by_id: String,
    created_by: String,
    is_sample: Boolean
});

module.exports = mongoose.model('Pokemon', pokemonSchema);
