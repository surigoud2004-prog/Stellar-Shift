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
  "bloom-cyan border-cyan-400/30", 
  "bloom-pink border-pink-400/30",     
  "bloom-green border-green-400/30", 
  "bloom-amber border-amber-400/30",   
  "bloom-violet border-violet-400/30",       
  "bloom-red border-red-400/30"    
];

const SPARKLE_COLOR_MAP = [
  "rgba(6, 182, 212, 0.8)", // Cyan
  "rgba(236, 72, 153, 0.8)", // Pink
  "rgba(34, 197, 94, 0.8)", // Green
  "rgba(245, 158, 11, 0.8)", // Amber
  "rgba(139, 92, 246, 0.8)", // Violet
  "rgba(239, 68, 68, 0.8)"  // Red
];

export const Entity = memo(function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const [sparkleKey, setSparkleKey] = useState(0);
  
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const placeholder = PLANET_IMAGES[entity.type % PLANET_IMAGES.length] || PLANET_IMAGES[0];
  const bloomClass = BLOOM_MAP[entity.type % BLOOM_MAP.length];
  const sparkleColor = SPARKLE_COLOR_MAP[entity.type % SPARKLE_COLOR_MAP.length];

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
        "bg-black border rounded-full shadow-2xl",
        isSelected ? "border-white ring-2 ring-white/50" : bloomClass
      )}>
        {/* Color-Matched Sparkle Pop Layer */}
        <div 
          key={sparkleKey} 
          className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} 
          style={{ background: `radial-gradient(circle, ${sparkleColor} 0%, transparent 75%)` }}
        />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full">
             <div className="absolute inset-1 border-[4px] border-white/90 rounded-full animate-event-horizon shadow-[0_0_25px_#fff,0_0_50px_rgba(245,158,11,0.7)]" />
             <div className="relative w-10 h-10 rounded-full bg-black shadow-[inset_0_0_35px_rgba(255,255,255,0.8)] border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent animate-pulse" />
             </div>
             <div className="absolute inset-0 glossy-overlay opacity-90" />
             <div className="rim-light" />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden">
            {/* Vivid Space Photography */}
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              width={HEX_WIDTH}
              height={HEX_WIDTH}
              data-ai-hint={placeholder.imageHint}
              className="object-cover w-full h-full opacity-90 mix-blend-screen scale-110"
            />
            
            {/* 3D Glass Marble: Specular Highlight */}
            <div className="absolute inset-0 specular-highlight pointer-events-none opacity-100" />
            
            {/* 3D Glass Marble: Rim Light */}
            <div className="rim-light" />
            
            {/* 3D Glass Marble: Glossy Overlay */}
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-60" />
            
            {/* Vignette for Pop */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,1)] pointer-events-none rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
});