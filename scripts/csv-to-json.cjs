const fs = require('fs');
const path = require('path');

// Function to parse CSV to JSON
function csvToJson(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                let value = values[index];

                // Try to parse JSON strings
                if (value.startsWith('{') || value.startsWith('[')) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        // Keep as string if not valid JSON
                    }
                } else if (value === 'true') {
                    value = true;
                } else if (value === 'false') {
                    value = false;
                } else if (value === '' || value === 'null') {
                    value = null;
                } else if (!isNaN(value) && value !== '') {
                    // Only convert to number if it's purely numeric
                    const num = parseFloat(value);
                    if (num.toString() === value) {
                        value = num;
                    }
                }

                obj[header] = value;
            });
            result.push(obj);
        }
    }

    return result;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Main conversion
try {
    const baseDir = path.join(__dirname, '..');
    const dataDir = path.join(baseDir, 'server', 'data');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read CSV files
    const pokemonCsv = fs.readFileSync(path.join(baseDir, 'Pokemon_export.csv'), 'utf8');
    const movesCsv = fs.readFileSync(path.join(baseDir, 'Move_export.csv'), 'utf8');
    const tiersCsv = fs.readFileSync(path.join(baseDir, 'TierPlacement_export.csv'), 'utf8');
    const runStatsCsv = fs.readFileSync(path.join(baseDir, 'RunStatistics_export.csv'), 'utf8');
    const rulesCsv = fs.readFileSync(path.join(baseDir, 'RulesContent_export.csv'), 'utf8');

    // Convert to JSON
    const pokemon = csvToJson(pokemonCsv);
    const moves = csvToJson(movesCsv);
    const tierPlacements = csvToJson(tiersCsv);
    const runStatistics = csvToJson(runStatsCsv);
    const rulesContent = csvToJson(rulesCsv);

    // Create mock user
    const user = [
        {
            id: 'admin-user-1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        }
    ];

    // Write to separate files
    fs.writeFileSync(path.join(dataDir, 'Pokemon.json'), JSON.stringify(pokemon, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'Move.json'), JSON.stringify(moves, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'TierPlacement.json'), JSON.stringify(tierPlacements, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'RunStatistics.json'), JSON.stringify(runStatistics, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'RulesContent.json'), JSON.stringify(rulesContent, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'User.json'), JSON.stringify(user, null, 2), 'utf8');

    console.log('✅ Database converted successfully!');
    console.log(`   Files created in server/data/:`);
    console.log(`   - Pokemon.json: ${pokemon.length} records`);
    console.log(`   - Move.json: ${moves.length} records`);
    console.log(`   - TierPlacement.json: ${tierPlacements.length} records`);
    console.log(`   - RunStatistics.json: ${runStatistics.length} records`);
    console.log(`   - RulesContent.json: ${rulesContent.length} records`);
    console.log(`   - User.json: ${user.length} records`);

} catch (error) {
    console.error('❌ Error converting CSV to JSON:', error.message);
    process.exit(1);
}
