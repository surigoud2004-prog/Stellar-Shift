
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [starsFar, setStarsFar] = useState<Star[]>([]);
  const [starsMid, setStarsMid] = useState<Star[]>([]);
  const [starsNear, setStarsNear] = useState<Star[]>([]);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Generate stable cosmic data once after hydration to avoid mismatches
    const generateStars = (count: number, sizeMin: number, sizeMax: number) => 
      [...Array(count)].map(() => ({
        width: (Math.random() * (sizeMax - sizeMin) + sizeMin) + 'px',
        height: (Math.random() * (sizeMax - sizeMin) + sizeMin) + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        delay: Math.random() * 5 + 's',
        opacity: Math.random() * 0.5 + 0.3
      }));

    setStarsFar(generateStars(60, 0.5, 1));
    setStarsMid(generateStars(30, 1.2, 2));
    setStarsNear(generateStars(10, 2.5, 4));

    setDustParticles([...Array(20)].map(() => ({
      left: Math.random() * 100 + '%',
      size: (Math.random() * 2 + 1) + 'px',
      duration: (Math.random() * 10 + 15) + 's',
      delay: (Math.random() * -20) + 's',
    })));

    setHasMounted(true);

    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 50;
      const y = (e.clientY - window.innerHeight / 2) / 50;
      setOffset({ x, y });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        const x = e.gamma / 2;
        const y = (e.beta - 45) / 2; 
        setOffset({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [disabled]);

  if (!hasMounted) return <div className="fixed inset-0 bg-black z-[-10]" />;

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-black overflow-hidden select-none">
      {/* LAYER 1: HIGH-CONTRAST DEEP VOID */}
      <div 
        className="absolute inset-[-100px] bg-[#020108]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #050212 0%, #010005 100%)',
        }}
      />

      {/* LAYER 2: NEBULA FLOW (PURPLE/BLUE) */}
      <div 
        className="absolute inset-[-200px] opacity-25 mix-blend-screen transition-transform duration-1000 ease-out animate-slow-drift-nebula blur-[50px]"
        style={{ 
          background: `
            radial-gradient(circle at 30% 40%, #4c1d95 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, #1e3a8a 0%, transparent 50%)
          `,
          transform: `translate3d(${offset.x * 0.5}px, ${offset.y * 0.5}px, 0)` 
        }}
      >
        <div className="absolute inset-0 animate-nebula-breath bg-primary/5" />
      </div>
      
      {/* LAYER 3: 3-SPEED STARFIELD */}
      {/* Stars Far (Smallest, Slowest) */}
      <div 
        className="absolute inset-[-50px] transition-transform duration-700 ease-out animate-slow-drift-stars"
        style={{ transform: `translate3d(${offset.x * 0.3}px, ${offset.y * 0.3}px, 0)` }}
      >
        {starsFar.map((star, i) => (
          <div 
            key={`star-far-${i}`}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      {/* Stars Mid (Medium, Mid-Speed) */}
      <div 
        className="absolute inset-[-70px] transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${offset.x * 0.8}px, ${offset.y * 0.8}px, 0)` }}
      >
        {starsMid.map((star, i) => (
          <div 
            key={`star-mid-${i}`}
            className="absolute bg-white rounded-full opacity-80"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              boxShadow: '0 0 5px rgba(255,255,255,0.3)'
            }}
          />
        ))}
      </div>

      {/* Stars Near (Large, Fastest) */}
      <div 
        className="absolute inset-[-100px] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${offset.x * 1.5}px, ${offset.y * 1.5}px, 0)` }}
      >
        {starsNear.map((star, i) => (
          <div 
            key={`star-near-${i}`}
            className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              opacity: 1
            }}
          />
        ))}
      </div>

      {/* LAYER 4: STELLAR DUST (UPWARD FLOATING) */}
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
