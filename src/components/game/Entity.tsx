"use client";

import React, { memo } from 'react';
import Image from 'next/image';
import { CelestialEntity, HEX_WIDTH } from '@/lib/game-utils';
import { PLANET_IMAGES } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Zap, Target, Sparkles } from 'lucide-react';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/**
 * Entity component uses React.memo for simulated Object Pooling performance.
 * This prevents unnecessary re-renders during cascades and movement.
 */
export const Entity = memo(function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const placeholder = (entity.type >= 0 && entity.type < PLANET_IMAGES.length) 
    ? PLANET_IMAGES[entity.type] 
    : PLANET_IMAGES[0];

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-300 gpu-accelerated",
        isSelected && "z-30 scale-punch brightness-150 drop-shadow-[0_0_20px_rgba(187,112,255,0.8)]",
        disabled && "cursor-not-allowed",
        entity.isMatched && "ember-dissolve",
        entity.isExploding && "animate-implode",
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

          {/* Standard Planet Visuals */}
          {placeholder?.imageUrl && (
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description || "Celestial Shard"}
              width={64}
              height={64}
              priority={entity.r < 3}
              data-ai-hint={placeholder.imageHint}
              className={cn(
                "object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-500",
                entity.special && "brightness-75 saturate-50 blur-[1px]"
              )}
            />
          )}

          {/* Special Icon Overlays & Advanced Visuals */}
          {entity.special && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              {entity.special === 'nova-h' && (
                <Zap className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
              )}
              {entity.special === 'black-hole' && (
                <Target className="w-10 h-10 text-primary animate-spin-slow drop-shadow-[0_0_10px_rgba(0,0,0,1)]" />
              )}
              {entity.special === 'bomb' && (
                <div className="supernova-core">
                  <div className="plasma-sphere" />
                  <div className="obsidian-cage" />
                  <div className="obsidian-cage-inner" />
                </div>
              )}
              {entity.special === 'comet' && (
                <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]" />
              )}
            </div>
          )}

          {/* Geometric Shine & Facets */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/20" />
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  // Hardened prop comparison for peak re-render optimization
  return (
    prev.entity.id === next.entity.id &&
    prev.entity.q === next.entity.q &&
    prev.entity.r === next.entity.r &&
    prev.entity.type === next.entity.type &&
    prev.entity.special === next.entity.special &&
    prev.entity.isMatched === next.entity.isMatched &&
    prev.entity.isExploding === next.entity.isExploding &&
    prev.isSelected === next.isSelected &&
    prev.disabled === next.disabled
  );
});