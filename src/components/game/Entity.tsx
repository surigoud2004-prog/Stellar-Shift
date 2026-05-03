
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
  "bloom-violet border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]", 
  "bloom-blue border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]",     
  "bloom-orange border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]", 
  "bloom-green border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]",   
  "bloom-red border-red-500/40 shadow-[0_0_20px_rgba(239,44,44,0.3)]",       
  "bloom-gold border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]"    
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
        "absolute cursor-pointer transition-all duration-300 p-1",
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
        "bg-black/90 border border-white/10 rounded-full shadow-2xl",
        isSelected ? "border-white ring-4 ring-white/30" : bloomClass
      )}>
        {/* Star-Dust Burst Layer (Interaction Feedback) */}
        <div key={sparkleKey} className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full animate-orbital-float">
             {/* Event Horizon Ring (Singularity) */}
             <div className="absolute inset-1 border-[4px] border-white/90 rounded-full animate-event-horizon shadow-[0_0_25px_#fff,0_0_50px_rgba(234,179,8,0.6)]" />
             
             {/* Singularity Core */}
             <div className="relative w-10 h-10 rounded-full bg-black shadow-[inset_0_0_30px_rgba(255,255,255,0.7)] border border-white/40">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-pulse" />
             </div>
             
             {/* Distortion Lens */}
             <div className="absolute inset-0 glossy-overlay opacity-80" />
          </div>
        ) : (
          <div className={cn("relative w-full h-full flex items-center justify-center transition-transform rounded-full overflow-hidden", rotationClass)}>
            {/* Vivid Space Photography Layer */}
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-100 scale-100 mix-blend-screen"
            />
            
            {/* Inner Glow (Bloom bleeding onto black background) */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 mix-blend-overlay pointer-events-none" />
            
            {/* 3D Glossy Glass Finish Overlays */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-60 rounded-full" />
            <div className="absolute inset-0 lens-flare pointer-events-none opacity-70 rounded-full" />
            
            {/* Edge Highlights (Inner border for 3D depth) */}
            <div className="absolute inset-0.5 border border-white/20 rounded-full pointer-events-none" />
            
            {/* High-Contrast Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_35px_rgba(0,0,0,1)] pointer-events-none rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
});
