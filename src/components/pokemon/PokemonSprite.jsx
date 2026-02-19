import React from 'react';
import { cn } from "@/lib/utils";

export default function PokemonSprite({ pokemon, isSelected, onClick, hasStats }) {
    const spriteUrl = pokemon.sprite_url || 
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
    
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative w-16 h-16 md:w-20 md:h-20 rounded-lg transition-all duration-200",
                "border-4 hover:scale-110 hover:z-10",
                "bg-gradient-to-br from-slate-100 to-slate-200",
                isSelected 
                    ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110 z-10" 
                    : "border-slate-400 hover:border-yellow-300",
                hasStats && "ring-2 ring-green-400 ring-offset-1"
            )}
            style={{
                imageRendering: 'pixelated'
            }}
        >
            <img
                src={spriteUrl}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1 rounded"
                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                #{pokemon.pokedex_number}
            </span>
        </button>
    );
}