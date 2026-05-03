
"use client";

import React, { memo, useState, useEffect } from 'react';
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
  "bloom-violet border-purple-500/30", 
  "bloom-blue border-blue-500/30",     
  "bloom-orange border-orange-500/30", 
  "bloom-green border-green-500/30",   
  "bloom-red border-red-500/30",       
  "bloom-gold border-yellow-500/30"    
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
        entity.isMatched && "animate-implode",
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
        "bg-black border border-white/5 rounded-2xl shadow-2xl",
        isSelected ? "border-white ring-2 ring-white/50" : bloomClass
      )}>
        {/* Star-Dust Burst Layer */}
        <div key={sparkleKey} className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full animate-orbital-float">
             {/* Event Horizon Ring */}
             <div className="absolute inset-1 border-[4px] border-white/90 rounded-full animate-event-horizon shadow-[0_0_20px_#fff,0_0_40px_rgba(234,179,8,0.5)]" />
             
             {/* Singularity Core */}
             <div className="relative w-8 h-8 rounded-full bg-black shadow-[inset_0_0_25px_rgba(255,255,255,0.6)] border border-white/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-pulse" />
             </div>
             
             {/* Distortion Lens */}
             <div className="absolute inset-0 glossy-overlay opacity-60" />
          </div>
        ) : (
          <div className={cn("relative w-full h-full flex items-center justify-center", rotationClass)}>
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-100 scale-100 mix-blend-screen"
            />
            {/* Glossy 3D Glass Finish Overlays */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-50" />
            <div className="absolute inset-0 lens-flare pointer-events-none opacity-60" />
            
            {/* Edge Highlights */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
            
            {/* Dark Vignette to make center pop */}
            <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
});
