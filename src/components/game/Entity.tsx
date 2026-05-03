
"use client";

import React, { memo, useState } from 'react';
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

const BLOOM_MAP = [
  "bloom-violet border-purple-400/50",
  "bloom-orange border-orange-400/50",
  "bloom-gold border-yellow-400/50",
  "bloom-blue border-blue-400/50",
  "bloom-green border-green-400/50",
  "bloom-violet border-white/50"
];

const ROTATION_MAP = [
  "animate-orbital-float",
  "animate-orbital-float-reverse",
  "animate-orbital-float",
  "animate-orbital-float-reverse",
  "animate-orbital-float",
  "animate-orbital-float-reverse"
];

export const Entity = memo(function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const [sparkleKey, setSparkleKey] = useState(0);
  
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const placeholder = PLANET_IMAGES[entity.type % PLANET_IMAGES.length] || PLANET_IMAGES[0];
  const bloomClass = BLOOM_MAP[entity.type % BLOOM_MAP.length];
  const rotationClass = ROTATION_MAP[entity.type % ROTATION_MAP.length];

  const handleInteraction = () => {
    if (disabled) return;
    setSparkleKey(prev => prev + 1);
    onSelect(entity.id);
  };

  return (
    <div
      onClick={handleInteraction}
      className={cn(
        "absolute cursor-pointer transition-all duration-300 p-1.5",
        isSelected && "z-10 scale-110 brightness-125",
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
        "w-full h-full transition-all relative flex items-center justify-center animate-core-breath overflow-hidden",
        isSelected ? "border-2 border-white shadow-[0_0_30px_#fff] rounded-2xl" : cn("border border-white/10 rounded-2xl", bloomClass),
        "bg-black/60 backdrop-blur-sm shadow-xl"
      )}>
        {/* Star-Dust Burst Layer */}
        <div key={sparkleKey} className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full animate-orbital-float">
             {/* Event Horizon Ring */}
             <div className="absolute inset-1.5 border-[3px] border-white/80 rounded-full animate-event-horizon shadow-[0_0_15px_#fff,0_0_30px_#eab308]" />
             
             {/* Singularity Core */}
             <div className="relative w-8 h-8 rounded-full bg-black shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
             </div>
             
             {/* Distortion Lens */}
             <div className="absolute inset-0 glossy-overlay opacity-40" />
          </div>
        ) : (
          <div className={cn("relative w-full h-full flex items-center justify-center", rotationClass)}>
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-100 scale-100"
            />
            {/* Glossy Photographic Bloom Overlays */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-30" />
            <div className="absolute inset-0 lens-flare pointer-events-none opacity-40" />
            
            {/* Dark Edges Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
});
