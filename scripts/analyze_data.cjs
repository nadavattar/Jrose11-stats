const fs = require('fs');
const path = require('path');
const data = require('../server/data/Pokemon.json');

const stats = {
    total: data.length,
    is_evolved_true: 0,
    is_evolved_false: 0,
    evolution_stage_counts: {}
};

data.forEach(p => {
    if (p.is_evolved) stats.is_evolved_true++;
    else stats.is_evolved_false++;

    const stage = p.evolution_stage || 'null';
    stats.evolution_stage_counts[stage] = (stats.evolution_stage_counts[stage] || 0) + 1;

    if (!p.is_evolved) console.log(`Not evolved: ${p.name}`);
});

console.log(JSON.stringify(stats, null, 2));
