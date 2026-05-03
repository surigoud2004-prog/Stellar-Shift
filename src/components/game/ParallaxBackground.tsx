'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxBackgroundProps {
  disabled?: boolean;
}

interface Star {
  width: string;
  height: string;
  left: string;
  top: string;
  delay: string;
  opacity: number;
}

interface DustParticle {
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export function ParallaxBackground({ disabled }: ParallaxBackgroundProps) {
  const [starsFar, setStarsFar] = useState<Star[]>([]);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const generateStars = (count: number, sizeMin: number, sizeMax: number) => 
      [...Array(count)].map(() => ({
        width: (Math.random() * (sizeMax - sizeMin) + sizeMin) + 'px',
        height: (Math.random() * (sizeMax - sizeMin) + sizeMin) + 'px',
        left: Math.random() * 200 + '%', // Extended for drifting
        top: Math.random() * 100 + '%',
        delay: Math.random() * 5 + 's',
        opacity: Math.random() * 0.5 + 0.3
      }));

    setStarsFar(generateStars(80, 0.5, 1.5));

    setDustParticles([...Array(20)].map(() => ({
      left: Math.random() * 100 + '%',
      size: (Math.random() * 2 + 1) + 'px',
      duration: (Math.random() * 10 + 15) + 's',
      delay: (Math.random() * -20) + 's',
    })));

    setHasMounted(true);
  }, []);

  if (!hasMounted) return <div className="fixed inset-0 bg-black z-[-10]" />;

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-black overflow-hidden select-none">
      {/* LAYER 1: DEEP VOID */}
      <div className="absolute inset-0 bg-[#020108]" />

      {/* LAYER 2: PULSING NEBULA CLOUD */}
      <div 
        className="absolute inset-[-100px] opacity-30 mix-blend-screen animate-nebula-breath blur-[80px]"
        style={{ 
          background: `
            radial-gradient(circle at 40% 40%, #4c1d95 0%, transparent 60%),
            radial-gradient(circle at 60% 60%, #1e3a8a 0%, transparent 60%)
          `
        }}
      />
      
      {/* LAYER 3: DRIFTING STARFIELD */}
      <div className="absolute inset-0 animate-drift-left">
        {starsFar.map((star, i) => (
          <div 
            key={`star-far-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      {/* LAYER 4: FLOATING STELLAR DUST */}
      <div className="absolute inset-0">
        {dustParticles.map((particle, i) => (
          <div 
            key={`dust-${i}`}
            className="absolute bg-white/40 rounded-full blur-[1px] animate-ember-rise"
            style={{
              left: particle.left,
              bottom: '-5%',
              width: particle.size,
              height: particle.size,
              '--ember-duration': particle.duration,
              animationDelay: particle.delay
            } as any}
          />
        ))}
      </div>
    </div>
  );
}