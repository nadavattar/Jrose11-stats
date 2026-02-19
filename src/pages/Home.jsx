import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { useNavigate } from 'react-router-dom';
import PokemonSprite from '@/components/pokemon/PokemonSprite';
import TierList from '@/components/pokemon/TierList';
import { Loader2, Menu, X, Settings, BookOpen, Trophy, Shield, Zap, TrendingUp, Search, Filter, Youtube, Twitch, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const iconMap = {
    'shield': Shield,
    'zap': Zap,
    'trending-up': TrendingUp,
    'book-open': BookOpen
};

// Bug 8 Fix: Extracted shared FilterBar component to eliminate duplicate code
// between the Rules view and the Pokédex view.
const FilterBar = ({
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    showFilters, setShowFilters,
    filterType, setFilterType,
    filterTier, setFilterTier,
    filterStatus, setFilterStatus,
    filterEvolution, setFilterEvolution,
    uniqueTypes
}) => {
    const hasActiveFilters = searchQuery || filterType !== 'all' || filterTier !== 'all' || filterStatus !== 'all' || filterEvolution !== 'all';
    return (
        <div className="mb-6 space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Pokemon..."
                        className="bg-slate-700 border-slate-600 text-white pl-10"
                    />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-36 text-xs">
                        <ArrowUpDown className="w-3 h-3 mr-1" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pokedex_number">#  Pokédex</SelectItem>
                        <SelectItem value="name">A-Z Name</SelectItem>
                        <SelectItem value="tier">Tier (S→F)</SelectItem>
                        <SelectItem value="completion_time">Time</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
                >
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {showFilters && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterTier} onValueChange={setFilterTier}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                <SelectValue placeholder="Tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tiers</SelectItem>
                                {['S', 'A', 'B', 'C', 'D', 'E', 'F', 'DNF'].map(tier => (
                                    <SelectItem key={tier} value={tier}>Tier {tier}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="dnf">Did Not Finish</SelectItem>
                                <SelectItem value="not-started">Not Started</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterEvolution} onValueChange={setFilterEvolution}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                <SelectValue placeholder="Evolution" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Forms</SelectItem>
                                <SelectItem value="evolved">Evolved</SelectItem>
                                <SelectItem value="pre-evolved">Pre-Evolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterType('all');
                                setFilterTier('all');
                                setFilterStatus('all');
                                setFilterEvolution('all');
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                        >
                            Clear Filters
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const [showTiers, setShowTiers] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [tierView, setTierView] = useState('evolution'); // 'overall' or 'evolution'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterTier, setFilterTier] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterEvolution, setFilterEvolution] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('pokedex_number');

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me().catch(() => null)
    });

    const { data: pokemon = [], isLoading: loadingPokemon } = useQuery({
        queryKey: ['pokemon'],
        queryFn: () => base44.entities.Pokemon.list('pokedex_number', 200)
    });

    const { data: placements = [] } = useQuery({
        queryKey: ['placements'],
        queryFn: () => base44.entities.TierPlacement.list()
    });

    const { data: rulesContent = [] } = useQuery({
        queryKey: ['rulesContent'],
        queryFn: () => base44.entities.RulesContent.list('order', 50)
    });

    const overallPlacements = placements.filter(p => p.tier_type === 'overall');
    const preEvolvedPlacements = placements.filter(p => p.tier_type === 'pre_evolved');
    const middleEvolutionPlacements = placements.filter(p => p.tier_type === 'middle_evolution');
    const fullyEvolvedPlacements = placements.filter(p => p.tier_type === 'fully_evolved' || p.tier_type === 'evolved');

    const handlePokemonClick = (poke) => {
        navigate(createPageUrl('PokemonDetail') + '?id=' + poke.id);
    };

    // Get unique types for filter
    const uniqueTypes = useMemo(() => {
        const types = new Set();
        pokemon.forEach(p => {
            if (p.type_primary) types.add(p.type_primary);
            if (p.type_secondary) types.add(p.type_secondary);
        });
        return Array.from(types).sort();
    }, [pokemon]);

    // Filtered and sorted Pokemon
    const filteredPokemon = useMemo(() => {
        const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'DNF': 7 };

        const filtered = pokemon.filter(poke => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = poke.name.toLowerCase().includes(query);
                const matchesNumber = poke.pokedex_number.toString().includes(query);
                if (!matchesName && !matchesNumber) return false;
            }

            // Type filter
            if (filterType !== 'all') {
                if (poke.type_primary !== filterType && poke.type_secondary !== filterType) {
                    return false;
                }
            }

            // Tier filter
            if (filterTier !== 'all') {
                const placement = placements.find(p => p.pokemon_id === poke.id);
                if (!placement || placement.tier !== filterTier) {
                    return false;
                }
            }

            // Status filter
            if (filterStatus !== 'all') {
                const hasCompletion = !!poke.completion_time;
                const isDnf = placements.some(p => p.pokemon_id === poke.id && p.tier === 'DNF');

                if (filterStatus === 'completed' && (!hasCompletion || isDnf)) return false;
                if (filterStatus === 'dnf' && !isDnf) return false;
                if (filterStatus === 'not-started' && (hasCompletion || isDnf)) return false;
            }

            // Evolution filter
            if (filterEvolution !== 'all') {
                if (filterEvolution === 'evolved' && !poke.is_evolved) return false;
                if (filterEvolution === 'pre-evolved' && poke.is_evolved) return false;
            }

            return true;
        });

        // Sort
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'pokedex_number':
                    return (a.pokedex_number || 0) - (b.pokedex_number || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'tier': {
                    const pa = placements.find(p => p.pokemon_id === a.id);
                    const pb = placements.find(p => p.pokemon_id === b.id);
                    const ta = pa ? (tierOrder[pa.tier] ?? 99) : 99;
                    const tb = pb ? (tierOrder[pb.tier] ?? 99) : 99;
                    return ta - tb;
                }
                case 'completion_time': {
                    // Sort completed first (ascending time), then not-completed
                    if (!a.completion_time && !b.completion_time) return 0;
                    if (!a.completion_time) return 1;
                    if (!b.completion_time) return -1;
                    return a.completion_time.localeCompare(b.completion_time);
                }
                default:
                    return 0;
            }
        });
    }, [pokemon, placements, searchQuery, filterType, filterTier, filterStatus, filterEvolution, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Retro scanlines overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-10 z-50"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}
            />

            {/* Header */}
            <header className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-b-4 border-yellow-400 shadow-lg sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-800 flex items-center justify-center shadow-inner">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-slate-700" />
                            </div>
                            <div>
                                <h1 className="text-white text-lg md:text-2xl tracking-wider"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    JROSE11
                                </h1>
                                <p className="text-yellow-300 text-[8px] md:text-xs mt-1"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    RED/BLUE SOLO CHALLENGE
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Social Media Links */}
                            <a href="https://www.youtube.com/@Jrose11" target="_blank" rel="noopener noreferrer" className="hidden md:block">
                                <Button className="bg-red-600 text-white hover:bg-red-700 border-2 border-slate-900 font-bold">
                                    <Youtube className="w-4 h-4" />
                                </Button>
                            </a>
                            <a href="https://twitch.tv/jrose11" target="_blank" rel="noopener noreferrer" className="hidden md:block">
                                <Button className="bg-purple-500 text-white hover:bg-purple-600 border-2 border-slate-900 font-bold">
                                    <Twitch className="w-4 h-4" />
                                </Button>
                            </a>
                            <a href="https://twitter.com/TheJrose11" target="_blank" rel="noopener noreferrer" className="hidden md:block">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-900 font-bold">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </Button>
                            </a>

                            <Link to={createPageUrl('Statistics')}>
                                <Button className="bg-green-600 text-white hover:bg-green-700 border-2 border-slate-900 font-bold">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">STATS</span>
                                </Button>
                            </Link>

                            <Link to={createPageUrl('Comparison')}>
                                <Button className="bg-purple-600 text-white hover:bg-purple-700 border-2 border-slate-900 font-bold">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">COMPARE</span>
                                </Button>
                            </Link>

                            <Button
                                onClick={() => setShowRules(!showRules)}
                                className={`${showRules ? 'bg-yellow-400 text-slate-900' : 'bg-blue-600 text-white hover:bg-blue-700'} border-2 border-slate-900 font-bold`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">{showRules ? 'POKEMON' : 'RULES'}</span>
                            </Button>

                            {user?.role === 'admin' && (
                                <Link to={createPageUrl('Admin')}>
                                    <Button className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 border-2 border-slate-900 font-bold">
                                        <Settings className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">ADMIN</span>
                                    </Button>
                                </Link>
                            )}

                            {/* Mobile tier toggle */}
                            <button
                                onClick={() => setShowTiers(!showTiers)}
                                className="lg:hidden text-white bg-slate-800 p-2 rounded-lg border-2 border-yellow-400"
                            >
                                {showTiers ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content Area */}
                    <div className="flex-1">
                        {showRules ? (
                            <div className="bg-slate-800/50 border-4 border-slate-600 rounded-xl p-4 shadow-xl">
                                <h2 className="text-yellow-400 text-sm mb-4 text-center"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    RULES & GEN 1 QUIRKS
                                </h2>

                                {/* Search and Filters */}
                                <FilterBar
                                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                    sortBy={sortBy} setSortBy={setSortBy}
                                    showFilters={showFilters} setShowFilters={setShowFilters}
                                    filterType={filterType} setFilterType={setFilterType}
                                    filterTier={filterTier} setFilterTier={setFilterTier}
                                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                                    filterEvolution={filterEvolution} setFilterEvolution={setFilterEvolution}
                                    uniqueTypes={uniqueTypes}
                                />

                                <div className="space-y-4">
                                    {rulesContent.length === 0 ? (
                                        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-12 text-center">
                                            <p className="text-slate-400 text-sm">No rules content yet. Add content via the Admin panel.</p>
                                        </div>
                                    ) : (
                                        rulesContent.map((section) => {
                                            const IconComponent = iconMap[section.icon] || BookOpen;
                                            return (
                                                <section key={section.id} className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <IconComponent className="w-5 h-5 text-yellow-400" />
                                                        <h3 className="text-yellow-400 text-xs"
                                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                            {section.title}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
                                                        {section.subsections?.map((sub, i) => (
                                                            <div key={i}>
                                                                {sub.subtitle && (
                                                                    <h4 className="text-white font-bold mb-1">{sub.subtitle}</h4>
                                                                )}
                                                                {sub.content && (
                                                                    <p className="ml-4 whitespace-pre-wrap">{sub.content}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 border-4 border-slate-600 rounded-xl p-4 shadow-xl">
                                <h2 className="text-yellow-400 text-sm mb-4 text-center"
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                    KANTO POKEDEX
                                </h2>

                                {/* Search and Filters */}
                                <FilterBar
                                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                    sortBy={sortBy} setSortBy={setSortBy}
                                    showFilters={showFilters} setShowFilters={setShowFilters}
                                    filterType={filterType} setFilterType={setFilterType}
                                    filterTier={filterTier} setFilterTier={setFilterTier}
                                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                                    filterEvolution={filterEvolution} setFilterEvolution={setFilterEvolution}
                                    uniqueTypes={uniqueTypes}
                                />

                                {loadingPokemon ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
                                    </div>
                                ) : pokemon.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-slate-400 text-sm"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            NO POKEMON ADDED YET
                                        </p>
                                        <p className="text-slate-500 text-xs mt-2">
                                            Add Pokemon via the Admin Panel
                                        </p>
                                    </div>
                                ) : filteredPokemon.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-slate-400 text-sm"
                                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                            NO POKEMON MATCH YOUR FILTERS
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2 justify-items-center">
                                        {filteredPokemon.map(poke => (
                                            <PokemonSprite
                                                key={poke.id}
                                                pokemon={poke}
                                                isSelected={false}
                                                onClick={() => handlePokemonClick(poke)}
                                                hasStats={!!(poke.completion_time || poke.completion_level)}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded ring-2 ring-green-400 bg-slate-600" />
                                        <span>Has Run Data</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tier Lists Sidebar */}
                    <div className={`lg:w-80 space-y-4 ${showTiers ? 'block' : 'hidden lg:block'}`}>
                        {/* Toggle between overall and evolution views */}
                        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTierView('overall')}
                                    className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${tierView === 'overall'
                                        ? 'bg-yellow-400 text-slate-900'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                                >
                                    OVERALL
                                </button>
                                <button
                                    onClick={() => setTierView('evolution')}
                                    className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${tierView === 'evolution'
                                        ? 'bg-yellow-400 text-slate-900'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                                >
                                    BY EVOLUTION
                                </button>
                            </div>
                        </div>

                        {tierView === 'overall' ? (
                            <TierList
                                title="OVERALL TIER"
                                placements={overallPlacements}
                                pokemon={pokemon}
                                onPokemonClick={handlePokemonClick}
                            />
                        ) : (
                            <>
                                <TierList
                                    title="FULLY EVOLVED"
                                    placements={fullyEvolvedPlacements}
                                    pokemon={pokemon}
                                    onPokemonClick={handlePokemonClick}
                                />
                                <TierList
                                    title="MIDDLE EVOLUTION"
                                    placements={middleEvolutionPlacements}
                                    pokemon={pokemon}
                                    onPokemonClick={handlePokemonClick}
                                />
                                <TierList
                                    title="PRE-EVOLVED TIER"
                                    placements={preEvolvedPlacements}
                                    pokemon={pokemon}
                                    onPokemonClick={handlePokemonClick}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}