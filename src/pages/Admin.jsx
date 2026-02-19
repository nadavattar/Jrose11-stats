import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Loader2, ArrowLeft, Search, Check, ChevronsUpDown, Upload, Download, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import TierManagementPanel from '../components/admin/TierManagementPanel';

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

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const res = await base44.auth.login(password);
            if (res.success) {
                setIsAuthenticated(true);
                localStorage.setItem('admin_auth_token', 'valid');
            } else {
                setAuthError('Invalid password');
            }
        } catch (err) {
            console.error(err);
            setAuthError('Login failed');
        }
    };

    React.useEffect(() => {
        const token = localStorage.getItem('admin_auth_token');
        if (token === 'valid') {
            setIsAuthenticated(true);
        }
        setCheckingAuth(false);
    }, []);

    if (checkingAuth) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        </div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Admin Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white">Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="Enter admin password"
                                />
                            </div>
                            {authError && (
                                <div className="text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {authError}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold">
                                Unlock Panel
                            </Button>
                            <Link to="/" className="block text-center text-slate-400 hover:text-white text-sm mt-4">
                                Return directly to Home
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <AdminDashboard />;
}

// ORIGINAL ADMIN COMPONENT CONTENT STARTS HERE
function AdminDashboard() {
    const queryClient = useQueryClient();
    const [selectedPokemonId, setSelectedPokemonId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pokemon form state
    const [pokemonForm, setPokemonForm] = useState({
        pokedex_number: '',
        name: '',
        type_primary: '',
        type_secondary: '',
        sprite_url: '',
        youtube_url: '',
        is_evolved: false,
        evolution_stage: 'pre_evolved',
        rank: '',
        base_stats: { hp: '', attack: '', defense: '', sp_attack: '', sp_defense: '', speed: '' },
        moves_level_up: [],
        moves_tm: []
    });
    const [editingPokemonId, setEditingPokemonId] = useState(null);

    // Stats form state
    const [statsForm, setStatsForm] = useState({
        pokemon_id: '',
        game_version: 'red',
        completion_time: '',
        completion_level: '',
        total_losses: '',
        battle_timestamps: {},
        battle_losses: {},
        battle_order: {},
        moves_used: [],
        notes: ''
    });
    const [editingStatsId, setEditingStatsId] = useState(null);

    // Tier form state
    const [tierForm, setTierForm] = useState({
        pokemon_id: '',
        tier_type: 'overall',
        tier: 'S',
        rank_within_tier: 0
    });

    const [evolutionTierForm, setEvolutionTierForm] = useState({
        pokemon_id: '',
        tier_type: 'pre_evolved',
        tier: 'S',
        rank_within_tier: 0
    });

    // Rules form state
    const [ruleForm, setRuleForm] = useState({
        section_key: '',
        title: '',
        icon: 'shield',
        order: 0,
        subsections: []
    });
    const [editingRuleId, setEditingRuleId] = useState(null);

    // Bulk update state
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkProgress, setBulkProgress] = useState('');
    const [bulkResults, setBulkResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Bulk moves update state
    const [bulkMovesFile, setBulkMovesFile] = useState(null);
    const [bulkMovesProgress, setBulkMovesProgress] = useState('');
    const [bulkMovesResults, setBulkMovesResults] = useState([]);
    const [isProcessingMoves, setIsProcessingMoves] = useState(false);

    // Queries
    const { data: pokemon = [], isLoading: loadingPokemon } = useQuery({
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

    const { data: moves = [] } = useQuery({
        queryKey: ['moves'],
        queryFn: () => base44.entities.Move.list('name', 500)
    });

    const { data: rulesContent = [] } = useQuery({
        queryKey: ['rulesContent'],
        queryFn: () => base44.entities.RulesContent.list('order', 50)
    });

    // Mutations
    const createPokemon = useMutation({
        mutationFn: (/** @type {any} */ data) => base44.entities.Pokemon.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pokemon'] });
            resetPokemonForm();
        }
    });

    const updatePokemon = useMutation({
        mutationFn: (/** @type {any} */ { id, data }) => base44.entities.Pokemon.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pokemon'] });
            resetPokemonForm();
        }
    });

    const deletePokemon = useMutation({
        mutationFn: (/** @type {string} */ id) => base44.entities.Pokemon.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pokemon'] })
    });

    const createStats = useMutation({
        mutationFn: (/** @type {any} */ data) => base44.entities.RunStatistics.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            resetStatsForm();
        }
    });

    const updateStats = useMutation({
        mutationFn: (/** @type {any} */ { id, data }) => base44.entities.RunStatistics.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            resetStatsForm();
        }
    });

    const deleteStats = useMutation({
        mutationFn: (/** @type {string} */ id) => base44.entities.RunStatistics.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stats'] })
    });

    const createTier = useMutation({
        mutationFn: (/** @type {any} */ data) => base44.entities.TierPlacement.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['placements'] });
            setTierForm({ pokemon_id: '', tier_type: 'overall', tier: 'S', rank_within_tier: 0 });
        }
    });

    const deleteTier = useMutation({
        mutationFn: (/** @type {string} */ id) => base44.entities.TierPlacement.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements'] })
    });

    const createRule = useMutation({
        mutationFn: (/** @type {any} */ data) => base44.entities.RulesContent.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rulesContent'] });
            setRuleForm({ section_key: '', title: '', icon: 'shield', order: 0, subsections: [] });
        }
    });

    const updateRule = useMutation({
        mutationFn: (/** @type {any} */ { id, data }) => base44.entities.RulesContent.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rulesContent'] });
            setRuleForm({ section_key: '', title: '', icon: 'shield', order: 0, subsections: [] });
            setEditingRuleId(null);
        }
    });

    const deleteRule = useMutation({
        mutationFn: (/** @type {string} */ id) => base44.entities.RulesContent.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rulesContent'] })
    });

    // Form helpers
    const resetPokemonForm = () => {
        setPokemonForm({
            pokedex_number: '',
            name: '',
            type_primary: '',
            type_secondary: '',
            sprite_url: '',
            youtube_url: '',
            is_evolved: false,
            evolution_stage: 'pre_evolved',
            rank: '',
            base_stats: { hp: '', attack: '', defense: '', sp_attack: '', sp_defense: '', speed: '' },
            moves_level_up: [],
            moves_tm: []
        });
        setEditingPokemonId(null);
    };

    const resetStatsForm = () => {
        setStatsForm({
            pokemon_id: '',
            game_version: 'red',
            completion_time: '',
            completion_level: '',
            total_losses: '',
            battle_timestamps: {},
            battle_losses: {},
            battle_order: {},
            moves_used: [],
            notes: ''
        });
        setEditingStatsId(null);
    };

    const loadPokemonForEdit = (poke) => {
        setPokemonForm({
            pokedex_number: poke.pokedex_number || '',
            name: poke.name || '',
            type_primary: poke.type_primary || '',
            type_secondary: poke.type_secondary || '',
            sprite_url: poke.sprite_url || '',
            youtube_url: poke.youtube_url || '',
            is_evolved: poke.is_evolved || false,
            evolution_stage: poke.evolution_stage || (poke.is_evolved ? 'fully_evolved' : 'pre_evolved'),
            rank: poke.rank || '',
            base_stats: poke.base_stats || { hp: '', attack: '', defense: '', sp_attack: '', sp_defense: '', speed: '' },
            moves_level_up: poke.moves_level_up || [],
            moves_tm: poke.moves_tm || []
        });
        setEditingPokemonId(poke.id);
    };

    const loadStatsForEdit = (stat) => {
        setStatsForm({
            pokemon_id: stat.pokemon_id || '',
            game_version: stat.game_version || 'red',
            completion_time: stat.completion_time || '',
            completion_level: stat.completion_level || '',
            total_losses: stat.total_losses || '',
            battle_timestamps: stat.battle_timestamps || {},
            battle_losses: stat.battle_losses || {},
            battle_order: stat.battle_order || {},
            moves_used: stat.moves_used || [],
            notes: stat.notes || ''
        });
        setEditingStatsId(stat.id);
    };

    const handlePokemonSubmit = () => {
        const data = {
            ...pokemonForm,
            pokedex_number: Number(pokemonForm.pokedex_number),
            rank: Number(pokemonForm.rank) || 0,
            base_stats: {
                hp: Number(pokemonForm.base_stats.hp) || 0,
                attack: Number(pokemonForm.base_stats.attack) || 0,
                defense: Number(pokemonForm.base_stats.defense) || 0,
                speed: Number(pokemonForm.base_stats.speed) || 0,
                special: Number(pokemonForm.base_stats.special) || 0,
                total: Number(pokemonForm.base_stats.total) || 0,
                average: Number(pokemonForm.base_stats.average) || 0
            }
        };

        if (editingPokemonId) {
            updatePokemon.mutate({ id: editingPokemonId, data });
        } else {
            createPokemon.mutate(data);
        }
    };

    const handleStatsSubmit = async () => {
        // Calculate total losses from battle_losses, handling estimated losses (with +)
        let totalLosses = 0;
        let hasEstimated = false;

        Object.values(statsForm.battle_losses).forEach(losses => {
            // 1. Guard clause: skip if null, undefined, or empty string
            if (losses === null || losses === undefined || losses === '') return;

            // 2. Convert to string to safely check for the '+' symbol
            const lossStr = String(losses);

            if (lossStr.includes('+')) {
                hasEstimated = true;
                // Remove the plus and convert to number
                totalLosses += Number(lossStr.replace('+', '')) || 0;
            } else {
                // 3. Directly convert to number (works for "100" or the integer 100)
                totalLosses += Number(lossStr) || 0;
            }
        });

        const totalLossesDisplay = hasEstimated ? `${totalLosses}+` : String(totalLosses);

        const data = {
            ...statsForm,
            completion_level: Number(statsForm.completion_level) || 0,
            total_losses: totalLossesDisplay
        };

        if (editingStatsId) {
            await updateStats.mutateAsync({ id: editingStatsId, data });
        } else {
            await createStats.mutateAsync(data);
        }

        // Update Pokemon entity with completion data
        if (statsForm.pokemon_id) {
            const selectedPoke = pokemon.find(p => p.id === statsForm.pokemon_id);
            if (selectedPoke) {
                await base44.entities.Pokemon.update(statsForm.pokemon_id, {
                    completion_time: statsForm.completion_time || selectedPoke.completion_time,
                    completion_level: Number(statsForm.completion_level) || selectedPoke.completion_level || 0
                });
                queryClient.invalidateQueries({ queryKey: ['pokemon'] });
            }
        }
    };

    const addLevelMove = () => {
        setPokemonForm(prev => ({
            ...prev,
            moves_level_up: [...prev.moves_level_up, { level: '', move: '' }]
        }));
    };

    const updateLevelMove = (index, field, value) => {
        setPokemonForm(prev => ({
            ...prev,
            moves_level_up: prev.moves_level_up.map((m, i) =>
                i === index ? { ...m, [field]: field === 'level' ? Number(value) : value } : m
            )
        }));
    };

    const [levelMoveOpenIndex, setLevelMoveOpenIndex] = useState(null);

    const removeLevelMove = (index) => {
        setPokemonForm(prev => ({
            ...prev,
            moves_level_up: prev.moves_level_up.filter((_, i) => i !== index)
        }));
    };

    const [tmMoveOpen, setTmMoveOpen] = useState(false);
    const [tmMoveSearch, setTmMoveSearch] = useState('');
    const addTmMove = (moveName) => {
        if (moveName && !pokemonForm.moves_tm.includes(moveName)) {
            setPokemonForm(prev => ({
                ...prev,
                moves_tm: [...prev.moves_tm, moveName]
            }));
        }
        setTmMoveOpen(false);
        setTmMoveSearch('');
    };

    const removeTmMove = (index) => {
        setPokemonForm(prev => ({
            ...prev,
            moves_tm: prev.moves_tm.filter((_, i) => i !== index)
        }));
    };

    const [runMoveOpen, setRunMoveOpen] = useState(false);
    const [runMoveSearch, setRunMoveSearch] = useState('');
    const addRunMove = (moveName) => {
        if (moveName && !statsForm.moves_used.includes(moveName)) {
            setStatsForm(prev => ({
                ...prev,
                moves_used: [...prev.moves_used, moveName]
            }));
        }
        setRunMoveOpen(false);
        setRunMoveSearch('');
    };

    const removeRunMove = (index) => {
        setStatsForm(prev => ({
            ...prev,
            moves_used: prev.moves_used.filter((_, i) => i !== index)
        }));
    };

    const getPokemonName = (id) => {
        const poke = pokemon.find(p => p.id === id);
        return poke ? poke.name : 'Unknown';
    };

    const selectedPokemon = useMemo(() =>
        pokemon.find(p => p.id === selectedPokemonId),
        [pokemon, selectedPokemonId]
    );

    const selectedStats = useMemo(() =>
        stats.filter(s => s.pokemon_id === selectedPokemonId),
        [stats, selectedPokemonId]
    );

    const selectedPlacements = useMemo(() =>
        placements.filter(p => p.pokemon_id === selectedPokemonId),
        [placements, selectedPokemonId]
    );

    const filteredPokemon = useMemo(() => {
        if (!searchQuery.trim()) return pokemon;
        const query = searchQuery.toLowerCase();
        return pokemon.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.pokedex_number.toString().includes(query)
        );
    }, [pokemon, searchQuery]);

    const downloadJsonTemplate = () => {
        const jsonContent = JSON.stringify([
            {
                "pokemon_id": "your_pokemon_id_here",
                "moves_used": ["Thunder", "Psychic", "Body Slam", "Thunderbolt"]
            },
            {
                "pokemon_id": "another_pokemon_id",
                "moves_used": ["Surf", "Ice Beam", "Thunderbolt"]
            }
        ], null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_moves_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const downloadMovesTemplate = () => {
        const jsonContent = JSON.stringify([
            {
                "name": "bulbasaur",
                "level_up_moves": [
                    { "level": 1, "move": "tackle" },
                    { "level": 1, "move": "growl" },
                    { "level": 7, "move": "leech-seed" }
                ],
                "tm_moves": [
                    "swords-dance",
                    "cut",
                    "body-slam"
                ]
            },
            {
                "name": "charmander",
                "level_up_moves": [
                    { "level": 1, "move": "scratch" },
                    { "level": 1, "move": "growl" }
                ],
                "tm_moves": [
                    "mega-punch",
                    "swords-dance"
                ]
            }
        ], null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon_moves_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const downloadPokemonReference = () => {
        let csvContent = "pokemon_id,pokedex_number,name\n";
        pokemon.forEach(p => {
            csvContent += `${p.id},${p.pokedex_number},${p.name}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon_id_reference.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            setBulkProgress('Please select a file first.');
            return;
        }

        setIsProcessing(true);
        setBulkProgress('Reading file...');
        setBulkResults([]);

        try {
            // Step 1: Read JSON file
            const fileText = await bulkFile.text();
            let parsedData;

            try {
                parsedData = JSON.parse(fileText);
            } catch (parseError) {
                setBulkProgress(`❌ Invalid JSON: ${parseError.message}`);
                setBulkResults([{
                    pokemon_id: 'N/A',
                    status: 'error',
                    message: `JSON parsing failed - ${parseError.message}. Make sure your file is valid JSON.`
                }]);
                setIsProcessing(false);
                return;
            }

            if (!Array.isArray(parsedData)) {
                setBulkProgress('❌ JSON must be an array of objects');
                setBulkResults([{
                    pokemon_id: 'N/A',
                    status: 'error',
                    message: 'JSON must be an array of objects with pokemon_id and moves_used fields'
                }]);
                setIsProcessing(false);
                return;
            }

            setBulkProgress(`Found ${parsedData.length} records. Updating database...`);

            // Step 3: Process each record
            const results = [];
            for (let i = 0; i < parsedData.length; i++) {
                const item = parsedData[i];
                try {
                    // Validate row data
                    if (!item.pokemon_id) {
                        results.push({
                            pokemon_id: 'Row ' + (i + 1),
                            status: 'error',
                            message: 'Missing pokemon_id'
                        });
                        continue;
                    }

                    if (!item.moves_used) {
                        results.push({
                            pokemon_id: item.pokemon_id,
                            status: 'error',
                            message: 'Missing moves_used'
                        });
                        continue;
                    }

                    // Parse moves - handle both array and string formats
                    let movesArray;
                    if (Array.isArray(item.moves_used)) {
                        movesArray = item.moves_used.filter(move => move && move.trim().length > 0);
                    } else if (typeof item.moves_used === 'string') {
                        movesArray = item.moves_used
                            .split(',')
                            .map(move => move.trim())
                            .filter(move => move.length > 0);
                    } else {
                        throw new Error('moves_used must be an array or comma-separated string');
                    }

                    if (movesArray.length === 0) {
                        results.push({
                            pokemon_id: item.pokemon_id,
                            status: 'error',
                            message: 'No valid moves found'
                        });
                        continue;
                    }

                    // Find RunStatistics record
                    const existingStats = await base44.entities.RunStatistics.filter({
                        pokemon_id: item.pokemon_id
                    });

                    if (existingStats.length > 0) {
                        await base44.entities.RunStatistics.update(existingStats[0].id, {
                            moves_used: movesArray
                        });
                        results.push({
                            pokemon_id: item.pokemon_id,
                            status: 'success',
                            message: `Updated with ${movesArray.length} moves`
                        });
                    } else {
                        results.push({
                            pokemon_id: item.pokemon_id,
                            status: 'warning',
                            message: 'No RunStatistics record found for this Pokemon'
                        });
                    }
                } catch (error) {
                    results.push({
                        pokemon_id: item.pokemon_id || 'Row ' + (i + 1),
                        status: 'error',
                        message: `Error: ${error.message}`
                    });
                }

                setBulkProgress(`Processing ${i + 1}/${parsedData.length}...`);
            }

            setBulkResults(results);
            setBulkProgress('Bulk update complete!');
            queryClient.invalidateQueries({ queryKey: ['stats'] });

        } catch (error) {
            setBulkProgress(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkMovesUpload = async () => {
        if (!bulkMovesFile) {
            setBulkMovesProgress('Please select a file first.');
            return;
        }

        setIsProcessingMoves(true);
        setBulkMovesProgress('Reading file...');
        setBulkMovesResults([]);

        try {
            const fileText = await bulkMovesFile.text();
            let parsedData;

            try {
                parsedData = JSON.parse(fileText);
            } catch (parseError) {
                setBulkMovesProgress(`❌ Invalid JSON: ${parseError.message}`);
                setBulkMovesResults([{
                    name: 'N/A',
                    status: 'error',
                    message: `JSON parsing failed - ${parseError.message}`
                }]);
                setIsProcessingMoves(false);
                return;
            }

            if (!Array.isArray(parsedData)) {
                setBulkMovesProgress('❌ JSON must be an array of objects');
                setBulkMovesResults([{
                    name: 'N/A',
                    status: 'error',
                    message: 'JSON must be an array with name, level_up_moves, and tm_moves'
                }]);
                setIsProcessingMoves(false);
                return;
            }

            setBulkMovesProgress(`Found ${parsedData.length} Pokemon. Updating...`);

            const results = [];
            for (let i = 0; i < parsedData.length; i++) {
                const item = parsedData[i];
                try {
                    if (!item.name) {
                        results.push({
                            name: 'Row ' + (i + 1),
                            status: 'error',
                            message: 'Missing name field'
                        });
                        continue;
                    }

                    // Find Pokemon by name (case insensitive)
                    const pokemonRecord = pokemon.find(p =>
                        p.name.toLowerCase() === item.name.toLowerCase()
                    );

                    if (!pokemonRecord) {
                        results.push({
                            name: item.name,
                            status: 'error',
                            message: 'Pokemon not found in database'
                        });
                        continue;
                    }

                    const updateData = {};

                    // Process level-up moves
                    if (item.level_up_moves && Array.isArray(item.level_up_moves)) {
                        updateData.moves_level_up = item.level_up_moves.map(m => ({
                            level: Number(m.level) || 0,
                            move: m.move
                        }));
                    }

                    // Process TM moves
                    if (item.tm_moves && Array.isArray(item.tm_moves)) {
                        updateData.moves_tm = item.tm_moves;
                    }

                    if (Object.keys(updateData).length === 0) {
                        results.push({
                            name: item.name,
                            status: 'warning',
                            message: 'No moves data to update'
                        });
                        continue;
                    }

                    await base44.entities.Pokemon.update(pokemonRecord.id, updateData);

                    const movesSummary = [];
                    if (updateData.moves_level_up) movesSummary.push(`${updateData.moves_level_up.length} level-up`);
                    if (updateData.moves_tm) movesSummary.push(`${updateData.moves_tm.length} TM`);

                    results.push({
                        name: item.name,
                        status: 'success',
                        message: `Updated with ${movesSummary.join(', ')} moves`
                    });

                } catch (error) {
                    results.push({
                        name: item.name || 'Row ' + (i + 1),
                        status: 'error',
                        message: `Error: ${error.message}`
                    });
                }

                setBulkMovesProgress(`Processing ${i + 1}/${parsedData.length}...`);
            }

            setBulkMovesResults(results);
            setBulkMovesProgress('Bulk moves update complete!');
            queryClient.invalidateQueries({ queryKey: ['pokemon'] });

        } catch (error) {
            setBulkMovesProgress(`Error: ${error.message}`);
        } finally {
            setIsProcessingMoves(false);
        }
    };

    const handleSelectPokemon = (poke) => {
        setSelectedPokemonId(poke.id);
        loadPokemonForEdit(poke);

        // Auto-load existing run stats if available
        const existingStats = stats.find(s => s.pokemon_id === poke.id);
        if (existingStats) {
            loadStatsForEdit(existingStats);
        } else {
            setStatsForm(prev => ({ ...prev, pokemon_id: poke.id }));
        }

        // Auto-load existing tier placements
        const overallPlacement = placements.find(p => p.pokemon_id === poke.id && p.tier_type === 'overall');
        if (overallPlacement) {
            setTierForm({
                pokemon_id: poke.id,
                tier_type: 'overall',
                tier: overallPlacement.tier,
                rank_within_tier: overallPlacement.rank_within_tier
            });
        } else {
            setTierForm({ pokemon_id: poke.id, tier_type: 'overall', tier: 'S', rank_within_tier: 0 });
        }

        const evolutionStage = poke.evolution_stage || (poke.is_evolved ? 'fully_evolved' : 'pre_evolved');
        const evolutionPlacement = placements.find(p => p.pokemon_id === poke.id && p.tier_type === evolutionStage);
        if (evolutionPlacement) {
            setEvolutionTierForm({
                pokemon_id: poke.id,
                tier_type: evolutionStage,
                tier: evolutionPlacement.tier,
                rank_within_tier: evolutionPlacement.rank_within_tier
            });
        } else {
            setEvolutionTierForm({ pokemon_id: poke.id, tier_type: evolutionStage, tier: 'S', rank_within_tier: 0 });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Site
                        </Button>
                    </Link>
                    <h1 className="text-yellow-400 text-xl md:text-2xl"
                        style={{ fontFamily: "'Press Start 2P', monospace" }}>
                        ADMIN PANEL
                    </h1>
                </div>

                {/* Pokemon Search and Selection */}
                <Card className="bg-slate-800 border-slate-600 mb-6">
                    <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center gap-2"
                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                            <Search className="w-4 h-4" />
                            SELECT POKEMON
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or number..."
                                    className="bg-slate-700 border-slate-600 text-white pl-10"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                                {filteredPokemon.map(poke => (
                                    <button
                                        key={poke.id}
                                        onClick={() => handleSelectPokemon(poke)}
                                        className={`p-2 rounded border-2 transition-all ${selectedPokemonId === poke.id
                                            ? 'border-yellow-400 bg-yellow-400/20'
                                            : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                                            }`}
                                    >
                                        <img
                                            src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                            alt={poke.name}
                                            className="w-full h-auto"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                        <div className="text-xs text-white mt-1 truncate">#{poke.pokedex_number}</div>
                                        <div className="text-xs text-slate-300 truncate">{poke.name}</div>
                                    </button>
                                ))}
                            </div>

                            {selectedPokemon && (
                                <div className="bg-slate-700 rounded p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedPokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.pokedex_number}.png`}
                                            alt={selectedPokemon.name}
                                            className="w-16 h-16"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                        <div>
                                            <h3 className="text-white font-bold text-lg">#{selectedPokemon.pokedex_number} {selectedPokemon.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                {selectedPokemon.type_primary && (
                                                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">{selectedPokemon.type_primary}</span>
                                                )}
                                                {selectedPokemon.type_secondary && (
                                                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">{selectedPokemon.type_secondary}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedPokemonId(null);
                                            resetPokemonForm();
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue={selectedPokemon ? "pokemon" : "rules"} className="mb-6">
                    <TabsList className="bg-slate-800 border-2 border-slate-600 mb-6 w-full overflow-x-auto flex-nowrap justify-start">
                        <TabsTrigger value="pokemon" className="data-[state=active]:bg-red-600 data-[state=active]:text-white shrink-0" disabled={!selectedPokemon}>
                            Pokemon Data
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="data-[state=active]:bg-red-600 data-[state=active]:text-white shrink-0" disabled={!selectedPokemon}>
                            Run Stats
                        </TabsTrigger>
                        <TabsTrigger value="tiers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white shrink-0" disabled={!selectedPokemon}>
                            Tier Placement
                        </TabsTrigger>
                        <TabsTrigger value="bulk" className="data-[state=active]:bg-red-600 data-[state=active]:text-white shrink-0">
                            Bulk Update
                        </TabsTrigger>
                        <TabsTrigger value="rules" className="data-[state=active]:bg-red-600 data-[state=active]:text-white shrink-0">
                            Rules & Quirks
                        </TabsTrigger>
                    </TabsList>

                    {/* Pokemon Tab */}
                    <TabsContent value="pokemon">
                        <Card className="bg-slate-800 border-slate-600">
                            <CardHeader>
                                <CardTitle className="text-yellow-400"
                                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                    EDIT POKEMON DATA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Pokedex #</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="151"
                                            value={pokemonForm.pokedex_number}
                                            onChange={(e) => setPokemonForm(prev => ({ ...prev, pokedex_number: e.target.value }))}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Name</Label>
                                        <Input
                                            value={pokemonForm.name}
                                            onChange={(e) => setPokemonForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Primary Type</Label>
                                        <Input
                                            value={pokemonForm.type_primary}
                                            onChange={(e) => setPokemonForm(prev => ({ ...prev, type_primary: e.target.value }))}
                                            placeholder="e.g. Fire, Water, Grass"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Secondary Type</Label>
                                        <Input
                                            value={pokemonForm.type_secondary}
                                            onChange={(e) => setPokemonForm(prev => ({ ...prev, type_secondary: e.target.value }))}
                                            placeholder="Optional"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Sprite URL (optional)</Label>
                                    <Input
                                        value={pokemonForm.sprite_url}
                                        onChange={(e) => setPokemonForm(prev => ({ ...prev, sprite_url: e.target.value }))}
                                        placeholder="Uses PokeAPI sprite if empty"
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">YouTube URL</Label>
                                    <Input
                                        value={pokemonForm.youtube_url || ''}
                                        onChange={(e) => setPokemonForm(prev => ({ ...prev, youtube_url: e.target.value }))}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Evolution Stage</Label>
                                        <Select
                                            value={pokemonForm.evolution_stage}
                                            onValueChange={(val) => setPokemonForm(prev => ({ ...prev, evolution_stage: val }))}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pre_evolved">Pre-Evolved</SelectItem>
                                                <SelectItem value="middle_evolution">Middle Evolution</SelectItem>
                                                <SelectItem value="fully_evolved">Fully Evolved</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">Overall Rank #</Label>
                                        <Input
                                            type="number"
                                            value={pokemonForm.rank}
                                            onChange={(e) => setPokemonForm(prev => ({ ...prev, rank: e.target.value }))}
                                            placeholder="Overall ranking"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-slate-300 mb-2 block">Base Stats</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['hp', 'attack', 'defense', 'speed', 'special'].map(stat => (
                                            <div key={stat}>
                                                <Label className="text-slate-400 text-xs capitalize">{stat}</Label>
                                                <Input
                                                    type="number"
                                                    value={pokemonForm.base_stats[stat]}
                                                    onChange={(e) => {
                                                        const newStats = { ...pokemonForm.base_stats, [stat]: e.target.value };
                                                        const total = ['hp', 'attack', 'defense', 'speed', 'special'].reduce((sum, s) => sum + (Number(newStats[s]) || 0), 0);
                                                        const average = total / 5;
                                                        setPokemonForm(prev => ({
                                                            ...prev,
                                                            base_stats: { ...newStats, total, average: parseFloat(average.toFixed(1)) }
                                                        }));
                                                    }}
                                                    className="bg-slate-700 border-slate-600 text-white"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <Label className="text-slate-400 text-xs">Total</Label>
                                            <Input
                                                type="number"
                                                value={pokemonForm.base_stats.total || ''}
                                                disabled
                                                className="bg-slate-600 border-slate-500 text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs">Average</Label>
                                            <Input
                                                type="number"
                                                value={pokemonForm.base_stats.average || ''}
                                                disabled
                                                className="bg-slate-600 border-slate-500 text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-slate-300">Level Up Moves</Label>
                                        <Button size="sm" onClick={addLevelMove} variant="outline" className="border-yellow-500 text-yellow-500">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {pokemonForm.moves_level_up.map((m, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <Input
                                                    type="number"
                                                    placeholder="Lv"
                                                    value={m.level}
                                                    onChange={(e) => updateLevelMove(i, 'level', e.target.value)}
                                                    className="w-16 bg-slate-700 border-slate-600 text-white"
                                                />
                                                <Popover open={levelMoveOpenIndex === i} onOpenChange={(open) => setLevelMoveOpenIndex(open ? i : null)}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="flex-1 justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                                        >
                                                            {m.move || "Select move..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search move..." />
                                                            <CommandList>
                                                                <CommandEmpty>No move found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {moves.map((move) => (
                                                                        <CommandItem
                                                                            key={move.id}
                                                                            value={move.name}
                                                                            onSelect={() => {
                                                                                updateLevelMove(i, 'move', move.name);
                                                                                setLevelMoveOpenIndex(null);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    m.move === move.name ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {move.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button size="icon" variant="ghost" onClick={() => removeLevelMove(i)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-slate-300 mb-2 block">TM Moves</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Popover open={tmMoveOpen} onOpenChange={setTmMoveOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="flex-1 justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                                >
                                                    {tmMoveSearch || "Select TM move..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search move..." />
                                                    <CommandList>
                                                        <CommandEmpty>No move found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {moves.filter(m => !pokemonForm.moves_tm.includes(m.name)).map((move) => (
                                                                <CommandItem
                                                                    key={move.id}
                                                                    value={move.name}
                                                                    onSelect={() => addTmMove(move.name)}
                                                                >
                                                                    {move.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {pokemonForm.moves_tm.map((move, i) => (
                                            <span key={i} className="bg-slate-700 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                                                {move}
                                                <button onClick={() => removeTmMove(i)} className="text-red-400 hover:text-red-300">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handlePokemonSubmit}
                                        disabled={createPokemon.isPending || updatePokemon.isPending}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {(createPokemon.isPending || updatePokemon.isPending) && (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        )}
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingPokemonId ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Stats Tab */}
                    <TabsContent value="stats">
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-600">
                                <CardHeader>
                                    <CardTitle className="text-yellow-400"
                                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                        {editingStatsId ? 'EDIT RUN STATS' : 'ADD RUN STATS'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300">Pokemon</Label>
                                            <Input
                                                value={selectedPokemon?.name || ''}
                                                disabled
                                                className="bg-slate-600 border-slate-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300">Version</Label>
                                            <Select
                                                value={statsForm.game_version}
                                                onValueChange={(val) => setStatsForm(prev => ({ ...prev, game_version: val }))}
                                            >
                                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="red">Red</SelectItem>
                                                    <SelectItem value="blue">Blue</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300">Completion Time</Label>
                                            <Input
                                                value={statsForm.completion_time}
                                                onChange={(e) => setStatsForm(prev => ({ ...prev, completion_time: e.target.value }))}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (!val) return;
                                                    // Normalize to H:MM (remove leading zero from hours)
                                                    const parts = val.split(':');
                                                    if (parts.length === 2) {
                                                        const [h, m] = parts;
                                                        // Ensure valid number before formatting
                                                        if (!isNaN(h) && !isNaN(m)) {
                                                            const normalized = `${parseInt(h, 10)}:${m}`;
                                                            setStatsForm(prev => ({ ...prev, completion_time: normalized }));
                                                        }
                                                    }
                                                }}
                                                placeholder="H:MM"
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300">Final Level</Label>
                                            <Input
                                                type="number"
                                                value={statsForm.completion_level}
                                                onChange={(e) => setStatsForm(prev => ({ ...prev, completion_level: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-700 rounded p-2 text-sm text-slate-300">
                                        Total Losses: <span className="text-white font-bold">
                                            {(() => {
                                                let total = 0;
                                                let hasEstimated = false;
                                                Object.values(statsForm.battle_losses).forEach(losses => {
                                                    if (!losses) return;
                                                    const lossStr = String(losses);
                                                    if (lossStr.includes('+')) {
                                                        hasEstimated = true;
                                                        total += Number(lossStr.replace('+', '')) || 0;
                                                    } else {
                                                        total += Number(losses) || 0;
                                                    }
                                                });
                                                return hasEstimated ? `${total}+` : total;
                                            })()}
                                        </span>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300 mb-2 block">Battle Timestamps, Losses & Order</Label>
                                        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                            {battleKeys.map(({ key, label, fixedOrder }) => {
                                                const isEliteFour = ['lorelei', 'bruno', 'agatha', 'lance', 'champion'].includes(key);
                                                return (
                                                    <div key={key} className={`grid ${isEliteFour ? 'grid-cols-3' : 'grid-cols-4'} gap-2 items-center`}>
                                                        <Label className="text-slate-400 text-xs">{label}</Label>
                                                        {!isEliteFour && (
                                                            <Input
                                                                value={statsForm.battle_timestamps[key] || ''}
                                                                onChange={(e) => setStatsForm(prev => ({
                                                                    ...prev,
                                                                    battle_timestamps: {
                                                                        ...prev.battle_timestamps,
                                                                        [key]: e.target.value
                                                                    }
                                                                }))}
                                                                placeholder="Time"
                                                                className="bg-slate-700 border-slate-600 text-white text-sm"
                                                            />
                                                        )}
                                                        <Input
                                                            value={statsForm.battle_losses[key] || ''}
                                                            onChange={(e) => setStatsForm(prev => ({
                                                                ...prev,
                                                                battle_losses: {
                                                                    ...prev.battle_losses,
                                                                    [key]: e.target.value
                                                                }
                                                            }))}
                                                            placeholder="Losses (e.g. 5 or 10+)"
                                                            className="bg-slate-700 border-slate-600 text-white text-sm"
                                                        />
                                                        {fixedOrder ? (
                                                            <Input
                                                                type="number"
                                                                value={fixedOrder}
                                                                disabled
                                                                className="bg-slate-600 border-slate-500 text-slate-300 text-sm"
                                                            />
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                min="2"
                                                                max="13"
                                                                value={statsForm.battle_order[key] || ''}
                                                                onChange={(e) => setStatsForm(prev => ({
                                                                    ...prev,
                                                                    battle_order: {
                                                                        ...prev.battle_order,
                                                                        [key]: Number(e.target.value) || 0
                                                                    }
                                                                }))}
                                                                placeholder="Order (2-13)"
                                                                className="bg-slate-700 border-slate-600 text-white text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300 mb-2 block">Moves Used</Label>
                                        <div className="flex gap-2 mb-2">
                                            <Popover open={runMoveOpen} onOpenChange={setRunMoveOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="flex-1 justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                                    >
                                                        {runMoveSearch || "Select move..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search move..." />
                                                        <CommandList>
                                                            <CommandEmpty>No move found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {moves.filter(m => !statsForm.moves_used.includes(m.name)).map((move) => (
                                                                    <CommandItem
                                                                        key={move.id}
                                                                        value={move.name}
                                                                        onSelect={() => addRunMove(move.name)}
                                                                    >
                                                                        {move.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {statsForm.moves_used.map((move, i) => (
                                                <span key={i} className="bg-purple-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                                                    {move}
                                                    <button onClick={() => removeRunMove(i)} className="text-purple-200 hover:text-white">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300">Notes</Label>
                                        <Textarea
                                            value={statsForm.notes}
                                            onChange={(e) => setStatsForm(prev => ({ ...prev, notes: e.target.value }))}
                                            className="bg-slate-700 border-slate-600 text-white"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleStatsSubmit}
                                            disabled={createStats.isPending || updateStats.isPending}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                        >
                                            {(createStats.isPending || updateStats.isPending) && (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            <Save className="w-4 h-4 mr-2" />
                                            {editingStatsId ? 'Update' : 'Create'}
                                        </Button>
                                        {editingStatsId && (
                                            <Button variant="outline" onClick={resetStatsForm}>
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {selectedStats.length > 0 && (
                                <Card className="bg-slate-800 border-slate-600">
                                    <CardHeader>
                                        <CardTitle className="text-yellow-400"
                                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                            EXISTING RUN STATS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {selectedStats.map(stat => (
                                                <div key={stat.id} className="flex items-center justify-between bg-slate-700 rounded p-3">
                                                    <div>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${stat.game_version === 'red' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                                                            {stat.game_version?.toUpperCase()}
                                                        </span>
                                                        <div className="text-slate-300 text-sm mt-1">
                                                            Time: {stat.completion_time || 'N/A'} | Lv.{stat.completion_level || '?'} | {stat.total_losses ?? '?'} losses
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => loadStatsForEdit(stat)}>
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => deleteStats.mutate(stat.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tiers Tab */}
                    <TabsContent value="tiers">
                        <TierManagementPanel />
                    </TabsContent>

                    {/* Bulk Update Tab */}
                    <TabsContent value="bulk">
                        <div className="space-y-6">
                            {/* Bulk Pokemon Moves Upload */}
                            <Card className="bg-slate-800 border-slate-600">
                                <CardHeader>
                                    <CardTitle className="text-yellow-400"
                                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                        BULK POKEMON MOVES UPLOAD
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-slate-700 border-2 border-slate-600 rounded-lg p-4">
                                        <h3 className="text-white font-bold mb-2 text-sm">Instructions:</h3>
                                        <ol className="text-slate-300 text-xs space-y-1 list-decimal list-inside">
                                            <li>Download the template to see the required format</li>
                                            <li>Add Pokemon by name (e.g., "bulbasaur", "charmander")</li>
                                            <li>Include level_up_moves array with level and move name</li>
                                            <li>Include tm_moves array with move names</li>
                                            <li>Upload the JSON file and process</li>
                                        </ol>
                                        <div className="mt-3 p-2 bg-blue-900/30 border border-blue-600 rounded">
                                            <p className="text-blue-300 text-xs">
                                                <strong>Note:</strong> Pokemon are matched by name (case insensitive). Both level_up_moves and tm_moves will be updated for each Pokemon.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={downloadMovesTemplate}
                                        variant="outline"
                                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Moves Template
                                    </Button>

                                    <div>
                                        <Label className="text-slate-300 mb-2 block">Upload JSON File</Label>
                                        <Input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => setBulkMovesFile(e.target.files[0])}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    {bulkMovesFile && (
                                        <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                                            Selected file: <span className="text-white font-bold">{bulkMovesFile.name}</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleBulkMovesUpload}
                                        disabled={!bulkMovesFile || isProcessingMoves}
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isProcessingMoves && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <Upload className="w-4 h-4 mr-2" />
                                        Process Moves Upload
                                    </Button>

                                    {bulkMovesProgress && (
                                        <div className="bg-slate-700 border-2 border-slate-600 rounded p-3">
                                            <p className="text-white text-sm font-bold">{bulkMovesProgress}</p>
                                        </div>
                                    )}

                                    {bulkMovesResults.length > 0 && (
                                        <div className="bg-slate-700 border-2 border-slate-600 rounded p-3 max-h-96 overflow-y-auto">
                                            <h3 className="text-white font-bold mb-2 text-sm">Results:</h3>
                                            <div className="space-y-1">
                                                {bulkMovesResults.map((result, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        {result.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                        {result.status === 'warning' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                                                        {result.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                                        <span className="text-slate-300">
                                                            {result.name}: <span className={
                                                                result.status === 'success' ? 'text-green-400' :
                                                                    result.status === 'warning' ? 'text-yellow-400' :
                                                                        'text-red-400'
                                                            }>{result.message}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Original Bulk Run Moves Update */}
                            <Card className="bg-slate-800 border-slate-600">
                                <CardHeader>
                                    <CardTitle className="text-yellow-400"
                                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                        BULK RUN MOVES UPDATE
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-slate-700 border-2 border-slate-600 rounded-lg p-4">
                                        <h3 className="text-white font-bold mb-2 text-sm">Instructions:</h3>
                                        <ol className="text-slate-300 text-xs space-y-1 list-decimal list-inside">
                                            <li>Download the Pokemon ID Reference to get pokemon_id values</li>
                                            <li>Download the JSON template</li>
                                            <li>Fill in pokemon_id (from reference) and moves_used (as array)</li>
                                            <li>Upload the completed JSON file</li>
                                            <li>Click "Process Bulk Update" to update the database</li>
                                        </ol>
                                        <div className="mt-3 p-2 bg-blue-900/30 border border-blue-600 rounded">
                                            <p className="text-blue-300 text-xs">
                                                <strong>Note:</strong> pokemon_id is the database ID (not Pokedex number). moves_used can be an array or comma-separated string.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            onClick={downloadPokemonReference}
                                            variant="outline"
                                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-slate-900"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Pokemon ID Reference
                                        </Button>
                                        <Button
                                            onClick={downloadJsonTemplate}
                                            variant="outline"
                                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            JSON Template
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300 mb-2 block">Upload JSON File</Label>
                                        <Input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => setBulkFile(e.target.files[0])}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    {bulkFile && (
                                        <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                                            Selected file: <span className="text-white font-bold">{bulkFile.name}</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={!bulkFile || isProcessing}
                                        className="w-full bg-red-600 hover:bg-red-700"
                                    >
                                        {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <Upload className="w-4 h-4 mr-2" />
                                        Process Bulk Update
                                    </Button>

                                    {bulkProgress && (
                                        <div className="bg-slate-700 border-2 border-slate-600 rounded p-3">
                                            <p className="text-white text-sm font-bold">{bulkProgress}</p>
                                        </div>
                                    )}

                                    {bulkResults.length > 0 && (
                                        <div className="bg-slate-700 border-2 border-slate-600 rounded p-3 max-h-96 overflow-y-auto">
                                            <h3 className="text-white font-bold mb-2 text-sm">Results:</h3>
                                            <div className="space-y-1">
                                                {bulkResults.map((result, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        {result.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                        {result.status === 'warning' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                                                        {result.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                                        <span className="text-slate-300">
                                                            {result.pokemon_id}: <span className={
                                                                result.status === 'success' ? 'text-green-400' :
                                                                    result.status === 'warning' ? 'text-yellow-400' :
                                                                        'text-red-400'
                                                            }>{result.message}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Rules Tab */}
                    <TabsContent value="rules">
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-600">
                                <CardHeader>
                                    <CardTitle className="text-yellow-400"
                                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                        {editingRuleId ? 'EDIT RULE SECTION' : 'ADD RULE SECTION'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300">Section Key</Label>
                                            <Input
                                                value={ruleForm.section_key}
                                                onChange={(e) => setRuleForm(prev => ({ ...prev, section_key: e.target.value }))}
                                                placeholder="e.g. solo_run, badge_boost"
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300">Title</Label>
                                            <Input
                                                value={ruleForm.title}
                                                onChange={(e) => setRuleForm(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g. THE RULES"
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300">Icon</Label>
                                            <Select
                                                value={ruleForm.icon}
                                                onValueChange={(val) => setRuleForm(prev => ({ ...prev, icon: val }))}
                                            >
                                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shield">Shield</SelectItem>
                                                    <SelectItem value="zap">Zap</SelectItem>
                                                    <SelectItem value="trending-up">Trending Up</SelectItem>
                                                    <SelectItem value="book-open">Book Open</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-slate-300">Display Order</Label>
                                            <Input
                                                type="number"
                                                value={ruleForm.order}
                                                onChange={(e) => setRuleForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-slate-300">Subsections</Label>
                                            <Button
                                                size="sm"
                                                onClick={() => setRuleForm(prev => ({
                                                    ...prev,
                                                    subsections: [...prev.subsections, { subtitle: '', content: '' }]
                                                }))}
                                                variant="outline"
                                                className="border-yellow-500 text-yellow-500"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {ruleForm.subsections.map((sub, i) => (
                                                <div key={i} className="bg-slate-700 rounded p-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-slate-400 text-xs">Subsection {i + 1}</Label>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => setRuleForm(prev => ({
                                                                ...prev,
                                                                subsections: prev.subsections.filter((_, idx) => idx !== i)
                                                            }))}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        value={sub.subtitle}
                                                        onChange={(e) => setRuleForm(prev => ({
                                                            ...prev,
                                                            subsections: prev.subsections.map((s, idx) =>
                                                                idx === i ? { ...s, subtitle: e.target.value } : s
                                                            )
                                                        }))}
                                                        placeholder="Subtitle (e.g., • Solo Run)"
                                                        className="bg-slate-600 border-slate-500 text-white"
                                                    />
                                                    <Textarea
                                                        value={sub.content}
                                                        onChange={(e) => setRuleForm(prev => ({
                                                            ...prev,
                                                            subsections: prev.subsections.map((s, idx) =>
                                                                idx === i ? { ...s, content: e.target.value } : s
                                                            )
                                                        }))}
                                                        placeholder="Content..."
                                                        className="bg-slate-600 border-slate-500 text-white"
                                                        rows={3}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                if (editingRuleId) {
                                                    updateRule.mutate({ id: editingRuleId, data: ruleForm });
                                                } else {
                                                    createRule.mutate(ruleForm);
                                                }
                                            }}
                                            disabled={createRule.isPending || updateRule.isPending}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                        >
                                            {(createRule.isPending || updateRule.isPending) && (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            <Save className="w-4 h-4 mr-2" />
                                            {editingRuleId ? 'Update' : 'Create'}
                                        </Button>
                                        {editingRuleId && (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setRuleForm({ section_key: '', title: '', icon: 'shield', order: 0, subsections: [] });
                                                    setEditingRuleId(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {rulesContent.length > 0 && (
                                <Card className="bg-slate-800 border-slate-600">
                                    <CardHeader>
                                        <CardTitle className="text-yellow-400"
                                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                                            EXISTING RULES
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {rulesContent.map(rule => (
                                                <div key={rule.id} className="flex items-center justify-between bg-slate-700 rounded p-3">
                                                    <div>
                                                        <div className="text-white font-bold">{rule.title}</div>
                                                        <div className="text-slate-400 text-xs">
                                                            {rule.section_key} • Order: {rule.order} • {rule.subsections?.length || 0} subsections
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setRuleForm(rule);
                                                                setEditingRuleId(rule.id);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => deleteRule.mutate(rule.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// X icon component for inline use
function X({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}