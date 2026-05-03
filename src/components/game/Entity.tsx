"use client";

import React, { memo, useState, useEffect, useMemo } from 'react';
import { CelestialEntity, HEX_WIDTH, getSectorInfo } from '@/lib/game-utils';
import { cn } from '@/lib/utils';
import { useGameState } from '@/context/GameStateContext';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const BLOOM_MAP = [
  "bloom-cyan", 
  "bloom-pink",     
  "bloom-green", 
  "bloom-amber",   
  "bloom-violet",       
  "bloom-red"    
];

const NEON_CORE_MAP = [
  "neon-core-cyan",
  "neon-core-pink",
  "neon-core-green",
  "neon-core-amber",
  "neon-core-violet",
  "neon-core-red"
];

const GILDED_CORE_MAP = [
  "gilded-core-gold",
  "gilded-core-ruby",
  "gilded-core-sapphire",
  "gilded-core-emerald",
  "gilded-core-gold",
  "gilded-core-ruby"
];

const VOID_OUTLINE_MAP = [
  "void-outline-cyan",
  "void-outline-pink",
  "void-outline-green",
  "void-outline-amber",
  "void-outline-cyan",
  "void-outline-pink"
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
  const { level } = useGameState();
  const [sparkleKey, setSparkleKey] = useState(0);
  
  const sector = useMemo(() => getSectorInfo(level), [level]);
  
  const x = entity.q * HEX_WIDTH;
  const y = entity.r * HEX_WIDTH;
  
  const bloomClass = BLOOM_MAP[entity.type % BLOOM_MAP.length];
  const sparkleColor = SPARKLE_COLOR_MAP[entity.type % SPARKLE_COLOR_MAP.length];

  // Trigger sparkle burst when matched or selected
  useEffect(() => {
    if (entity.isMatched || isSelected) {
      setSparkleKey(prev => prev + 1);
    }
  }, [entity.isMatched, isSelected]);

  const handleInteraction = () => {
    if (disabled) return;
    onSelect(entity.id);
  };

  const isSpecial = !!entity.special;

  return (
    <div
      onClick={handleInteraction}
      className={cn(
        "absolute cursor-pointer transition-all duration-300 p-1.5",
        isSelected && "z-10 scale-110",
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
        "w-full h-full transition-all relative rounded-full animate-core-breath",
        bloomClass,
        isSelected && "brightness-150 ring-4 ring-white shadow-[0_0_40px_white]",
        isSpecial && "ring-4 ring-white animate-pulse shadow-[0_0_20px_white] animate-energy-vibration"
      )}>
        {/* Color-Matched Sparkle Burst Layer */}
        <div 
          key={sparkleKey} 
          className={cn("sparkle-effect", sparkleKey > 0 && "animate-sparkle")} 
          style={{ background: `radial-gradient(circle, ${sparkleColor} 0%, transparent 70%)` }}
        />

        {entity.special === 'bomb' ? (
          <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden rounded-full border border-white/20">
             <div className="absolute inset-0 border-[3px] border-white/80 rounded-full animate-event-horizon shadow-[0_0_20px_white,0_0_40px_gold]" />
             <div className="absolute inset-[15%] border-[1px] border-gold/40 rounded-full animate-event-horizon reverse" style={{ animationDirection: 'reverse' }} />
             <div className="relative w-8 h-8 rounded-full bg-black shadow-[inset_0_0_25px_white]" />
             <div className="absolute inset-0 glossy-overlay opacity-60" />
             <div className="rim-light" />
          </div>
        ) : entity.special === 'nova-h' ? (
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-full border border-white/40">
             <div className={cn("absolute inset-0", NEON_CORE_MAP[entity.type % NEON_CORE_MAP.length])} />
             <div className="absolute inset-x-0 h-2 bg-white blur-sm animate-pulse" />
             <div className="absolute inset-x-0 h-0.5 bg-white z-10" />
             <div className="rim-light" />
             <div className="absolute inset-0 glossy-overlay opacity-40" />
          </div>
        ) : entity.special === 'nova-core' ? (
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-[0_0_20px_white]">
             <div className={cn("absolute inset-0", NEON_CORE_MAP[entity.type % NEON_CORE_MAP.length])} />
             <div className="absolute inset-0 bg-white/30 animate-pulse" />
             <div className="relative z-10 text-white font-black text-xl italic uppercase">★</div>
             <div className="rim-light" />
             <div className="absolute inset-0 glossy-overlay opacity-60" />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 group">
            
            {sector.id === 'neon' && (
              <div className={cn("absolute inset-0", NEON_CORE_MAP[entity.type % NEON_CORE_MAP.length])} />
            )}

            {sector.id === 'gilded' && (
              <>
                <div className={cn("absolute inset-0", GILDED_CORE_MAP[entity.type % GILDED_CORE_MAP.length])} />
                <div className="glitter-overlay" />
              </>
            )}

            {sector.id === 'void' && (
              <div className={cn("absolute inset-0 void-core", VOID_OUTLINE_MAP[entity.type % VOID_OUTLINE_MAP.length])} />
            )}
            
            {/* Pulsing Inner Singularity Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_40%)] opacity-70 animate-pulse" />
            
            {/* 3D Glass Marble Elements */}
            <div className="absolute inset-0 specular-highlight pointer-events-none" />
            <div className="rim-light" />
            <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
});