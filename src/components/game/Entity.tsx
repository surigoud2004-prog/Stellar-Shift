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
  
  const placeholder = PLANET_IMAGES[entity.type % PLANET_IMAGES.length];

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-300",
        isSelected && "z-10 scale-110 brightness-125",
        entity.isMatched && "shard-match",
        !entity.isMatched && "shard-enter"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${HEX_WIDTH - 4}px`,
        height: `${HEX_WIDTH - 4}px`,
      }}
    >
      <div className={cn(
        "w-full h-full rounded-2xl overflow-hidden border-2 transition-colors",
        isSelected ? "border-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "border-white/10"
      )}>
        <Image
          src={placeholder.imageUrl}
          alt={placeholder.description}
          width={64}
          height={64}
          data-ai-hint={placeholder.imageHint}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
});