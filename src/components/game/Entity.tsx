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
  "bloom-violet border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.4)]", 
  "bloom-blue border-blue-400/30 shadow-[0_0_25px_rgba(59,130,246,0.4)]",     
  "bloom-orange border-orange-400/30 shadow-[0_0_25px_rgba(249,115,22,0.4)]", 
  "bloom-green border-green-400/30 shadow-[0_0_25px_rgba(34,197,94,0.4)]",   
  "bloom-red border-red-400/30 shadow-[0_0_25px_rgba(239,44,44,0.4)]",       
  "bloom-gold border-yellow-400/30 shadow-[0_0_25px_rgba(234,179,8,0.4)]"    
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
        isSelected && "z-10 scale-110 brightness-150",
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
        "bg-black border border-white/20 rounded-full shadow-2xl",
        isSelected ? "border-white ring-4 ring-white/50" : bloomClass
      )}>
        {/* Star-Dust Burst Layer (Interaction Feedback) */}
        <div key={sparkleKey} className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full">
             {/* Event Horizon Ring (Singularity) */}
             <div className="absolute inset-1 border-[4px] border-white/90 rounded-full animate-event-horizon shadow-[0_0_25px_#fff,0_0_50px_rgba(234,179,8,0.7)]" />
             
             {/* Singularity Core */}
             <div className="relative w-10 h-10 rounded-full bg-black shadow-[inset_0_0_35px_rgba(255,255,255,0.8)] border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent animate-pulse" />
             </div>
             
             {/* Distortion Lens */}
             <div className="absolute inset-0 glossy-overlay opacity-90" />
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
            
            {/* NEURAL CORE: Bright White Center Glow */}
            <div className="absolute inset-[15%] white-core-glow pointer-events-none mix-blend-plus-lighter opacity-90" />
            
            {/* 3D Glass Shell: Specular Highlight (Top-Left) */}
            <div className="absolute inset-0 specular-highlight pointer-events-none opacity-100" />
            
            {/* 3D Glass Shell: Refractive Glossy Overlay */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-70" />
            
            {/* Inner Rim Highlight (3D Depth) */}
            <div className="absolute inset-0.5 border border-white/40 rounded-full pointer-events-none" />
            
            {/* High-Contrast Vignette for Pop */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,1)] pointer-events-none rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
});