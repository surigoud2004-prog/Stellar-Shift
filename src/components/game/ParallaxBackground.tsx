
'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxBackgroundProps {
  isWarping?: boolean;
  disabled?: boolean;
}

export function ParallaxBackground({ isWarping, disabled }: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 100;
      const y = (e.clientY - window.innerHeight / 2) / 100;
      setOffset({ x, y });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        setOffset({ x: e.gamma / 5, y: (e.beta - 45) / 5 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [disabled]);

  if (disabled) return <div className="fixed inset-0 bg-[#0a0512] z-[-2]" />;

  return (
    <div className="parallax-container">
      <div 
        className="parallax-layer layer-nebula opacity-50"
        style={{ transform: `translate3d(${offset.x * 0.5}px, ${offset.y * 0.5}px, 0)` }}
      />
      <div 
        className={cn("parallax-layer layer-stars-distant", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 1.5}px, ${offset.y * 1.5}px, 0)` }}
      />
      <div 
        className={cn("parallax-layer layer-stars-near", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 4}px, ${offset.y * 4}px, 0)` }}
      />
    </div>
  );
}
