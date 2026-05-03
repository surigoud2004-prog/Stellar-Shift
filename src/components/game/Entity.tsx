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
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-white to-red-400 animate-pulse opacity-90" />
             <div className="relative w-10 h-10 rounded-full bg-white shadow-[0_0_30px_#fff]">
                <div className="absolute inset-[-15px] border-2 border-primary rounded-full animate-spin duration-[1500ms]" />
                <div className="absolute inset-[-8px] border border-white/60 rounded-full animate-orbital-float-reverse duration-[2000ms]" />
             </div>
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