"use client";

import Image from 'next/image';
import { CelestialEntity, axialToPixel } from '@/lib/game-utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface EntityProps {
  entity: CelestialEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function Entity({ entity, isSelected, onSelect, disabled }: EntityProps) {
  const { x, y } = axialToPixel(entity.q, entity.r);
  const placeholder = PlaceHolderImages[entity.type];

  // Defensive check to prevent crashes if the placeholder is missing for a type
  if (!placeholder) {
    return (
      <div
        className="absolute w-[60px] h-[60px] rounded-full bg-muted animate-pulse"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: `translate(-50%, -50%)`,
        }}
      />
    );
  }

  return (
    <div
      onClick={() => !disabled && onSelect(entity.id)}
      className={cn(
        "absolute cursor-pointer transition-all duration-500 ease-in-out hover:scale-110",
        isSelected && "z-20 scale-125 brightness-150",
        disabled && "cursor-not-allowed opacity-80"
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '60px',
        height: '60px',
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="relative w-full h-full group">
        <div className={cn(
          "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity",
          entity.type === 0 && "bg-purple-500",
          entity.type === 1 && "bg-blue-500",
          entity.type === 2 && "bg-zinc-400",
          entity.type === 3 && "bg-green-500",
          entity.type === 4 && "bg-orange-500",
          entity.type === 5 && "bg-white",
        )} />
        
        {isSelected && (
          <div className="absolute inset-[-4px] border-2 border-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(187,112,255,0.8)]" />
        )}

        {placeholder?.imageUrl && (
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description || "Celestial Body"}
            width={60}
            height={60}
            className="rounded-full shadow-lg pointer-events-none select-none"
            data-ai-hint={placeholder.imageHint}
          />
        )}
      </div>
    </div>
  );
}
