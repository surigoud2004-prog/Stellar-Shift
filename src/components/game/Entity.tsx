
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
        "absolute cursor-pointer transition-all duration-300 ease-out hover:scale-105 active:scale-95",
        isSelected && "z-20 scale-110 brightness-125",
        disabled && "cursor-not-allowed opacity-80"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${HEX_WIDTH - 4}px`,
        height: `${HEX_WIDTH - 4}px`,
      }}
    >
      <div className="relative w-full h-full group perspective-500">
        {/* Selection Frame */}
        {isSelected && (
          <div className="absolute inset-[-4px] border-2 border-primary rounded-xl animate-pulse z-10 shadow-[0_0_20px_rgba(187,112,255,0.6)]" />
        )}

        {/* 3D Space Shard (Cube Style) */}
        <div className={cn(
          "relative w-full h-full bg-white/5 rounded-xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-sm transition-transform duration-200",
          entity.special && "border-white/60 bg-white/20"
        )}>
          {placeholder?.imageUrl && (
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description || "Space Shard"}
              width={64}
              height={64}
              className={cn(
                "object-cover w-full h-full opacity-90 group-hover:opacity-100",
                entity.special && "brightness-125 scale-110"
              )}
            />
          )}

          {/* Special Icon Overlays */}
          {entity.special && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              {entity.special === 'nova-h' && <Zap className="w-8 h-8 drop-shadow-lg" />}
              {entity.special === 'black-hole' && <Target className="w-8 h-8 animate-spin drop-shadow-lg" />}
              {entity.special === 'bomb' && <Sun className="w-8 h-8 drop-shadow-lg" />}
              {entity.special === 'comet' && <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />}
            </div>
          )}

          {/* Geometric Facets for 3D Feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/30" />
        </div>
      </div>
    </div>
  );
}
