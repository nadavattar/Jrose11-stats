import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Trophy, Clock, Zap, Award } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function Comparison() {
    const [selectedIds, setSelectedIds] = useState([]);
    const [open, setOpen] = useState(false);

    const { data: pokemon = [] } = useQuery({
        queryKey: ['pokemon'],
        queryFn: () => base44.entities.Pokemon.list('pokedex_number', 200)
    });

    const { data: allStats = [] } = useQuery({
        queryKey: ['stats'],
        queryFn: () => base44.entities.RunStatistics.list()
    });

    const { data: allPlacements = [] } = useQuery({
        queryKey: ['placements'],
        queryFn: () => base44.entities.TierPlacement.list()
    });

    const selectedPokemon = pokemon.filter(p => selectedIds.includes(p.id));

    const addPokemon = (id) => {
        if (!selectedIds.includes(id) && selectedIds.length < 4) {
            setSelectedIds([...selectedIds, id]);
        }
        setOpen(false);
    };

    const removePokemon = (id) => {
        setSelectedIds(selectedIds.filter(i => i !== id));
    };

    const getPokemonStats = (pokemonId) => {
        return allStats.find(s => s.pokemon_id === pokemonId);
    };

    const getPokemonPlacement = (pokemonId) => {
        return allPlacements.find(p => p.pokemon_id === pokemonId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                    <h1 className="text-yellow-400 text-xl md:text-2xl text-center flex-1"
                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                        COMPARE RUNS
                    </h1>
                    <div className="w-32" />
                </div>

                <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center justify-between"
                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                            SELECT POKEMON (MAX 4)
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-yellow-500 text-yellow-500"
                                        disabled={selectedIds.length >= 4}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Pokemon
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Pokemon..." />
                                        <CommandList>
                                            <CommandEmpty>No Pokemon found.</CommandEmpty>
                                            <CommandGroup>
                                                {pokemon.filter(p => !selectedIds.includes(p.id)).map((poke) => (
                                                    <CommandItem
                                                        key={poke.id}
                                                        value={`${poke.pokedex_number} ${poke.name}`}
                                                        onSelect={() => addPokemon(poke.id)}
                                                    >
                                                        #{poke.pokedex_number} {poke.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedIds.length === 0 ? (
                            <div className="text-center py-8 text-slate-400"
                                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}>
                                SELECT POKEMON TO COMPARE
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedPokemon.map(poke => (
                                    <div key={poke.id} className="bg-slate-700 rounded-lg p-2 flex items-center gap-2">
                                        <img
                                            src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                            alt={poke.name}
                                            className="w-12 h-12"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                        <span className="text-white text-sm">{poke.name}</span>
                                        <button
                                            onClick={() => removePokemon(poke.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedPokemon.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedPokemon.map(poke => {
                            const stats = getPokemonStats(poke.id);
                            const placement = getPokemonPlacement(poke.id);

                            return (
                                <Card key={poke.id} className="bg-slate-800 border-slate-600">
                                    <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 border-b-2 border-yellow-500">
                                        <div className="text-center">
                                            <img
                                                src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                alt={poke.name}
                                                className="w-24 h-24 mx-auto"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                            <h3 className="text-white text-lg font-bold mt-2"
                                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                {poke.name}
                                            </h3>
                                            <p className="text-yellow-300 text-sm">
                                                #{String(poke.pokedex_number).padStart(3, '0')}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {/* Types */}
                                        <div>
                                            <div className="text-slate-400 text-xs mb-1">Type</div>
                                            <div className="flex gap-1 flex-wrap">
                                                {poke.type_primary && (
                                                    <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                                        {poke.type_primary}
                                                    </span>
                                                )}
                                                {poke.type_secondary && (
                                                    <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                                                        {poke.type_secondary}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tier */}
                                        {placement && (
                                            <div>
                                                <div className="text-slate-400 text-xs mb-1">Tier</div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-10 h-10 flex items-center justify-center font-bold rounded ${placement.tier === 'S' ? 'bg-red-600' :
                                                        placement.tier === 'A' ? 'bg-orange-600' :
                                                            placement.tier === 'B' ? 'bg-yellow-600' :
                                                                placement.tier === 'C' ? 'bg-green-600' :
                                                                    placement.tier === 'D' ? 'bg-blue-600' : 'bg-purple-600'
                                                        } text-white`}>
                                                        {placement.tier}
                                                    </div>
                                                    <span className="text-slate-300 text-sm">
                                                        Rank #{placement.rank_within_tier}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Base Stats */}
                                        {poke.base_stats && (
                                            <div>
                                                <div className="text-slate-400 text-xs mb-2">Base Stats</div>
                                                <div className="space-y-1">
                                                    {['hp', 'attack', 'defense', 'speed', 'special'].map(stat => (
                                                        <div key={stat} className="flex justify-between items-center text-xs">
                                                            <span className="text-slate-400 capitalize">{stat}</span>
                                                            <span className="text-white font-bold">{poke.base_stats[stat]}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-600">
                                                        <span className="text-yellow-400">Total</span>
                                                        <span className="text-yellow-400 font-bold">{poke.base_stats.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Run Stats */}
                                        <div>
                                            <div className="text-slate-400 text-xs mb-2">Run Stats</div>
                                            <div className="space-y-2">
                                                <div className="bg-slate-700 rounded p-2">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock className="w-3 h-3 text-blue-400" />
                                                        <span className="text-slate-400">Time:</span>
                                                        <span className="text-white font-bold">{poke.completion_time || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-700 rounded p-2">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Zap className="w-3 h-3 text-green-400" />
                                                        <span className="text-slate-400">Level:</span>
                                                        <span className="text-white font-bold">{poke.completion_level || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                {stats && (
                                                    <div className="bg-slate-700 rounded p-2">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Trophy className="w-3 h-3 text-red-400" />
                                                            <span className="text-slate-400">Losses:</span>
                                                            <span className="text-white font-bold">{stats.total_losses ?? 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {stats && stats.moves_used && stats.moves_used.length > 0 && (
                                                    <div>
                                                        <div className="text-slate-400 text-xs mb-1">Moves Used</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {stats.moves_used.map((move, i) => (
                                                                <span key={i} className="bg-purple-600 text-white px-1 py-0.5 rounded text-[10px]">
                                                                    {move}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        <Link to={createPageUrl('PokemonDetail') + '?id=' + poke.id}>
                                            <Button className="w-full bg-red-600 hover:bg-red-700 text-xs">
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}