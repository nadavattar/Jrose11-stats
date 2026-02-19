import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, Clock, Zap, Trophy, Flame, ChevronDown, ChevronUp, Search, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#6b7280'];

const TYPE_COLORS = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Electric: '#F8D030',
    Grass: '#78C850',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC'
};

const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, DNF: 7 };

function CountUp({ end, duration = 2 }) {
    const [count, setCount] = useState(0);

    React.useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count}</>;
}

export default function Statistics() {
    const navigate = useNavigate();
    const [rankFilter, setRankFilter] = useState('all');
    const [rankMetric, setRankMetric] = useState('tier');
    const [rankSearch, setRankSearch] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);

    const { data: pokemon = [] } = useQuery({
        queryKey: ['pokemon'],
        queryFn: () => base44.entities.Pokemon.list('pokedex_number', 200)
    });

    const { data: stats = [] } = useQuery({
        queryKey: ['stats'],
        queryFn: () => base44.entities.RunStatistics.list()
    });

    const { data: placements = [] } = useQuery({
        queryKey: ['placements'],
        queryFn: () => base44.entities.TierPlacement.list()
    });

    // Overview Stats
    const overviewStats = useMemo(() => {
        const totalPokemon = 151;
        const dnfPokemon = placements.filter(p => p.tier === 'DNF').map(p => p.pokemon_id);
        const dnfCount = dnfPokemon.length;

        const completedPokemon = pokemon.filter(p => p.completion_time && !dnfPokemon.includes(p.id));
        const completed = completedPokemon.length;

        const remaining = totalPokemon - completed - dnfCount;

        const completedWithValidTime = completedPokemon.filter(p => {
            if (!p.completion_time) return false;
            const trimmed = p.completion_time.trim();
            // Filter out "N/A", empty strings, or invalid formats
            return trimmed && trimmed.toUpperCase() !== 'N/A' && trimmed.includes(':') && trimmed !== ':' && trimmed !== '::';
        });

        let avgTime = 'N/A';
        if (completedWithValidTime.length > 0) {
            const totalSeconds = completedWithValidTime.reduce((acc, p) => {
                try {
                    const parts = p.completion_time.trim().split(':');
                    // Handle H:MM or H:MM:SS
                    let h = 0, m = 0, s = 0;
                    if (parts.length === 2) {
                        [h, m] = parts.map(part => parseInt(part, 10) || 0);
                    } else if (parts.length === 3) {
                        [h, m, s] = parts.map(part => parseInt(part, 10) || 0);
                    }
                    return acc + (h * 3600 + m * 60 + s);
                } catch (e) {
                    console.error('Error parsing time:', p.completion_time, e);
                }
                return acc;
            }, 0);

            if (totalSeconds > 0) {
                const avgTimeSeconds = totalSeconds / completedWithValidTime.length;
                const hours = Math.floor(avgTimeSeconds / 3600);
                const minutes = Math.floor((avgTimeSeconds % 3600) / 60);
                const seconds = Math.floor(avgTimeSeconds % 60);
                // Format as H:MM:SS, but if H is 0, maybe just MM:SS? User asked for H:MM usually but for avg, full precision is mostly better or consistent H:MM
                // Let's stick to H:MM:SS as per original code, just ensuring correctness
                avgTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        const pokemonWithLevel = completedPokemon.filter(p => p.completion_level);
        const avgLevel = pokemonWithLevel.length > 0
            ? (pokemonWithLevel.reduce((acc, p) => acc + p.completion_level, 0) / pokemonWithLevel.length).toFixed(1)
            : 'N/A';

        const remainingPokemon = pokemon.filter(p => !completedPokemon.includes(p) && !dnfPokemon.includes(p.id));
        const dnfPokemonList = pokemon.filter(p => dnfPokemon.includes(p.id));

        return {
            completed,
            completedPokemon,
            remaining,
            remainingPokemon,
            dnfCount,
            dnfPokemonList,
            avgTime,
            avgLevel
        };
    }, [pokemon, placements]);

    // Tier Distribution
    const tierDistribution = useMemo(() => {
        const tiers = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'DNF'];
        return tiers.map(tier => ({
            tier,
            evolved: placements.filter(p => p.tier === tier && (p.tier_type === 'evolved' || p.tier_type === 'fully_evolved')).length,
            preEvolved: placements.filter(p => p.tier === tier && p.tier_type === 'pre_evolved').length
        }));
    }, [placements]);

    // Type Distribution
    const typeDistribution = useMemo(() => {
        const typeCounts = {};
        pokemon.forEach(p => {
            if (p.type_primary) {
                typeCounts[p.type_primary] = (typeCounts[p.type_primary] || 0) + 1;
            }
        });
        return Object.entries(typeCounts)
            .map(([type, count]) => ({ type, count, color: TYPE_COLORS[type] || '#6b7280' }))
            .sort((a, b) => b.count - a.count);
    }, [pokemon]);

    const { data: allMoves = [] } = useQuery({
        queryKey: ['moves'],
        queryFn: () => base44.entities.Move.list('name', 500)
    });

    // Most Common Moves
    const movesDistribution = useMemo(() => {
        const moveCounts = {};
        stats.forEach(stat => {
            if (stat.moves_used) {
                stat.moves_used.forEach(move => {
                    moveCounts[move] = (moveCounts[move] || 0) + 1;
                });
            }
        });
        return Object.entries(moveCounts)
            .map(([move, count]) => {
                const moveData = allMoves.find(m => m.name.toLowerCase() === move.toLowerCase());
                const moveType = moveData?.type || 'Normal';
                return {
                    move,
                    count,
                    type: moveType,
                    color: TYPE_COLORS[moveType] || '#A8A878'
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
    }, [stats, allMoves]);

    // Rank Visualization Data
    const rankData = useMemo(() => {
        let filtered = pokemon.filter(p => {
            const placement = placements.find(pl => pl.pokemon_id === p.id);
            if (!placement) return false;

            if (rankFilter === 'all') return true;

            // New logic based on standardized evolution_stage
            const stage = p.evolution_stage || (p.is_evolved ? 'fully_evolved' : 'basic'); // Fallback if script missed something

            if (rankFilter === 'evolved') {
                // User wants "Evolved" to NOT show Middle. 
                // Usually "Evolved" means "Fully Evolved" in this context + Single Stage?
                // Let's include 'fully_evolved' and 'single_stage'.
                return stage === 'fully_evolved' || stage === 'single_stage';
            }
            if (rankFilter === 'pre-evolved') {
                return stage === 'basic';
            }
            if (rankFilter === 'middle') {
                return stage === 'middle';
            }

            if (rankFilter.startsWith('type-')) {
                const type = rankFilter.replace('type-', '');
                return p.type_primary === type || p.type_secondary === type;
            }
            if (rankFilter.startsWith('tier-')) {
                const tier = rankFilter.replace('tier-', '');
                return placement.tier === tier;
            }
            return true;
        });

        // Map data first
        const mappedData = filtered.map(p => {
            const placement = placements.find(pl => pl.pokemon_id === p.id);
            const allRanked = placements
                .sort((a, b) => {
                    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
                    if (tierDiff !== 0) return tierDiff;
                    return (a.rank_within_tier || 0) - (b.rank_within_tier || 0);
                });
            const rank = allRanked.findIndex(pl => pl.pokemon_id === p.id) + 1;

            let yValue = 0;
            let timeInMinutes = 0;

            if (p.completion_time) {
                const parts = p.completion_time.trim().split(':');
                if (parts.length === 2) {
                    timeInMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                }
            }

            if (rankMetric === 'tier') {
                yValue = tierOrder[placement?.tier] || 0;
            } else if (rankMetric === 'level') {
                yValue = p.completion_level || 0;
            } else if (rankMetric === 'avgStats') {
                yValue = p.base_stats?.average || 0;
            } else if (rankMetric === 'time') {
                yValue = timeInMinutes;
            }

            return {
                name: p.name,
                rank,
                value: yValue,
                tier: placement?.tier,
                level: p.completion_level,
                avgStats: p.base_stats?.average,
                time: p.completion_time,
                timeMinutes: timeInMinutes,
                isMatch: !rankSearch || p.name.toLowerCase().includes(rankSearch.toLowerCase())
            };
        });

        // Sorting Logic
        let sortedData = mappedData;
        if (rankFilter === 'all') {
            sortedData = mappedData.sort((a, b) => {
                if (a.timeMinutes === 0) return 1; // pushed to end
                if (b.timeMinutes === 0) return -1;
                return a.timeMinutes - b.timeMinutes;
            });
        } else {
            // Default sort by Tier Rank
            sortedData = mappedData.sort((a, b) => a.rank - b.rank);
        }

        // RE-RANKING: User requested "fix the Rank numbers based on the now order".
        // This means the X-axis (and rank in tooltip) should be sequential 1..N based on the current sorted view.
        return sortedData.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        // RE-RANKING: User requested "fix the Rank numbers based on the now order".
        // This means the X-axis (and rank in tooltip) should be sequential 1..N based on the current sorted view.
        return sortedData.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

    }, [pokemon, placements, rankFilter, rankMetric, rankSearch]);

    // Avg Stats by Type
    const avgStatsByType = useMemo(() => {
        const typeStats = {};
        pokemon.forEach(p => {
            if (p.type_primary && p.base_stats?.average) {
                if (!typeStats[p.type_primary]) {
                    typeStats[p.type_primary] = { total: 0, count: 0 };
                }
                typeStats[p.type_primary].total += p.base_stats.average;
                typeStats[p.type_primary].count += 1;
            }
        });
        return Object.entries(typeStats)
            .map(([type, data]) => ({
                type,
                avgStats: (data.total / data.count).toFixed(1)
            }))
            .sort((a, b) => b.avgStats - a.avgStats);
    }, [pokemon]);

    const uniqueTypes = useMemo(() => {
        const types = new Set();
        pokemon.forEach(p => {
            if (p.type_primary) types.add(p.type_primary);
            if (p.type_secondary) types.add(p.type_secondary);
        });
        return Array.from(types).sort();
    }, [pokemon]);

    // Radar Chart Data (Global vs Selected Type)
    const radarData = useMemo(() => {
        if (!rankFilter.startsWith('type-')) return null;
        const selectedType = rankFilter.replace('type-', '');

        const getAvgStats = (list) => {
            const sums = { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 };
            let count = 0;
            list.forEach(p => {
                if (p.base_stats) {
                    sums.hp += p.base_stats.hp || 0;
                    sums.attack += p.base_stats.attack || 0;
                    sums.defense += p.base_stats.defense || 0;
                    // API might allow special_attack but Gen 1 uses 'special'. JSON has 'special'.
                    sums.special += p.base_stats.special || 0;
                    sums.speed += p.base_stats.speed || 0;
                    count++;
                }
            });
            return count > 0 ? {
                hp: Math.round(sums.hp / count),
                attack: Math.round(sums.attack / count),
                defense: Math.round(sums.defense / count),
                special: Math.round(sums.special / count),
                speed: Math.round(sums.speed / count)
            } : null;
        };

        const globalAvg = getAvgStats(pokemon);
        const typeAvg = getAvgStats(pokemon.filter(p => p.type_primary === selectedType || p.type_secondary === selectedType));

        if (!globalAvg || !typeAvg) return null;

        return [
            { subject: 'HP', A: globalAvg.hp, B: typeAvg.hp, fullMark: 150 },
            { subject: 'Attack', A: globalAvg.attack, B: typeAvg.attack, fullMark: 150 },
            { subject: 'Defense', A: globalAvg.defense, B: typeAvg.defense, fullMark: 150 },
            { subject: 'Special', A: globalAvg.special, B: typeAvg.special, fullMark: 150 },
            { subject: 'Speed', A: globalAvg.speed, B: typeAvg.speed, fullMark: 150 },
        ];
    }, [pokemon, rankFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Retro scanlines overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-10 z-50"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-b-4 border-yellow-400 shadow-lg rounded-lg mb-6 p-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="outline" className="border-yellow-400 bg-slate-900 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 font-bold">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-white text-xl md:text-3xl flex-1 text-center"
                            style={{ fontFamily: "'Press Start 2P', monospace", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            STATISTICS
                        </h1>
                        <div className="w-24"></div>
                    </div>
                </div>

                {/* Overview Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, staggerChildren: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
                >
                    <Collapsible open={expandedCard === 'completed'} onOpenChange={(open) => setExpandedCard(open ? 'completed' : null)}>
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="bg-slate-800 border-green-600 h-full">
                                <CollapsibleTrigger asChild>
                                    <button className="w-full text-left h-full">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-slate-400 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    Completed
                                                </span>
                                                {expandedCard === 'completed' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-500">
                                                {/* Simple CountUp could be added here, but let's stick to simple text for now or custom component */}
                                                <CountUp end={overviewStats.completed} />
                                            </div>
                                        </CardContent>
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                            {overviewStats.completedPokemon.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => navigate(createPageUrl('PokemonDetail') + '?id=' + p.id)}
                                                    className="w-full text-left text-xs text-slate-300 hover:text-green-400 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                                >
                                                    #{p.pokedex_number} {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </motion.div>
                    </Collapsible>

                    <Collapsible open={expandedCard === 'dnf'} onOpenChange={(open) => setExpandedCard(open ? 'dnf' : null)}>
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="bg-slate-800 border-gray-600 h-full">
                                <CollapsibleTrigger asChild>
                                    <button className="w-full text-left h-full">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-slate-400 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-gray-500" />
                                                    Did Not Finish
                                                </span>
                                                {expandedCard === 'dnf' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-gray-500">{overviewStats.dnfCount}</div>
                                        </CardContent>
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                            {overviewStats.dnfPokemonList.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => navigate(createPageUrl('PokemonDetail') + '?id=' + p.id)}
                                                    className="w-full text-left text-xs text-slate-300 hover:text-gray-400 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                                >
                                                    #{p.pokedex_number} {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </motion.div>
                    </Collapsible>

                    <Collapsible open={expandedCard === 'remaining'} onOpenChange={(open) => setExpandedCard(open ? 'remaining' : null)}>
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="bg-slate-800 border-red-600 h-full">
                                <CollapsibleTrigger asChild>
                                    <button className="w-full text-left h-full">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-slate-400 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    Remaining
                                                </span>
                                                {expandedCard === 'remaining' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-red-500">
                                                <CountUp end={overviewStats.remaining} />
                                            </div>
                                        </CardContent>
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                            {overviewStats.remainingPokemon.length > 0 ? (
                                                overviewStats.remainingPokemon.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => navigate(createPageUrl('PokemonDetail') + '?id=' + p.id)}
                                                        className="w-full text-left text-xs text-slate-300 hover:text-red-400 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                                    >
                                                        #{p.pokedex_number} {p.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="text-xs text-slate-500 px-2">Not yet added to database</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </motion.div>
                    </Collapsible>

                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Card className="bg-slate-800 border-blue-600 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs text-slate-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Avg Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-blue-500">{overviewStats.avgTime}</div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Card className="bg-slate-800 border-purple-600 h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs text-slate-400 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-purple-500" />
                                    Avg Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-500">{overviewStats.avgLevel}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                            <CardTitle className="text-yellow-400 text-sm"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                TIER DISTRIBUTION
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={tierDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="tier" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '2px solid #facc15',
                                            borderRadius: '8px',
                                            padding: '8px'
                                        }}
                                        labelStyle={{ color: '#facc15', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#ffffff' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                                    <Bar dataKey="evolved" fill="#ef4444" name="Evolved" />
                                    <Bar dataKey="preEvolved" fill="#3b82f6" name="Pre-Evolved" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                            <CardTitle className="text-yellow-400 text-sm"
                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                TYPE DISTRIBUTION
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={typeDistribution}
                                        dataKey="count"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(entry) => entry.type}
                                        labelLine={false}
                                    >
                                        {typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '2px solid #facc15',
                                            borderRadius: '8px',
                                            padding: '8px'
                                        }}
                                        labelStyle={{ color: '#facc15', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#ffffff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Most Common Moves */}
                <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 text-sm flex items-center gap-2"
                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                            <Flame className="w-5 h-5" />
                            MOST COMMON MOVES
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={movesDistribution} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis
                                    dataKey="move"
                                    type="category"
                                    stroke="#94a3b8"
                                    width={100}
                                    interval={0}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '2px solid #facc15',
                                        borderRadius: '8px',
                                        padding: '8px'
                                    }}
                                    labelStyle={{ color: '#facc15', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#ffffff' }}
                                    cursor={{ fill: 'rgba(250, 204, 21, 0.1)' }}
                                />
                                <Bar dataKey="count">
                                    {movesDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Average Stats by Type */}
                <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 text-sm"
                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                            AVG BASE STATS BY TYPE
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={avgStatsByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="type" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '2px solid #facc15',
                                        borderRadius: '8px',
                                        padding: '8px'
                                    }}
                                    labelStyle={{ color: '#facc15', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#ffffff' }}
                                />
                                <Bar dataKey="avgStats" fill="#22c55e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Radar Chart (Conditionally Rendered) */}
                <AnimatePresence>
                    {radarData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <Card className="bg-slate-800 border-slate-600">
                                <CardHeader>
                                    <CardTitle className="text-yellow-400 text-sm flex items-center gap-2"
                                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                        <Zap className="w-5 h-5" />
                                        TYPE ANALYSIS: {rankFilter.replace('type-', '')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#475569" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#94a3b8' }} />
                                                <Radar
                                                    name="Global Avg"
                                                    dataKey="A"
                                                    stroke="#94a3b8"
                                                    strokeWidth={2}
                                                    fill="#94a3b8"
                                                    fillOpacity={0.1}
                                                />
                                                <Radar
                                                    name={`${rankFilter.replace('type-', '')} Avg`}
                                                    dataKey="B"
                                                    stroke="#facc15"
                                                    strokeWidth={3}
                                                    fill="#facc15"
                                                    fillOpacity={0.4}
                                                />
                                                <Legend wrapperStyle={{ color: '#fff' }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1e293b',
                                                        border: '2px solid #facc15',
                                                        borderRadius: '8px'
                                                    }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rank Visualization */}
                <Card className="bg-slate-800 border-slate-600">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 text-sm flex items-center gap-2"
                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                            <Trophy className="w-5 h-5" />
                            RANK VISUALIZATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4 mb-4">
                            <div>
                                <label className="text-slate-400 text-xs mb-2 block">Filter By:</label>
                                <Select value={rankFilter} onValueChange={setRankFilter}>
                                    <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Pokemon</SelectItem>
                                        <SelectItem value="evolved">Evolved</SelectItem>
                                        <SelectItem value="pre-evolved">Pre-Evolved</SelectItem>
                                        <SelectItem value="middle">Middle Evolution</SelectItem>
                                        {uniqueTypes.map(type => (
                                            <SelectItem key={type} value={`type-${type}`}>{type}</SelectItem>
                                        ))}
                                        {['S', 'A', 'B', 'C', 'D', 'E', 'F', 'DNF'].map(tier => (
                                            <SelectItem key={tier} value={`tier-${tier}`}>Tier {tier}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-slate-400 text-xs mb-2 block">Y-Axis:</label>
                                <Select value={rankMetric} onValueChange={setRankMetric}>
                                    <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tier">Tier</SelectItem>
                                        <SelectItem value="level">Completion Level</SelectItem>
                                        <SelectItem value="avgStats">Avg Base Stats</SelectItem>
                                        <SelectItem value="time">Completion Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="text-slate-400 text-xs mb-2 flex items-center gap-2">
                                    <Search className="w-3 h-3" />
                                    Search Pokemon:
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Type to highlight..."
                                    value={rankSearch}
                                    onChange={(e) => setRankSearch(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3" />
                            <span>Click a point to view details</span>
                        </div>

                        <ResponsiveContainer width="100%" height={450}>
                            <ScatterChart onClick={(e) => {
                                if (e && e.activePayload && e.activePayload[0]) {
                                    const data = e.activePayload[0].payload;
                                    const poke = pokemon.find(p => p.name === data.name);
                                    if (poke) {
                                        navigate(createPageUrl('PokemonDetail') + '?id=' + poke.id);
                                    }
                                }
                            }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis
                                    dataKey="rank"
                                    name="Rank"
                                    stroke="#94a3b8"
                                    label={{ value: 'Overall Rank', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    dataKey="value"
                                    name={rankMetric === 'tier' ? 'Tier' : rankMetric === 'level' ? 'Level' : rankMetric === 'time' ? 'Time (min)' : 'Avg Stats'}
                                    stroke="#94a3b8"
                                    reversed={rankMetric === 'tier'}
                                    label={{ value: rankMetric === 'tier' ? 'Tier' : rankMetric === 'level' ? 'Completion Level' : rankMetric === 'time' ? 'Completion Time (min)' : 'Avg Base Stats', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const poke = pokemon.find(p => p.name === data.name);
                                            const spriteUrl = poke?.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke?.pokedex_number}.png`;

                                            return (
                                                <div className="bg-slate-900 border-4 border-yellow-400 rounded-lg p-3 shadow-xl z-50">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <img
                                                            src={spriteUrl}
                                                            alt={data.name}
                                                            className="w-16 h-16 object-contain bg-slate-800 rounded border-2 border-slate-600"
                                                            style={{ imageRendering: 'pixelated' }}
                                                        />
                                                        <div>
                                                            <p className="text-yellow-400 font-bold text-sm"
                                                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                                {data.name}
                                                            </p>
                                                            <p className="text-slate-400 text-xs text-left">#{poke?.pokedex_number}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-left">
                                                        <p className="text-white">Rank: <span className="text-yellow-400 font-bold">#{data.rank}</span></p>
                                                        <p className="text-white">Tier: <span className="text-yellow-400 font-bold">{data.tier}</span></p>
                                                        <p className="text-white">Level: <span className="text-green-400 font-bold">{data.level || 'N/A'}</span></p>
                                                        <p className="text-white">Avg Stats: <span className="text-blue-400 font-bold">{data.avgStats || 'N/A'}</span></p>
                                                        {data.time && <p className="text-white">Time: <span className="text-purple-400 font-bold">{data.time}</span></p>}
                                                        <p className="text-slate-400 italic mt-2">Click for details</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter data={rankData}>
                                    {rankData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isMatch ? '#facc15' : '#475569'}
                                            fillOpacity={entry.isMatch ? 1 : 0.3}
                                            stroke={entry.isMatch ? '#facc15' : 'transparent'}
                                        />
                                    ))}
                                </Scatter>
                                <Brush dataKey="rank" height={30} stroke="#facc15" fill="#1e293b" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}