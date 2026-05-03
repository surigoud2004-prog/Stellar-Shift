'use client';

import { useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  disabled?: boolean;
}

export function ParallaxBackground({ disabled }: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 80;
      const y = (e.clientY - window.innerHeight / 2) / 80;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [disabled]);

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-black overflow-hidden">
      {/* Deep Nebula Layer */}
      <div 
        className="absolute inset-[-100px] opacity-40 mix-blend-screen transition-transform duration-75 ease-out"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, #4f46e533 0%, transparent 50%), radial-gradient(circle at 70% 70%, #7e22ce33 0%, transparent 50%)',
          transform: `translate3d(${offset.x * 0.2}px, ${offset.y * 0.2}px, 0)` 
        }}
      />
      
      {/* Static Star Field (Slow Drift) */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Near Star Layer (Drifts with Mouse) */}
      <div 
        className="absolute inset-[-50px] transition-transform duration-150 ease-out"
        style={{ 
          backgroundImage: 'radial-gradient(1px 1px at 20% 30%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 50% 50%, #fff 100%, transparent), radial-gradient(1px 1px at 80% 70%, #fff 100%, transparent)',
          backgroundSize: '200px 200px',
          transform: `translate3d(${offset.x * 1.5}px, ${offset.y * 1.5}px, 0)` 
        }}
      />
    </div>
  );
}
