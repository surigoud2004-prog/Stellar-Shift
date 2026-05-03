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
  "bloom-orange border-orange-400/50",
  "bloom-blue border-blue-400/50",
  "bloom-violet border-purple-400/50",
  "bloom-green border-green-400/50",
  "bloom-gold border-yellow-400/50"
];

const ROTATION_MAP = [
  "animate-orbital-float",
  "animate-orbital-float-reverse",
  "animate-orbital-float",
  "animate-orbital-float-reverse",
  "animate-orbital-float"
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
        "absolute cursor-pointer transition-all duration-300 p-2",
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
        "w-full h-full rounded-full overflow-hidden border-2 transition-all relative flex items-center justify-center animate-core-breath",
        isSelected ? "border-white shadow-[0_0_30px_#fff]" : bloomClass,
        "bg-black/40 backdrop-blur-sm"
      )}>
        {/* Star-Dust Burst Layer */}
        <div key={sparkleKey} className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full">
             {/* Event Horizon Ring */}
             <div className="absolute inset-2 border-[4px] border-white rounded-full animate-event-horizon shadow-[0_0_20px_#fff,0_0_40px_#eab308]" />
             
             {/* Singularity Core */}
             <div className="relative w-10 h-10 rounded-full bg-black shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
             </div>
             
             {/* Distortion Lens */}
             <div className="absolute inset-0 glossy-overlay opacity-40" />
          </div>
        ) : (
          <div className={cn("relative w-full h-full", rotationClass)}>
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-100 scale-110"
            />
            {/* 3D Glossy Sphere Layers */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none rounded-full" />
            <div className="absolute inset-0 lens-flare pointer-events-none rounded-full opacity-80" />
            <div className="absolute inset-0 border-[4px] border-white/20 rounded-full pointer-events-none shadow-inner" />
          </div>
        )}
      </div>
    </div>
  );
});