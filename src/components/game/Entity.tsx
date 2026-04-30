
"use client";

import Image from 'next/image';
import { CelestialEntity, axialToPixel } from '@/lib/game-utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Zap, Sun, Target, Stars, Sparkles } from 'lucide-react';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const { x, y } = axialToPixel(entity.q, entity.r);
  const placeholder = (entity.type >= 0 && entity.type < PlaceHolderImages.length) 
    ? PlaceHolderImages[entity.type] 
    : PlaceHolderImages[0];

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-300 ease-out hover:scale-110",
        isSelected && "z-20 scale-125 brightness-150",
        disabled && "cursor-not-allowed opacity-80"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '54px',
        height: '54px',
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="relative w-full h-full group">
        {/* Glow Layer */}
        <div className={cn(
          "absolute inset-0 rounded-xl blur-lg opacity-40 transition-opacity",
          entity.type === 0 && "bg-purple-500",
          entity.type === 1 && "bg-blue-500",
          entity.type === 2 && "bg-zinc-400",
          entity.type === 3 && "bg-green-500",
          entity.type === 4 && "bg-orange-500",
          entity.type === 5 && "bg-white",
        )} />
        
        {/* Selection / Special Frame */}
        {(isSelected || entity.special) && (
          <div className={cn(
            "absolute inset-[-4px] border-2 rounded-xl animate-pulse z-10",
            isSelected ? "border-primary shadow-[0_0_15px_rgba(187,112,255,0.8)]" : "border-white/50"
          )} />
        )}

        {/* The Space Shard (Cube) */}
        <div className={cn(
          "relative w-full h-full bg-white/5 rounded-xl overflow-hidden border shadow-2xl backdrop-blur-sm group-active:scale-95 transition-transform duration-200 flex items-center justify-center",
          entity.special ? "border-white/60 bg-white/20" : "border-white/20"
        )}>
          {placeholder?.imageUrl && (
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description || "Celestial Shard"}
              width={60}
              height={60}
              className={cn(
                "object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity",
                entity.special && "brightness-125 scale-110"
              )}
            />
          )}

          {/* Special Type Icon Overlay */}
          {entity.special && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              {entity.special === 'nova-h' && <Zap className="w-8 h-8" />}
              {entity.special === 'black-hole' && <Target className="w-8 h-8 animate-spin" />}
              {entity.special === 'bomb' && <Sun className="w-8 h-8" />}
              {entity.special === 'comet' && <Sparkles className="w-8 h-8 text-yellow-400" />}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
