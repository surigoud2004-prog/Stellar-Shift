
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

const GLOW_MAP = [
  "shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-500/30", // Type 0: Orange Orb
  "shadow-[0_0_20px_rgba(59,130,246,0.6)] border-blue-500/30",   // Type 1: Sapphire Crystal
  "shadow-[0_0_20px_rgba(168,85,247,0.6)] border-purple-500/30", // Type 2: Violet Nebula
  "shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-500/30",   // Type 3: Green Radioactive
  "shadow-[0_0_20px_rgba(234,179,8,0.6)] border-yellow-500/30"   // Type 4: Golden Ring
];

export const Entity = memo(function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const placeholder = PLANET_IMAGES[entity.type % PLANET_IMAGES.length] || PLANET_IMAGES[0];
  const glowClass = GLOW_MAP[entity.type % GLOW_MAP.length];

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-300 p-1",
        isSelected && "z-10 scale-125 brightness-125",
        entity.isMatched && "shard-match",
        !entity.isMatched && "shard-enter",
        entity.isExploding && "animate-implode"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${HEX_WIDTH}px`,
        height: `${HEX_WIDTH}px`,
      }}
    >
      <div className={cn(
        "w-full h-full rounded-full overflow-hidden border-2 transition-all relative flex items-center justify-center",
        isSelected ? "border-white shadow-[0_0_25px_#fff]" : glowClass,
        "bg-black/60 backdrop-blur-sm"
      )}>
        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full">
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-white to-red-400 animate-pulse opacity-90" />
             <div className="relative w-10 h-10 rounded-full bg-white shadow-[0_0_30px_#fff] animate-core-pulse">
                <div className="absolute inset-[-12px] border-2 border-primary rounded-full animate-spin duration-[1500ms]" />
                <div className="absolute inset-[-6px] border border-white/60 rounded-full animate-spin-reverse duration-[2000ms]" />
             </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-90"
            />
            {/* 3D Glossy Sphere Layers */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none rounded-full" />
            <div className="absolute inset-0 lens-flare pointer-events-none rounded-full opacity-60" />
            <div className="absolute inset-0 border-[3px] border-white/10 rounded-full pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
});
