import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { ArrowLeft, Trophy, Clock, Zap, Award, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const typeColors = {
    Normal: 'bg-gray-400 text-gray-900',
    Fire: 'bg-orange-500 text-white',
    Water: 'bg-blue-500 text-white',
    Electric: 'bg-yellow-400 text-gray-900',
    Grass: 'bg-green-500 text-white',
    Ice: 'bg-cyan-300 text-gray-900',
    Fighting: 'bg-red-700 text-white',
    Poison: 'bg-purple-500 text-white',
    Ground: 'bg-amber-600 text-white',
    Flying: 'bg-indigo-300 text-gray-900',
    Psychic: 'bg-pink-500 text-white',
    Bug: 'bg-lime-500 text-gray-900',
    Rock: 'bg-amber-700 text-white',
    Ghost: 'bg-purple-700 text-white',
    Dragon: 'bg-indigo-600 text-white',
    Dark: 'bg-gray-700 text-white',
    Steel: 'bg-gray-400 text-gray-900',
    Fairy: 'bg-pink-300 text-gray-900'
};

const MovesUsedTable = ({ movesUsed, allMoves }) => {
    const getMoveData = (moveName) => {
        return allMoves.find(m => m.name.toLowerCase() === moveName.toLowerCase());
    };

    return (
        <div className="bg-slate-700 rounded-lg border-2 border-slate-600 overflow-hidden">
            <div className="text-slate-400 text-xs p-2 border-b border-slate-600">Moves Used</div>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-600 hover:bg-transparent">
                        <TableHead className="text-slate-400 text-xs h-8">Move</TableHead>
                        <TableHead className="text-slate-400 text-xs h-8">Type</TableHead>
                        <TableHead className="text-slate-400 text-xs h-8 text-center">Power</TableHead>
                        <TableHead className="text-slate-400 text-xs h-8 text-center">Acc</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {movesUsed.map((moveName, i) => {
                        const moveData = getMoveData(moveName);
                        const typeClass = moveData?.type ? typeColors[moveData.type] || 'bg-slate-500 text-white' : 'bg-slate-500 text-white';

                        return (
                            <TableRow key={i} className="border-slate-600 hover:bg-slate-600/50">
                                <TableCell className="text-white text-xs py-2 font-medium">{moveName}</TableCell>
                                <TableCell className="py-2">
                                    {moveData?.type ? (
                                        <span className={`${typeClass} px-2 py-0.5 rounded text-[10px] font-bold`}>
                                            {moveData.type}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center py-2">
                                    <span className="text-yellow-400 text-xs font-mono">
                                        {moveData?.power || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                    <span className="text-blue-400 text-xs font-mono">
                                        {moveData?.accuracy ? `${moveData.accuracy}%` : '-'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

const battleKeys = [
    { key: 'brock', label: 'Brock', fixedOrder: 1 },
    { key: 'rival_2', label: 'Rival 2' },
    { key: 'misty', label: 'Misty' },
    { key: 'rival_3', label: 'Rival 3' },
    { key: 'lt_surge', label: 'Lt. Surge' },
    { key: 'erica', label: 'Erica' },
    { key: 'rival_4', label: 'Rival 4' },
    { key: 'giovanni_1', label: 'Giovanni 1' },
    { key: 'koga', label: 'Koga' },
    { key: 'sabrina', label: 'Sabrina' },
    { key: 'rival_5', label: 'Rival 5' },
    { key: 'giovanni_2', label: 'Giovanni 2' },
    { key: 'blaine', label: 'Blaine' },
    { key: 'giovanni_3', label: 'Giovanni 3', fixedOrder: 14 },
    { key: 'rival_6', label: 'Rival 6', fixedOrder: 15 },
    { key: 'lorelei', label: 'Lorelei', fixedOrder: 16 },
    { key: 'bruno', label: 'Bruno', fixedOrder: 17 },
    { key: 'agatha', label: 'Agatha', fixedOrder: 18 },
    { key: 'lance', label: 'Lance', fixedOrder: 19 },
    { key: 'champion', label: 'Champion', fixedOrder: 20 }
];

const battleCategories = {
    gyms: [
        { key: 'brock', name: 'Brock', badge: 'Boulder Badge', sprite: 'https://archives.bulbagarden.net/media/upload/7/7c/Spr_FRLG_Brock.png' },
        { key: 'misty', name: 'Misty', badge: 'Cascade Badge', sprite: 'https://archives.bulbagarden.net/media/upload/2/2c/Spr_FRLG_Misty.png' },
        { key: 'lt_surge', name: 'Lt. Surge', badge: 'Thunder Badge', sprite: 'https://archives.bulbagarden.net/media/upload/5/5c/Spr_FRLG_Lt_Surge.png' },
        { key: 'erica', name: 'Erika', badge: 'Rainbow Badge', sprite: 'https://archives.bulbagarden.net/media/upload/c/c9/Spr_FRLG_Erika.png' },
        { key: 'koga', name: 'Koga', badge: 'Soul Badge', sprite: 'https://archives.bulbagarden.net/media/upload/0/02/Spr_FRLG_Koga.png' },
        { key: 'sabrina', name: 'Sabrina', badge: 'Marsh Badge', sprite: 'https://archives.bulbagarden.net/media/upload/d/dd/Spr_FRLG_Sabrina.png' },
        { key: 'blaine', name: 'Blaine', badge: 'Volcano Badge', sprite: 'https://archives.bulbagarden.net/media/upload/6/6d/Spr_FRLG_Blaine.png' },
        { key: 'giovanni_3', name: 'Giovanni', badge: 'Earth Badge', sprite: 'https://archives.bulbagarden.net/media/upload/4/41/Spr_FRLG_Giovanni.png' }
    ],
    rivals: [
        { key: 'rival_2', name: 'Rival Battle 2', sprite: 'https://archives.bulbagarden.net/media/upload/0/02/Spr_FRLG_Blue_1.png' },
        { key: 'rival_3', name: 'Rival Battle 3', sprite: 'https://archives.bulbagarden.net/media/upload/e/e2/Spr_FRLG_Blue_2.png' },
        { key: 'rival_4', name: 'Rival Battle 4', sprite: 'https://archives.bulbagarden.net/media/upload/e/e2/Spr_FRLG_Blue_2.png' },
        { key: 'rival_5', name: 'Rival Battle 5', sprite: 'https://archives.bulbagarden.net/media/upload/1/10/Spr_FRLG_Blue_3.png' },
        { key: 'rival_6', name: 'Rival Battle 6', sprite: 'https://archives.bulbagarden.net/media/upload/1/10/Spr_FRLG_Blue_3.png' }
    ],
    rocket: [
        { key: 'giovanni_1', name: 'Giovanni (Rocket 1)', sprite: 'https://archives.bulbagarden.net/media/upload/4/41/Spr_FRLG_Giovanni.png' },
        { key: 'giovanni_2', name: 'Giovanni (Rocket 2)', sprite: 'https://archives.bulbagarden.net/media/upload/4/41/Spr_FRLG_Giovanni.png' }
    ],
    eliteFour: [
        { key: 'lorelei', name: 'Lorelei', sprite: 'https://archives.bulbagarden.net/media/upload/d/db/Spr_FRLG_Lorelei.png' },
        { key: 'bruno', name: 'Bruno', sprite: 'https://archives.bulbagarden.net/media/upload/9/9c/Spr_FRLG_Bruno.png' },
        { key: 'agatha', name: 'Agatha', sprite: 'https://archives.bulbagarden.net/media/upload/5/56/Spr_FRLG_Agatha.png' },
        { key: 'lance', name: 'Lance', sprite: 'https://archives.bulbagarden.net/media/upload/f/fb/Spr_FRLG_Lance.png' },
        { key: 'champion', name: 'Champion Blue', sprite: 'https://archives.bulbagarden.net/media/upload/0/02/Spr_FRLG_Blue_1.png' }
    ]
};

// Bug 5 Fix: BattleCategory and AllBattlesList moved outside PokemonDetail
// to avoid being recreated on every render inside the runStats.map() loop.
const BattleCategory = ({ title, battles, bgColor, run, getBattleOrder }) => (
    <div className="mb-6">
        <h4 className="text-yellow-400 text-xs mb-3 uppercase"
            style={{ fontFamily: "'Press Start 2P', monospace" }}>
            {title}
        </h4>
        <div className="space-y-2">
            {battles.map(battle => {
                const timestamp = run.battle_timestamps?.[battle.key] || 'N/A';
                const losses = run.battle_losses?.[battle.key] || 0;
                const order = getBattleOrder(battle.key);

                return (
                    <div key={battle.key} className={`${bgColor} border-2 border-slate-600 rounded-lg p-3 flex items-center gap-3`}>
                        <div className="text-yellow-400 text-xs font-bold min-w-[24px]">#{order}</div>
                        <img
                            src={battle.sprite}
                            alt={battle.name}
                            className="w-12 h-12 object-contain bg-slate-700 rounded border border-slate-500"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="flex-1">
                            <div className="text-white text-xs font-bold">{battle.name}</div>
                            {battle.badge && (
                                <div className="text-yellow-300 text-[10px]">{battle.badge}</div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-blue-400 text-xs font-mono">{timestamp}</div>
                            <div className={`text-xs font-bold ${losses > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {losses} {losses === 1 ? 'loss' : 'losses'}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const AllBattlesList = ({ battles }) => (
    <div className="space-y-2">
        {battles.map(battle => {
            const bgColor = battle.category === 'Gym Leaders' ? 'bg-gradient-to-br from-slate-700 to-slate-800' :
                battle.category === 'Rival Battles' ? 'bg-gradient-to-br from-blue-900 to-blue-800' :
                    battle.category === 'Team Rocket' ? 'bg-gradient-to-br from-red-900 to-red-800' :
                        'bg-gradient-to-br from-purple-900 to-purple-800';

            return (
                <div key={battle.key} className={`${bgColor} border-2 border-slate-600 rounded-lg p-3 flex items-center gap-3`}>
                    <div className="text-yellow-400 text-xs font-bold min-w-[24px]">#{battle.order}</div>
                    <img
                        src={battle.sprite}
                        alt={battle.name}
                        className="w-12 h-12 object-contain bg-slate-700 rounded border border-slate-500"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="flex-1">
                        <div className="text-white text-xs font-bold">{battle.name}</div>
                        {battle.badge && (
                            <div className="text-yellow-300 text-[10px]">{battle.badge}</div>
                        )}
                        <div className="text-slate-400 text-[10px]">{battle.category}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-blue-400 text-xs font-mono">{battle.timestamp || 'N/A'}</div>
                        <div className={`text-xs font-bold ${battle.losses > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {battle.losses} {battle.losses === 1 ? 'loss' : 'losses'}
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

export default function PokemonDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = urlParams.get('id');
    const [battleSort, setBattleSort] = React.useState('order');

    // Bug 4 Fix: Use filter({ id }) to fetch a single record instead of listing all 151 Pokemon
    const { data: pokemon, isLoading } = useQuery({
        queryKey: ['pokemon', pokemonId],
        queryFn: async () => {
            const results = await base44.entities.Pokemon.filter({ id: pokemonId });
            return results[0];
        },
        enabled: !!pokemonId
    });

    const { data: runStats = [] } = useQuery({
        queryKey: ['runStats', pokemonId],
        queryFn: () => base44.entities.RunStatistics.filter({ pokemon_id: pokemonId }),
        enabled: !!pokemonId
    });

    const { data: tierPlacement } = useQuery({
        queryKey: ['tierPlacement', pokemonId],
        queryFn: async () => {
            const placements = await base44.entities.TierPlacement.filter({ pokemon_id: pokemonId });
            return placements[0];
        },
        enabled: !!pokemonId
    });

    const { data: allMoves = [] } = useQuery({
        queryKey: ['moves'],
        queryFn: () => base44.entities.Move.list('name', 500)
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-yellow-400 text-xl"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    LOADING...
                </div>
            </div>
        );
    }

    if (!pokemon) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-yellow-400 text-xl"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    POKEMON NOT FOUND
                </div>
            </div>
        );
    }

    const spriteUrl = pokemon.sprite_url ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const embedUrl = getYouTubeEmbedUrl(pokemon.youtube_url);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Link to={createPageUrl('Home')}>
                    <Button variant="outline" className="mb-6 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-yellow-500 rounded-xl shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 border-b-4 border-yellow-500 p-4 md:p-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-lg border-2 border-white/40 p-2">
                                <img
                                    src={spriteUrl}
                                    alt={pokemon.name}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                            <div className="text-center">
                                <h1 className="text-white text-xl md:text-4xl uppercase mb-1 md:mb-2"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    {pokemon.name}
                                </h1>
                                <p className="text-yellow-300 text-sm md:text-xl"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    #{String(pokemon.pokedex_number).padStart(3, '0')}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 w-full md:w-auto">
                                {tierPlacement && (
                                    <div className="text-center bg-purple-400/20 rounded-lg p-3 md:p-4 border-2 border-purple-400">
                                        <Trophy className="w-6 h-6 md:w-10 md:h-10 text-purple-400 mx-auto mb-1 md:mb-2" />
                                        <div className="text-purple-400 text-xl md:text-2xl font-bold"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            {tierPlacement.tier}
                                        </div>
                                        <div className="text-purple-200 text-[8px] md:text-xs">
                                            {tierPlacement.tier_type?.toUpperCase()} • RANK #{tierPlacement.rank_within_tier}
                                        </div>
                                    </div>
                                )}
                                {pokemon.rank > 0 && (
                                    <div className="text-center bg-yellow-400/20 rounded-lg p-3 md:p-4 border-2 border-yellow-400">
                                        <Award className="w-6 h-6 md:w-10 md:h-10 text-yellow-400 mx-auto mb-1 md:mb-2" />
                                        <div className="text-yellow-400 text-xl md:text-2xl font-bold"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            #{pokemon.rank}
                                        </div>
                                        <div className="text-yellow-200 text-[8px] md:text-xs">RANK</div>
                                    </div>
                                )}
                                {pokemon.completion_time && pokemon.completion_time.trim() !== '' && (
                                    <div className="text-center bg-blue-400/20 rounded-lg p-3 md:p-4 border-2 border-blue-400">
                                        <Clock className="w-6 h-6 md:w-10 md:h-10 text-blue-400 mx-auto mb-1 md:mb-2" />
                                        <div className="text-blue-400 text-sm md:text-lg font-bold"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            {pokemon.completion_time}
                                        </div>
                                        <div className="text-blue-200 text-[8px] md:text-xs">TIME</div>
                                    </div>
                                )}
                                {pokemon.completion_level > 0 && (
                                    <div className="text-center bg-green-400/20 rounded-lg p-3 md:p-4 border-2 border-green-400">
                                        <Zap className="w-6 h-6 md:w-10 md:h-10 text-green-400 mx-auto mb-1 md:mb-2" />
                                        <div className="text-green-400 text-xl md:text-2xl font-bold"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            {pokemon.completion_level}
                                        </div>
                                        <div className="text-green-200 text-[8px] md:text-xs">LEVEL</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* YouTube Video */}
                                {embedUrl && (
                                    <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                        <h3 className="text-yellow-400 text-sm mb-4"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            SOLO RUN VIDEO
                                        </h3>
                                        <div className="aspect-video w-full">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={embedUrl}
                                                title={`${pokemon.name} Solo Run`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}

                                {/* Type and Base Stats - Moved here under video */}
                                <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                    {(pokemon.type_primary || pokemon.type_secondary) && (
                                        <div className="mb-6">
                                            <h3 className="text-yellow-400 text-sm mb-3"
                                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                TYPE
                                            </h3>
                                            <div className="flex gap-2">
                                                {pokemon.type_primary && (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${typeColors[pokemon.type_primary] || 'bg-gray-400 text-gray-900'}`}>
                                                        {pokemon.type_primary}
                                                    </span>
                                                )}
                                                {pokemon.type_secondary && (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${typeColors[pokemon.type_secondary] || 'bg-gray-400 text-gray-900'}`}>
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
                                            <div className="space-y-3">
                                                {['hp', 'attack', 'defense', 'speed', 'special'].map(stat => {
                                                    const value = pokemon.base_stats[stat];
                                                    const maxStat = 255;
                                                    const percentage = (value / maxStat) * 100;

                                                    return (
                                                        <div key={stat}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-slate-300 text-xs uppercase font-bold">
                                                                    {stat === 'hp' ? 'HP' : stat.charAt(0).toUpperCase() + stat.slice(1)}
                                                                </span>
                                                                <span className="text-white text-sm font-bold">{value}</span>
                                                            </div>
                                                            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-600">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        backgroundColor:
                                                                            value >= 150 ? '#22c55e' :
                                                                                value >= 100 ? '#eab308' :
                                                                                    value >= 60 ? '#f97316' : '#ef4444'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {pokemon.base_stats.total && (
                                                    <div className="pt-3 border-t-2 border-slate-700">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-yellow-400 text-xs uppercase font-bold">Total</span>
                                                            <span className="text-yellow-400 text-lg font-bold">{pokemon.base_stats.total}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Moves Learned */}
                                {pokemon.moves_level_up && pokemon.moves_level_up.length > 0 && (
                                    <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                        <h3 className="text-yellow-400 text-sm mb-4"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            LEVEL UP MOVES
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
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
                                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                                            {pokemon.moves_tm.map((move, i) => (
                                                <span key={i} className="bg-slate-700 text-white px-2 py-1 rounded text-xs">
                                                    {move}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Run Statistics */}
                                {runStats.length > 0 && runStats.map((run, idx) => {
                                    // Get battle order with fixed positions
                                    const getBattleOrder = (battleKey) => {
                                        const battle = battleKeys.find(b => b.key === battleKey);
                                        return battle?.fixedOrder || run.battle_order?.[battleKey] || 999;
                                    };

                                    const getBattleCategory = (battleKey) => {
                                        if (battleCategories.gyms.find(b => b.key === battleKey)) return 'Gym Leaders';
                                        if (battleCategories.rivals.find(b => b.key === battleKey)) return 'Rival Battles';
                                        if (battleCategories.rocket.find(b => b.key === battleKey)) return 'Team Rocket';
                                        if (battleCategories.eliteFour.find(b => b.key === battleKey)) return 'Elite Four';
                                        return 'Other';
                                    };

                                    const getAllBattles = () => [
                                        ...battleCategories.gyms,
                                        ...battleCategories.rivals,
                                        ...battleCategories.rocket,
                                        ...battleCategories.eliteFour
                                    ];

                                    const sortBattles = (battles) => {
                                        const battlesWithData = battles.map(battle => ({
                                            ...battle,
                                            timestamp: run.battle_timestamps?.[battle.key] || '',
                                            losses: run.battle_losses?.[battle.key] || 0,
                                            order: getBattleOrder(battle.key),
                                            category: getBattleCategory(battle.key)
                                        }));

                                        if (battleSort === 'order') {
                                            return battlesWithData.sort((a, b) => a.order - b.order);
                                        } else if (battleSort === 'category') {
                                            const categoryOrder = { 'Gym Leaders': 1, 'Rival Battles': 2, 'Team Rocket': 3, 'Elite Four': 4 };
                                            return battlesWithData.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
                                        } else if (battleSort === 'losses') {
                                            return battlesWithData.sort((a, b) => b.losses - a.losses);
                                        } else if (battleSort === 'timestamp') {
                                            return battlesWithData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
                                        }
                                        return battlesWithData;
                                    };

                                    return (
                                        <div key={idx} className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-yellow-400 text-sm flex items-center gap-2"
                                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                    RUN STATS ({run.game_version?.toUpperCase()})
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                                    <Select value={battleSort} onValueChange={setBattleSort}>
                                                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="order">By Order</SelectItem>
                                                            <SelectItem value="category">By Category</SelectItem>
                                                            <SelectItem value="losses">By Losses</SelectItem>
                                                            <SelectItem value="timestamp">By Time</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2">
                                                {battleSort === 'category' ? (
                                                    <>
                                                        <BattleCategory title="🏆 Gym Leaders" battles={battleCategories.gyms} bgColor="bg-gradient-to-br from-slate-700 to-slate-800" run={run} getBattleOrder={getBattleOrder} />
                                                        <BattleCategory title="⚔️ Rival Battles" battles={battleCategories.rivals} bgColor="bg-gradient-to-br from-blue-900 to-blue-800" run={run} getBattleOrder={getBattleOrder} />
                                                        <BattleCategory title="🚀 Team Rocket" battles={battleCategories.rocket} bgColor="bg-gradient-to-br from-red-900 to-red-800" run={run} getBattleOrder={getBattleOrder} />
                                                        <BattleCategory title="👑 Elite Four & Champion" battles={battleCategories.eliteFour} bgColor="bg-gradient-to-br from-purple-900 to-purple-800" run={run} getBattleOrder={getBattleOrder} />
                                                    </>
                                                ) : (
                                                    <AllBattlesList battles={sortBattles(getAllBattles())} />
                                                )}
                                            </div>

                                            {run.total_losses !== undefined && (
                                                <div className="mt-4 bg-slate-700/50 rounded-lg p-3 border border-slate-600 flex items-center justify-between">
                                                    <span className="text-slate-400 text-xs">Total Losses</span>
                                                    <span className={`text-sm font-medium ${run.total_losses > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                        {run.total_losses}
                                                    </span>
                                                </div>
                                            )}

                                            {run.moves_used && run.moves_used.length > 0 && (
                                                <div className="mt-4">
                                                    <MovesUsedTable movesUsed={run.moves_used} allMoves={allMoves} />
                                                </div>
                                            )}

                                            {run.notes && run.notes.trim() !== '' && (
                                                <div className="mt-4 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                                                    <div className="text-slate-400 text-xs mb-2">Notes</div>
                                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{run.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}