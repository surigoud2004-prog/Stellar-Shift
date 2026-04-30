"use client";

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxBackgroundProps {
  isWarping?: boolean;
}

export function ParallaxBackground({ isWarping }: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 50;
      const y = (e.clientY - innerHeight / 2) / 50;
      setOffset({ x, y });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // beta is pitch (up/down), gamma is roll (left/right)
        const x = e.gamma / 2;
        const y = (e.beta - 45) / 2; // Subtracting 45 for standard viewing angle
        setOffset({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return (
    <div className="parallax-container" ref={containerRef}>
      {/* Layer 1: Nebula Deepest */}
      <div 
        className="parallax-layer layer-nebula"
        style={{ transform: `translate3d(${offset.x * 0.5}px, ${offset.y * 0.5}px, 0)` }}
      />
      
      {/* Layer 2: Distant Stars */}
      <div 
        className={cn("parallax-layer layer-stars-distant", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 1.5}px, ${offset.y * 1.5}px, 0)` }}
      />
      
      {/* Layer 3: Near Stars */}
      <div 
        className={cn("parallax-layer layer-stars-near", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 3}px, ${offset.y * 3}px, 0)` }}
      />

      {/* Layer 4: Particle Embers (Floating Star-bits) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="floating-ember"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
}
