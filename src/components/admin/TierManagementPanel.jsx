import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, Plus, GripVertical, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'DNF'];
const TIER_TYPES = [
    { value: 'overall', label: 'Overall' },
    { value: 'pre_evolved', label: 'Pre-Evolved' },
    { value: 'middle_evolution', label: 'Middle Evolution' },
    { value: 'fully_evolved', label: 'Fully Evolved' }
];

const TIER_COLORS = {
    S: 'bg-red-600 border-red-500',
    A: 'bg-orange-600 border-orange-500',
    B: 'bg-yellow-600 border-yellow-500',
    C: 'bg-green-600 border-green-500',
    D: 'bg-blue-600 border-blue-500',
    E: 'bg-indigo-600 border-indigo-500',
    F: 'bg-purple-600 border-purple-500',
    DNF: 'bg-gray-600 border-gray-500'
};

export default function TierManagementPanel() {
    const queryClient = useQueryClient();
    const [selectedTierType, setSelectedTierType] = useState('overall');
    const [addingToTier, setAddingToTier] = useState(null);
    const [searchOpen, setSearchOpen] = useState({});

    const { data: pokemon = [] } = useQuery({
        queryKey: ['pokemon'],
        queryFn: () => base44.entities.Pokemon.list('pokedex_number', 200)
    });

    const { data: placements = [] } = useQuery({
        queryKey: ['placements'],
        queryFn: () => base44.entities.TierPlacement.list()
    });

    const deletePlacement = useMutation({
        mutationFn: (/** @type {string} */ id) => base44.entities.TierPlacement.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements'] })
    });

    const createPlacement = useMutation({
        mutationFn: (/** @type {object} */ data) => base44.entities.TierPlacement.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements'] })
    });

    const updatePlacement = useMutation({
        mutationFn: (/** @type {{ id: string, data: object }} */ { id, data }) => base44.entities.TierPlacement.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements'] })
    });

    // Get placements for current tier type, organized by tier
    const tierData = useMemo(() => {
        // Handle legacy 'evolved' tier_type as 'fully_evolved'
        const filtered = placements.filter(p => {
            if (selectedTierType === 'fully_evolved') {
                return p.tier_type === 'fully_evolved' || p.tier_type === 'evolved';
            }
            return p.tier_type === selectedTierType;
        });
        const organized = {};

        TIERS.forEach(tier => {
            organized[tier] = filtered
                .filter(p => p.tier === tier)
                .sort((a, b) => (a.rank_within_tier || 0) - (b.rank_within_tier || 0))
                .map(p => ({
                    ...p,
                    pokemon: pokemon.find(poke => poke.id === p.pokemon_id)
                }));
        });

        return organized;
    }, [placements, pokemon, selectedTierType]);

    // Get unplaced Pokémon for current tier type
    const unplacedPokemon = useMemo(() => {
        const placedIds = placements
            .filter(p => {
                if (selectedTierType === 'fully_evolved') {
                    return p.tier_type === 'fully_evolved' || p.tier_type === 'evolved';
                }
                return p.tier_type === selectedTierType;
            })
            .map(p => p.pokemon_id);

        return pokemon.filter(p => !placedIds.includes(p.id));
    }, [pokemon, placements, selectedTierType]);

    // Get available Pokémon for adding to a specific tier (unplaced + Pokémon from other tiers in this tier_type)
    const getAvailablePokemon = (tier) => {
        const currentTierIds = tierData[tier]?.map(p => p.pokemon_id) || [];
        return pokemon.filter(p => !currentTierIds.includes(p.id));
    };

    const handleAddPokemon = async (tier, pokemonId) => {
        setAddingToTier(tier);

        try {
            // Check if Pokémon already has a placement in this tier_type (including legacy 'evolved')
            const existingPlacement = placements.find(p => {
                if (selectedTierType === 'fully_evolved') {
                    return p.pokemon_id === pokemonId && (p.tier_type === 'fully_evolved' || p.tier_type === 'evolved');
                }
                return p.pokemon_id === pokemonId && p.tier_type === selectedTierType;
            });

            // If exists, delete it first
            if (existingPlacement) {
                await deletePlacement.mutateAsync(existingPlacement.id);
            }

            // Calculate next rank
            const maxRank = Math.max(0, ...(tierData[tier]?.map(p => p.rank_within_tier || 0) || [0]));

            // Create new placement
            await createPlacement.mutateAsync({
                pokemon_id: pokemonId,
                tier_type: selectedTierType,
                tier: tier,
                rank_within_tier: maxRank + 1
            });

            setSearchOpen({ ...searchOpen, [tier]: false });
        } catch (error) {
            console.error('Error adding Pokémon:', error);
        } finally {
            setAddingToTier(null);
        }
    };

    const handleRemovePokemon = async (placementId, tier) => {
        await deletePlacement.mutateAsync(placementId);

        // Re-index remaining Pokémon in this tier
        const remaining = tierData[tier].filter(p => p.id !== placementId);
        for (let i = 0; i < remaining.length; i++) {
            await updatePlacement.mutateAsync({
                id: remaining[i].id,
                data: { rank_within_tier: i + 1 }
            });
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        // Same tier, reorder
        if (source.droppableId === destination.droppableId) {
            const tier = source.droppableId;
            const items = Array.from(tierData[tier]);
            const [reordered] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reordered);

            // Update all ranks
            for (let i = 0; i < items.length; i++) {
                await updatePlacement.mutateAsync({
                    id: items[i].id,
                    data: { rank_within_tier: i + 1 }
                });
            }
        } else {
            // Move to different tier
            const sourceTier = source.droppableId;
            const destTier = destination.droppableId;
            const placement = tierData[sourceTier][source.index];

            // Update tier and rank
            await updatePlacement.mutateAsync({
                id: placement.id,
                data: {
                    tier: destTier,
                    rank_within_tier: destination.index + 1
                }
            });

            // Re-index source tier
            const sourceItems = tierData[sourceTier].filter(p => p.id !== placement.id);
            for (let i = 0; i < sourceItems.length; i++) {
                await updatePlacement.mutateAsync({
                    id: sourceItems[i].id,
                    data: { rank_within_tier: i + 1 }
                });
            }

            // Re-index destination tier
            const destItems = Array.from(tierData[destTier] || []);
            destItems.splice(destination.index, 0, placement);
            for (let i = 0; i < destItems.length; i++) {
                await updatePlacement.mutateAsync({
                    id: destItems[i].id,
                    data: { rank_within_tier: i + 1 }
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                    <CardTitle className="text-yellow-400"
                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}>
                        TIER PLACEMENT MANAGEMENT
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedTierType} onValueChange={setSelectedTierType}>
                        <TabsList className="bg-slate-700 border-2 border-slate-600 mb-6 w-full grid grid-cols-4">
                            {TIER_TYPES.map(type => (
                                <TabsTrigger
                                    key={type.value}
                                    value={type.value}
                                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs"
                                >
                                    {type.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {TIER_TYPES.map(type => (
                            <TabsContent key={type.value} value={type.value} className="space-y-4">
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    {TIERS.map(tier => {
                                        const tierPlacements = tierData[tier] || [];
                                        const availablePokemon = getAvailablePokemon(tier);

                                        return (
                                            <Card key={tier} className={`${TIER_COLORS[tier]} border-2`}>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-white text-sm flex items-center justify-between">
                                                        <span>{tier} TIER ({tierPlacements.length})</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <Droppable droppableId={tier}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={cn(
                                                                    "min-h-[60px] space-y-2 rounded p-2",
                                                                    snapshot.isDraggingOver && "bg-slate-700/50"
                                                                )}
                                                            >
                                                                {tierPlacements.map((placement, index) => {
                                                                    const poke = placement.pokemon;
                                                                    if (!poke) return null;

                                                                    return (
                                                                        <Draggable
                                                                            key={placement.id}
                                                                            draggableId={placement.id}
                                                                            index={index}
                                                                        >
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    className={cn(
                                                                                        "bg-slate-800 border-2 border-slate-700 rounded-lg p-2 flex items-center gap-3",
                                                                                        snapshot.isDragging && "shadow-lg opacity-90"
                                                                                    )}
                                                                                >
                                                                                    <div
                                                                                        {...provided.dragHandleProps}
                                                                                        className="cursor-grab active:cursor-grabbing"
                                                                                    >
                                                                                        <GripVertical className="w-4 h-4 text-slate-400" />
                                                                                    </div>
                                                                                    <img
                                                                                        src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                                                        alt={poke.name}
                                                                                        className="w-12 h-12 object-contain"
                                                                                        style={{ imageRendering: 'pixelated' }}
                                                                                    />
                                                                                    <div className="flex-1">
                                                                                        <div className="text-white font-bold text-sm">
                                                                                            #{poke.pokedex_number} {poke.name}
                                                                                        </div>
                                                                                        <div className="text-slate-400 text-xs">
                                                                                            Rank: {placement.rank_within_tier}
                                                                                        </div>
                                                                                    </div>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="ghost"
                                                                                        onClick={() => handleRemovePokemon(placement.id, tier)}
                                                                                        className="h-8 w-8"
                                                                                    >
                                                                                        <X className="w-4 h-4 text-red-400" />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    );
                                                                })}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>

                                                    <Popover
                                                        open={searchOpen[tier]}
                                                        onOpenChange={(open) => setSearchOpen({ ...searchOpen, [tier]: open })}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                                                                disabled={addingToTier === tier}
                                                            >
                                                                {addingToTier === tier ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Adding...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus className="w-4 h-4 mr-2" />
                                                                        Add Pokémon
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search Pokémon..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No Pokémon found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {availablePokemon.map(poke => (
                                                                            <CommandItem
                                                                                key={poke.id}
                                                                                value={`${poke.pokedex_number} ${poke.name}`}
                                                                                onSelect={() => handleAddPokemon(tier, poke.id)}
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                <img
                                                                                    src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                                                    alt={poke.name}
                                                                                    className="w-8 h-8 object-contain"
                                                                                    style={{ imageRendering: 'pixelated' }}
                                                                                />
                                                                                <span>#{poke.pokedex_number} {poke.name}</span>
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </DragDropContext>

                                {/* Unplaced Pokémon */}
                                {unplacedPokemon.length > 0 && (
                                    <Card className="bg-slate-800 border-slate-600">
                                        <CardHeader>
                                            <CardTitle className="text-slate-400 text-sm">
                                                UNPLACED POKÉMON ({unplacedPokemon.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                                {unplacedPokemon.map(poke => (
                                                    <div
                                                        key={poke.id}
                                                        className="flex flex-col items-center p-2 bg-slate-700 rounded border border-slate-600"
                                                    >
                                                        <img
                                                            src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokedex_number}.png`}
                                                            alt={poke.name}
                                                            className="w-12 h-12 object-contain"
                                                            style={{ imageRendering: 'pixelated' }}
                                                        />
                                                        <div className="text-xs text-white text-center mt-1 truncate w-full">
                                                            #{poke.pokedex_number}
                                                        </div>
                                                        <div className="text-xs text-slate-400 text-center truncate w-full">
                                                            {poke.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}