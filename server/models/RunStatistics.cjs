const mongoose = require('mongoose');

const runStatisticsSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    game_version: String,
    completion_level: Number,
    completion_time: String,
    battle_order: mongoose.Schema.Types.Mixed,
    notes: String,
    total_losses: mongoose.Schema.Types.Mixed,
    pokemon_id: String,
    battle_timestamps: mongoose.Schema.Types.Mixed,
    moves_used: [String],
    battle_losses: mongoose.Schema.Types.Mixed,
    created_date: Date,
    updated_date: Date,
    created_by_id: String,
    created_by: String,
    is_sample: Boolean
});

module.exports = mongoose.model('RunStatistics', runStatisticsSchema);
