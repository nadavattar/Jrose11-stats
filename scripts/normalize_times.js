const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../server/data');
const files = ['Pokemon.json', 'RunStatistics.json'];

console.log('Starting normalization to H:MM format...');

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        let updatedCount = 0;

        const updatedData = data.map(item => {
            if (item.completion_time && typeof item.completion_time === 'string') {
                const originalTime = item.completion_time.trim();
                const parts = originalTime.split(':');

                if (parts.length === 2) {
                    let [hours, minutes] = parts;

                    // Remove leading zero from hours (e.g., "03" -> "3")
                    hours = parseInt(hours, 10).toString();

                    // Ensure minutes are padded (e.g., "5" -> "05") - usually already correct but good to be safe
                    // Actually, let's just keep minutes as they are if they are 2 digits, or pad if 1 (though likely they are correct)
                    // But the main goal is H:MM

                    const newTime = `${hours}:${minutes}`;

                    if (newTime !== originalTime) {
                        // console.log(`[${file}] Normalizing: "${originalTime}" -> "${newTime}" (ID: ${item.id || item.pokemon_id})`);
                        item.completion_time = newTime;
                        updatedCount++;
                    }
                }
            }
            return item;
        });

        if (updatedCount > 0) {
            fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
            console.log(`✅ Updated ${updatedCount} entries in ${file}`);
        } else {
            console.log(`✨ No changes needed for ${file} (all already normalized)`);
        }

    } catch (err) {
        console.error(`❌ Error processing ${file}:`, err);
    }
});

console.log('Normalization complete.');
