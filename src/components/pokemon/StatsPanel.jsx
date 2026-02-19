import React from 'react';
import { X, Clock, Trophy, Skull, Swords, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

const battleNames = {
    brock: "Brock",
    rival_2: "Rival 2",
    misty: "Misty",
    rival_3: "Rival 3",
    lt_surge: "Lt. Surge",
    erica: "Erica",
    rival_4: "Rival 4",
    giovanni_1: "Giovanni 1",
    koga: "Koga",
    sabrina: "Sabrina",
    rival_5: "Rival 5",
    giovanni_2: "Giovanni 2",
    blaine: "Blaine",
    giovanni_3: "Giovanni 3",
    rival_6: "Rival 6",
    lorelei: "Lorelei",
    bruno: "Bruno",
    agatha: "Agatha",
    lance: "Lance",
    champion: "Champion"
};

export default function StatsPanel({ pokemon, stats, onClose }) {
    const spriteUrl = pokemon.sprite_url || 
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-yellow-500 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 border-b-4 border-yellow-500 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 rounded-lg border-2 border-white/40 p-1">
                            <img
                                src={spriteUrl}
                                alt={pokemon.name}
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>
                        <div>
                            <h2 className="text-white text-xl uppercase"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                {pokemon.name}
                            </h2>
                            <p className="text-yellow-300 text-sm mt-1"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                #{String(pokemon.pokedex_number).padStart(3, '0')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-yellow-300 transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
                
                <div className="p-4 space-y-6">
                    {/* Type and Base Stats */}
                    <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                        {(pokemon.type_primary || pokemon.type_secondary) && (
                            <div className="mb-4">
                                <h3 className="text-yellow-400 text-sm mb-3"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    TYPE
                                </h3>
                                <div className="flex gap-2">
                                    {pokemon.type_primary && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm border-2 border-blue-400">
                                            {pokemon.type_primary}
                                        </span>
                                    )}
                                    {pokemon.type_secondary && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm border-2 border-purple-400">
                                            {pokemon.type_secondary}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {pokemon.base_stats && (
                            <>
                                <h3 className="text-yellow-400 text-sm mb-4"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    BASE STATS
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(pokemon.base_stats).map(([stat, value]) => (
                                        <div key={stat} className="bg-slate-700 rounded p-2">
                                            <span className="text-slate-400 text-xs uppercase block"
                                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                {stat.replace('_', ' ')}
                                            </span>
                                            <span className="text-white text-lg font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Run Statistics */}
                    {stats ? (
                        <>
                            <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                <h3 className="text-yellow-400 text-sm mb-4 flex items-center gap-2"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    <Trophy className="w-4 h-4" />
                                    RUN STATS ({stats.game_version?.toUpperCase()})
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 text-center border-2 border-blue-400">
                                        <Clock className="w-6 h-6 text-blue-200 mx-auto mb-1" />
                                        <span className="text-blue-200 text-[10px] block"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            TIME
                                        </span>
                                        <span className="text-white text-sm font-bold block mt-1">
                                            {stats.completion_time || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-3 text-center border-2 border-green-400">
                                        <Zap className="w-6 h-6 text-green-200 mx-auto mb-1" />
                                        <span className="text-green-200 text-[10px] block"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            LEVEL
                                        </span>
                                        <span className="text-white text-sm font-bold block mt-1">
                                            {stats.completion_level || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-3 text-center border-2 border-red-400">
                                        <Skull className="w-6 h-6 text-red-200 mx-auto mb-1" />
                                        <span className="text-red-200 text-[10px] block"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            LOSSES
                                        </span>
                                        <span className="text-white text-sm font-bold block mt-1">
                                            {stats.total_losses ?? 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Battle Timestamps */}
                            {stats.battle_timestamps && Object.keys(stats.battle_timestamps).length > 0 && (
                                <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                    <h3 className="text-yellow-400 text-sm mb-4 flex items-center gap-2"
                                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                        <Swords className="w-4 h-4" />
                                        BATTLE TIMES
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.entries(battleNames).map(([key, name]) => (
                                            <div key={key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                                                <span className="text-slate-300 text-[8px]"
                                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                    {name}
                                                </span>
                                                <span className="text-white text-xs font-mono">
                                                    {stats.battle_timestamps[key] || '--:--'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Moves Used */}
                            {stats.moves_used && stats.moves_used.length > 0 && (
                                <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                    <h3 className="text-yellow-400 text-sm mb-4"
                                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                        MOVES USED
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.moves_used.map((move, i) => (
                                            <span key={i} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs border border-purple-400">
                                                {move}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {stats.notes && (
                                <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                    <h3 className="text-yellow-400 text-sm mb-2"
                                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                        NOTES
                                    </h3>
                                    <p className="text-slate-300 text-sm">{stats.notes}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-8 text-center">
                            <p className="text-slate-400 text-sm"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                NO RUN DATA YET
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                                Check back after this Pokemon's solo challenge is completed!
                            </p>
                        </div>
                    )}
                    
                    {/* Moves Learned */}
                    {pokemon.moves_level_up && pokemon.moves_level_up.length > 0 && (
                        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                            <h3 className="text-yellow-400 text-sm mb-4"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                LEVEL UP MOVES
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {pokemon.moves_level_up.map((m, i) => (
                                    <div key={i} className="bg-slate-700 rounded p-2 flex justify-between">
                                        <span className="text-white text-xs">{m.move}</span>
                                        <span className="text-yellow-400 text-xs">Lv.{m.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {pokemon.moves_tm && pokemon.moves_tm.length > 0 && (
                        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                            <h3 className="text-yellow-400 text-sm mb-4"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                TM MOVES
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {pokemon.moves_tm.map((move, i) => (
                                    <span key={i} className="bg-slate-700 text-white px-2 py-1 rounded text-xs">
                                        {move}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}