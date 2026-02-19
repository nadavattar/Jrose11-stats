const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../server/data/Pokemon.json');
const data = require(dataPath);

// Gen 1 Evolution Data
// 0 = Basic (and can evolve?), 1 = Middle, 2 = Final (or Single?)
// Let's use strict strings: 'basic', 'middle', 'fully_evolved'
// We also need to set 'is_evolved'.
// Definition:
// 'is_evolved': true if it is NOT the first in its chain (so Middle and Final are true, Basic is false).
// 'evolution_stage':
//   - 'basic': First in chain (Bulbasaur, Charmander, Rattata, Tauros?)
//   - 'middle': Second in chain of 3 (Ivysaur, Charmeleon)
//   - 'fully_evolved': Last in chain (Venusaur, Charizard, Raticate, Tauros)

// Special case: Single stage (Tauros, Kangaskhan, Pinsir, etc.) -> Basic AND Fully Evolved?
// In the context of filters:
// "Pre-evolved" -> Basic (that can evolve).
// "Evolved" -> Has Evolved (Middle + Final).
// "Middle" -> Middle.

// Wait, User Complaint 1: "Evolved is also showing middle evolution pokemon".
// This means User expects "Evolved" to NOT show Middle.
// So User expects "Evolved" == "Fully Evolved"?
// If so, Ivysaur (Middle) should NOT be in "Evolved".
// But Ivysaur HAS evolved.
// If User wants "Evolved" to be "Final Stage Only", then "Middle" is separate.
// And "Pre-evolved" is "Basic".
// What about Single Stage? Usually considered "Fully Evolved" in stats, but "Basic" in stage.
// Let's assume User wants disjoint sets:
// 1. Pre-evolved (Basic that evolves)
// 2. Middle (Middle that evolves)
// 3. Evolved (Final form, including single stage?)

// Map of Pokedex Number to Stage config
// 1: Bulbasaur -> Basic
// 2: Ivysaur -> Middle
// 3: Venusaur -> Final
// ...

const stageMapping = {
    // Starters
    1: 'basic', 2: 'middle', 3: 'fully_evolved',
    4: 'basic', 5: 'middle', 6: 'fully_evolved',
    7: 'basic', 8: 'middle', 9: 'fully_evolved',
    // Bugs
    10: 'basic', 11: 'middle', 12: 'fully_evolved',
    13: 'basic', 14: 'middle', 15: 'fully_evolved',
    // Normal/Flying early
    16: 'basic', 17: 'middle', 18: 'fully_evolved',
    19: 'basic', 20: 'fully_evolved',
    21: 'basic', 22: 'fully_evolved',
    23: 'basic', 24: 'fully_evolved',
    25: 'basic', 26: 'fully_evolved', // Pikachu line
    27: 'basic', 28: 'fully_evolved',
    29: 'basic', 30: 'middle', 31: 'fully_evolved', // Nidoran F
    32: 'basic', 33: 'middle', 34: 'fully_evolved', // Nidoran M
    35: 'basic', 36: 'fully_evolved', // Clefairy (Pre-evolved logic check: Clefable is final)
    37: 'basic', 38: 'fully_evolved', // Vulpix
    39: 'basic', 40: 'fully_evolved', // Jigglypuff
    41: 'basic', 42: 'fully_evolved', // Zubat
    43: 'basic', 44: 'middle', 45: 'fully_evolved', // Oddish
    46: 'basic', 47: 'fully_evolved', // Paras
    48: 'basic', 49: 'fully_evolved', // Venonat
    50: 'basic', 51: 'fully_evolved', // Diglett
    52: 'basic', 53: 'fully_evolved', // Meowth
    54: 'basic', 55: 'fully_evolved', // Psyduck
    56: 'basic', 57: 'fully_evolved', // Mankey
    58: 'basic', 59: 'fully_evolved', // Growlithe
    60: 'basic', 61: 'middle', 62: 'fully_evolved', // Poliwag
    63: 'basic', 64: 'middle', 65: 'fully_evolved', // Abra
    66: 'basic', 67: 'middle', 68: 'fully_evolved', // Machop
    69: 'basic', 70: 'middle', 71: 'fully_evolved', // Bellsprout
    72: 'basic', 73: 'fully_evolved', // Tentacool
    74: 'basic', 75: 'middle', 76: 'fully_evolved', // Geodude
    77: 'basic', 78: 'fully_evolved', // Ponyta
    79: 'basic', 80: 'fully_evolved', // Slowpoke
    81: 'basic', 82: 'fully_evolved', // Magnemite
    83: 'basic', // Farfetch'd (Single) - Let's mark as 'fully_evolved' for "Rank" purposes or 'basic'? 
    // If labeled 'fully_evolved', it won't show in 'Pre-evolved'. Correct.
    84: 'basic', 85: 'fully_evolved', // Doduo
    86: 'basic', 87: 'fully_evolved', // Seel
    88: 'basic', 89: 'fully_evolved', // Grimer
    90: 'basic', 91: 'fully_evolved', // Shellder
    92: 'basic', 93: 'middle', 94: 'fully_evolved', // Gastly
    95: 'basic', // Onix (Single in Gen 1? Yes, Steelix is Gen 2) -> Fully Evolved
    96: 'basic', 97: 'fully_evolved', // Drowzee
    98: 'basic', 99: 'fully_evolved', // Krabby
    100: 'basic', 101: 'fully_evolved', // Voltorb
    102: 'basic', 103: 'fully_evolved', // Exeggcute
    104: 'basic', 105: 'fully_evolved', // Cubone
    106: 'basic', // Hitmonlee (Single)
    107: 'basic', // Hitmonchan (Single)
    108: 'basic', // Lickitung (Single Gen 1)
    109: 'basic', 110: 'fully_evolved', // Koffing
    111: 'basic', 112: 'fully_evolved', // Rhyhorn
    113: 'basic', // Chansey (Single Gen 1)
    114: 'basic', // Tangela (Single Gen 1)
    115: 'basic', // Kangaskhan
    116: 'basic', 117: 'fully_evolved', // Horsea
    118: 'basic', 119: 'fully_evolved', // Goldeen
    120: 'basic', 121: 'fully_evolved', // Staryu
    122: 'basic', // Mr. Mime
    123: 'basic', // Scyther
    124: 'basic', // Jynx
    125: 'basic', // Electabuzz
    126: 'basic', // Magmar
    127: 'basic', // Pinsir
    128: 'basic', // Tauros
    129: 'basic', 130: 'fully_evolved', // Magikarp
    131: 'basic', // Lapras
    132: 'basic', // Ditto
    133: 'basic', 134: 'fully_evolved', 135: 'fully_evolved', 136: 'fully_evolved', // Eevee layout
    137: 'basic', // Porygon
    138: 'basic', 139: 'fully_evolved', // Omanyte
    140: 'basic', 141: 'fully_evolved', // Kabuto
    142: 'basic', // Aerodactyl
    143: 'basic', // Snorlax
    144: 'fully_evolved', // Articuno (Legendary -> Final)
    145: 'fully_evolved', // Zapdos
    146: 'fully_evolved', // Moltres
    147: 'basic', 148: 'middle', 149: 'fully_evolved', // Dratini
    150: 'fully_evolved', // Mewtwo
    151: 'fully_evolved', // Mew
};

