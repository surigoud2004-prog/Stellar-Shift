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
      const x = (e.clientX - innerWidth / 2) / 60;
      const y = (e.clientY - innerHeight / 2) / 60;
      setOffset({ x, y });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // beta: pitch (-180 to 180), gamma: roll (-90 to 90)
        // Shifting coordinates for subtle effect
        const x = e.gamma / 1.5;
        const y = (e.beta - 45) / 1.5;
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
      {/* Layer 1 (Deepest): Nebula */}
      <div 
        className="parallax-layer layer-nebula"
        style={{ transform: `translate3d(${offset.x * 0.4}px, ${offset.y * 0.4}px, 0)` }}
      />
      
      {/* Layer 2 (Middle): Distant Stars & Galaxy */}
      <div 
        className={cn("parallax-layer layer-stars-distant", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 1.2}px, ${offset.y * 1.2}px, 0)` }}
      />
      
      {/* Layer 3 (Top): Near Stars & Drifting Objects */}
      <div 
        className={cn("parallax-layer layer-stars-near", isWarping && "warp-streak")}
        style={{ transform: `translate3d(${offset.x * 3.5}px, ${offset.y * 3.5}px, 0)` }}
      />

      {/* Layer 4 (Atmosphere): Floating Star Embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className="floating-ember"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              backgroundColor: i % 2 === 0 ? '#fff' : '#a855f7',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
}