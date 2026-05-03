"use client";

import React, { memo } from 'react';
import Image from 'next/image';
import { CelestialEntity, HEX_WIDTH } from '@/lib/game-utils';
import { PLANET_IMAGES } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const Entity = memo(function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  // Safety check for planet images
  const placeholder = PLANET_IMAGES.length > 0 
    ? PLANET_IMAGES[entity.type % PLANET_IMAGES.length]
    : { imageUrl: 'https://picsum.photos/seed/default/200/200', description: 'Stellar Shard', imageHint: 'planet' };

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-300",
        isSelected && "z-10 scale-110 brightness-125",
        entity.isMatched && "shard-match",
        !entity.isMatched && "shard-enter",
        entity.isExploding && "animate-implode"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${HEX_WIDTH - 4}px`, // Adjusted spacing for high density
        height: `${HEX_WIDTH - 4}px`,
      }}
    >
      <div className={cn(
        "w-full h-full rounded-xl overflow-hidden border-2 transition-colors relative",
        isSelected ? "border-primary shadow-[0_0_15px_rgba(168,85,247,0.6)]" : "border-white/10"
      )}>
        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
             {/* Supernova Core Visual */}
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-white to-amber-200 animate-pulse opacity-80" />
             <div className="relative w-8 h-8 rounded-full bg-white shadow-[0_0_20px_#fff] animate-core-pulse">
                <div className="absolute inset-[-10px] border-2 border-primary rounded-full animate-spin duration-[2000ms]" />
                <div className="absolute inset-[-5px] border border-white/50 rounded-lg animate-spin-reverse duration-[3000ms]" />
             </div>
          </div>
        ) : (
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            width={HEX_WIDTH}
            height={HEX_WIDTH}
            data-ai-hint={placeholder.imageHint}
            className="object-cover w-full h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
});
