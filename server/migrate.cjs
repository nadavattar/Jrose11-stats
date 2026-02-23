const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Pokemon = require('./models/Pokemon.cjs');
const RunStatistics = require('./models/RunStatistics.cjs');
const User = require('./models/User.cjs');
const TierPlacement = require('./models/TierPlacement.cjs');
const Move = require('./models/Move.cjs');
const RulesContent = require('./models/RulesContent.cjs');

const connectDB = require('./db.cjs');

const dataDir = path.join(__dirname, 'data');

const migrate = async () => {
    await connectDB();

    const entities = [
        { name: 'Pokemon', model: Pokemon, file: 'Pokemon.json' },
        { name: 'RunStatistics', model: RunStatistics, file: 'RunStatistics.json' },
        { name: 'User', model: User, file: 'User.json' },
        { name: 'TierPlacement', model: TierPlacement, file: 'TierPlacement.json' },
        { name: 'Move', model: Move, file: 'Move.json' },
        { name: 'RulesContent', model: RulesContent, file: 'RulesContent.json' }
    ];

    for (const entity of entities) {
        const filePath = path.join(dataDir, entity.file);
        if (fs.existsSync(filePath)) {
            console.log(`Migrating ${entity.name}...`);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            try {
                if (data.length === 0) continue;

                // Use bulkWrite with upsert for efficiency and idempotency
                const operations = data.map(item => ({
                    updateOne: {
                        filter: { id: item.id },
                        update: { $set: item },
                        upsert: true
                    }
                }));

                await entity.model.bulkWrite(operations);
                console.log(`✅ Migrated ${data.length} ${entity.name} records.`);
            } catch (err) {
                console.error(`❌ Failed to migrate ${entity.name}:`, err);
            }
        } else {
            console.warn(`⚠️ File not found: ${entity.file}`);
        }
    }

    console.log('Migration complete.');
    process.exit(0);
};

migrate();
