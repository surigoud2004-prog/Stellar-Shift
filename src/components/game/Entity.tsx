"use client";

import Image from 'next/image';
import { CelestialEntity, HEX_WIDTH } from '@/lib/game-utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Zap, Target, Sun, Sparkles } from 'lucide-react';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const placeholder = (entity.type >= 0 && entity.type < PlaceHolderImages.length) 
    ? PlaceHolderImages[entity.type] 
    : PlaceHolderImages[0];

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all gravity-distort",
        isSelected && "z-30 scale-punch brightness-150 drop-shadow-[0_0_20px_rgba(187,112,255,0.8)]",
        disabled && "cursor-not-allowed",
        entity.isMatched && "white-hole-spark",
        "group"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${HEX_WIDTH - 6}px`,
        height: `${HEX_WIDTH - 6}px`,
      }}
    >
      <div className="relative w-full h-full group">
        {/* Selection Aura */}
        {isSelected && (
          <div className="absolute inset-[-6px] border border-primary/50 rounded-2xl animate-pulse z-10" />
        )}

        {/* 3D Space Shard (Cubic Style) */}
        <div className={cn(
          "relative w-full h-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300",
          "group-hover:border-primary/40 group-hover:bg-white/10",
          entity.special && "border-white/40 bg-white/20 ring-2 ring-white/10"
        )}>
          {/* Gravitational Distortion Effect on Hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />

          {placeholder?.imageUrl && (
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description || "Space Shard"}
              width={64}
              height={64}
              data-ai-hint={placeholder.imageHint}
              className={cn(
                "object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-500",
                entity.special && "brightness-125 scale-110 saturate-150"
              )}
            />
          )}

          {/* Special Icon Overlays */}
          {entity.special && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white animate-in fade-in zoom-in duration-500">
              {entity.special === 'nova-h' && <Zap className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
              {entity.special === 'black-hole' && <Target className="w-10 h-10 animate-spin-slow drop-shadow-[0_0_10px_rgba(0,0,0,1)]" />}
              {entity.special === 'bomb' && <Sun className="w-10 h-10 animate-pulse drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]" />}
              {entity.special === 'comet' && <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]" />}
            </div>
          )}

          {/* Geometric Shine & Facets */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/20" />
          
          {/* Interaction Shine */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