// Corrections for "Single Stage"
// For the purpose of "Pre-evolved vs Evolved" filters:
// "Pre-evolved" should mean "Can evolve".
// "Evolved" should mean "Has evolved" OR "Is Final Stage"?
// If user says "Evolved is also showing middle evolution", they imply "Evolved" == "Final".
// If I mark Single Stage as 'fully_evolved', they show in Evolved.
// If I mark them 'basic' but they CANNOT evolve, they shouldn't show in "Pre-evolved" (if Pre-evolved means NFE).
// So I will update the map for Single Stages to 'single_stage' or treat as 'fully_evolved' but ensure 'is_evolved' reflects reality?
// Currently 'is_evolved' in JSON seems to mean "Is it available to catch?" or "Is it a Pokemon?"? No idea.
// Let's standardize:
// is_evolved: true if stage != basic (i.e. it evolved from something).
// evolution_stage: 'middle', 'fully_evolved', 'basic', 'single_stage'.

const singleStages = [83, 95, 106, 107, 108, 113, 114, 115, 122, 123, 124, 125, 126, 127, 128, 131, 132, 137, 142, 143, 144, 145, 146, 150, 151];

// Update logic:
let updatedCount = 0;
const updatedData = data.map(p => {
    const num = p.pokedex_number;
    let stage = stageMapping[num] || 'basic';

    // Override Single Stages
    if (singleStages.includes(num)) {
        stage = 'single_stage';
    }

    // Determine is_evolved
    // Traditionally 'is_evolved' means "Not Basic".
    // So 'middle' and 'fully_evolved' are true. 'basic' is false. 'single_stage' is false (didn't evolve).
    let is_evolved = (stage === 'middle' || stage === 'fully_evolved');

    // Update Fields
    if (p.evolution_stage !== stage || p.is_evolved !== is_evolved) {
        p.evolution_stage = stage;
        p.is_evolved = is_evolved;
        updatedCount++;
    }
    return p;
});

fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
console.log(`Updated ${updatedCount} pokemon entries.`);
