import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tierColors = {
    S: "bg-gradient-to-r from-red-500 to-red-600 border-red-700",
    A: "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-700",
    B: "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700",
    C: "bg-gradient-to-r from-green-500 to-green-600 border-green-700",
    D: "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700",
    E: "bg-gradient-to-r from-indigo-500 to-indigo-600 border-indigo-700",
    F: "bg-gradient-to-r from-purple-500 to-purple-600 border-purple-700",
    DNF: "bg-gradient-to-r from-gray-500 to-gray-600 border-gray-700"
};

export default function TierList({ title, placements, pokemon, onPokemonClick }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedTiers, setExpandedTiers] = useState({});
    
    // Determine tier list based on title (Pre-Evolved vs Evolved)
    const isPreEvolved = title.toLowerCase().includes('pre');
    const tiers = isPreEvolved 
        ? ['S', 'A', 'B', 'C', 'D', 'F', 'DNF']
        : ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    
    const getPokemonInTier = (tier) => {
        return placements
            .filter(p => p.tier === tier)
            .sort((a, b) => (a.rank_within_tier || 0) - (b.rank_within_tier || 0))
            .map(p => {
                const poke = pokemon.find(poke => poke.id === p.pokemon_id);
                return poke ? { ...poke, placement: p } : null;
            })
            .filter(Boolean);
    };
    
    const getOverallRank = (pokemonId) => {
        const ranked = getAllRankedPokemon();
        const found = ranked.find(r => r.pokemon.id === pokemonId);
        return found ? found.placement : null;
    };
    
    const getAllRankedPokemon = () => {
        return placements
            .sort((a, b) => {
                const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, DNF: 7 };
                const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
                if (tierDiff !== 0) return tierDiff;
                return (a.rank_within_tier || 0) - (b.rank_within_tier || 0);
            })
            .map(p => ({
                tier: p.tier,
                rank_within_tier: p.rank_within_tier,
                pokemon: pokemon.find(poke => poke.id === p.pokemon_id)
            }))
            .filter(p => p.pokemon)
            .map((p, idx) => ({
                ...p,
                placement: idx + 1
            }));
    };
    
    const toggleTier = (tier) => {
        setExpandedTiers(prev => ({
            ...prev,
            [tier]: !prev[tier]
        }));
    };
    
    return (
        <div className="bg-slate-900 border-4 border-slate-600 rounded-lg p-3 shadow-xl">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-center text-yellow-400 text-sm mb-3 pb-2 border-b-2 border-slate-600 hover:text-yellow-300 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
                <span className="flex-1">{title}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {!isExpanded ? (
                <div className="space-y-2">
                    {tiers.map(tier => {
                        const pokemonInTier = getPokemonInTier(tier);
                        const isTierExpanded = expandedTiers[tier];
                        return (
                            <div key={tier} className="space-y-2">
                                <div className="flex items-stretch gap-2">
                                    <button
                                        onClick={() => toggleTier(tier)}
                                        className={cn(
                                            "w-10 flex items-center justify-center text-white font-bold border-2 rounded hover:opacity-80 transition-opacity",
                                            tierColors[tier]
                                        )}
                                        style={{ fontFamily: "'Press Start 2P', monospace" }}
                                    >
                                        {tier}
                                    </button>
                                    <div className="flex-1 min-h-[40px] bg-slate-800 border-2 border-slate-600 rounded p-1 flex flex-wrap gap-1">
                                        <TooltipProvider delayDuration={0}>
                                            {pokemonInTier.map(poke => {
                                                const rank = getOverallRank(poke.id);
                                                return (
                                                    <Tooltip key={poke.id}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => onPokemonClick(poke)}
                                                                className="w-8 h-8 hover:scale-125 transition-transform"
                                                            >
                                                                <img
                                                                    src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                                    alt={poke.name}
                                                                    className="w-full h-full object-contain"
                                                                    style={{ imageRendering: 'pixelated' }}
                                                                />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-800 border-2 border-slate-600">
                                                            <div className="space-y-1">
                                                                <div className="text-yellow-400 text-xs font-bold">#{rank} {poke.name}</div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <Clock className="w-3 h-3 text-blue-400" />
                                                                    <span className="text-blue-400">{poke.completion_time || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <Zap className="w-3 h-3 text-green-400" />
                                                                    <span className="text-green-400">Lv.{poke.completion_level || '?'}</span>
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </TooltipProvider>
                                    </div>
                                </div>
                                {isTierExpanded && (
                                    <div className="bg-slate-800 border-2 border-slate-600 rounded overflow-hidden ml-12">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-600 hover:bg-transparent">
                                                    <TableHead className="text-yellow-400 text-xs text-center w-16">Rank</TableHead>
                                                    <TableHead className="text-yellow-400 text-xs text-center w-20">Pokémon</TableHead>
                                                    <TableHead className="text-yellow-400 text-xs text-center">Time</TableHead>
                                                    <TableHead className="text-yellow-400 text-xs text-center">Level</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pokemonInTier.map(poke => {
                                                    const rank = getOverallRank(poke.id);
                                                    const rowBgColor = tier === 'S' ? 'bg-red-900/30 hover:bg-red-900/50' :
                                                                       tier === 'A' ? 'bg-orange-900/30 hover:bg-orange-900/50' :
                                                                       tier === 'B' ? 'bg-yellow-900/30 hover:bg-yellow-900/50' :
                                                                       tier === 'C' ? 'bg-green-900/30 hover:bg-green-900/50' :
                                                                       tier === 'D' ? 'bg-blue-900/30 hover:bg-blue-900/50' :
                                                                       tier === 'E' ? 'bg-indigo-900/30 hover:bg-indigo-900/50' :
                                                                       tier === 'F' ? 'bg-purple-900/30 hover:bg-purple-900/50' :
                                                                       'bg-gray-900/30 hover:bg-gray-900/50';

                                                    return (
                                                        <TableRow 
                                                            key={poke.id} 
                                                            className={cn("border-slate-600 cursor-pointer", rowBgColor)}
                                                            onClick={() => onPokemonClick(poke)}
                                                        >
                                                            <TableCell className="text-white text-xs text-center font-bold">
                                                                #{rank}
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                <div className="flex justify-center">
                                                                    <img
                                                                        src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                                        alt={poke.name}
                                                                        className="w-10 h-10 object-contain"
                                                                        style={{ imageRendering: 'pixelated' }}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-blue-400 text-xs text-center font-mono">
                                                                {poke.completion_time || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-400 text-xs text-center font-bold">
                                                                {poke.completion_level || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-800 border-2 border-slate-600 rounded overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-600 hover:bg-transparent">
                                <TableHead className="text-yellow-400 text-xs text-center w-16">Rank</TableHead>
                                <TableHead className="text-yellow-400 text-xs text-center w-16">Tier</TableHead>
                                <TableHead className="text-yellow-400 text-xs text-center w-20">Pokémon</TableHead>
                                <TableHead className="text-yellow-400 text-xs text-center">Time</TableHead>
                                <TableHead className="text-yellow-400 text-xs text-center">Level</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getAllRankedPokemon().map(({ placement, tier, pokemon: poke }) => {
                                const rowBgColor = tier === 'S' ? 'bg-red-900/30 hover:bg-red-900/50' :
                                                   tier === 'A' ? 'bg-orange-900/30 hover:bg-orange-900/50' :
                                                   tier === 'B' ? 'bg-yellow-900/30 hover:bg-yellow-900/50' :
                                                   tier === 'C' ? 'bg-green-900/30 hover:bg-green-900/50' :
                                                   tier === 'D' ? 'bg-blue-900/30 hover:bg-blue-900/50' :
                                                   tier === 'E' ? 'bg-indigo-900/30 hover:bg-indigo-900/50' :
                                                   tier === 'F' ? 'bg-purple-900/30 hover:bg-purple-900/50' :
                                                   'bg-gray-900/30 hover:bg-gray-900/50';
                                
                                return (
                                    <TableRow 
                                        key={poke.id} 
                                        className={cn("border-slate-600 cursor-pointer", rowBgColor)}
                                        onClick={() => onPokemonClick(poke)}
                                    >
                                        <TableCell className="text-white text-xs text-center font-bold">
                                            #{placement}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={cn(
                                                "w-8 h-8 mx-auto flex items-center justify-center text-white font-bold border-2 rounded text-xs",
                                                tierColors[tier]
                                            )}
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                {tier}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex justify-center">
                                                <img
                                                    src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                    alt={poke.name}
                                                    className="w-10 h-10 object-contain"
                                                    style={{ imageRendering: 'pixelated' }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-blue-400 text-xs text-center font-mono">
                                            {poke.completion_time || '-'}
                                        </TableCell>
                                        <TableCell className="text-green-400 text-xs text-center font-bold">
                                            {poke.completion_level || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}