
'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Star {
  width: string;
  height: string;
  left: string;
  top: string;
  opacity: number;
  twinkleDuration: string;
  twinkleDelay: string;
}

interface DustParticle {
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export function ParallaxBackground({ disabled, isWarping }: { disabled?: boolean, isWarping?: boolean }) {
  const [stars, setStars] = useState<Star[]>([]);
  const [dust, setDust] = useState<DustParticle[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const generateStars = (count: number) => 
      [...Array(count)].map(() => ({
        width: (Math.random() * 1.5 + 0.5) + 'px',
        height: (Math.random() * 1.5 + 0.5) + 'px',
        left: Math.random() * 200 + '%', 
        top: Math.random() * 100 + '%',
        opacity: Math.random() * 0.6 + 0.2,
        twinkleDuration: (Math.random() * 3 + 2) + 's',
        twinkleDelay: (Math.random() * -5) + 's'
      }));

    setStars(generateStars(150));

    setDust([...Array(15)].map(() => ({
      left: Math.random() * 100 + '%',
      size: (Math.random() * 2 + 1) + 'px',
      duration: (Math.random() * 10 + 20) + 's',
      delay: (Math.random() * -20) + 's',
    })));

    setHasMounted(true);
  }, []);

  if (!hasMounted) return <div className="fixed inset-0 bg-black z-[-10]" />;

  return (
    <div className={cn(
      "fixed inset-0 z-[-10] pointer-events-none bg-[#020108] overflow-hidden select-none transition-all duration-1000",
      isWarping && "brightness-150 contrast-125 scale-110"
    )}>
      
      {/* LAYER 1: NEBULA RESPIRATION */}
      <div 
        className={cn(
          "absolute inset-[-100px] opacity-20 mix-blend-screen animate-nebula-breath blur-[80px] transition-all duration-1000",
          isWarping && "opacity-40 blur-[40px] scale-125"
        )}
        style={{ 
          background: `
            radial-gradient(circle at 30% 40%, #4c1d95 0%, transparent 60%),
            radial-gradient(circle at 70% 60%, #1e3a8a 0%, transparent 60%)
          `
        }}
      />
      
      {/* LAYER 2: DRIFTING STARFIELD */}
      <div className={cn(
        "absolute inset-0 w-[200%] animate-drift-left",
        isWarping && "animate-drift-warp blur-[1px]"
      )}>
        {stars.map((star, i) => (
          <div 
            key={`star-${i}`}
            className={cn("absolute bg-white rounded-full", !disabled && "animate-twinkle")}
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              '--twinkle-duration': star.twinkleDuration,
              animationDelay: star.twinkleDelay
            } as any}
          />
        ))}
      </div>

      {/* LAYER 3: STELLAR EMBERS */}
      {!disabled && (
        <div className={cn("absolute inset-0 transition-opacity duration-500", isWarping && "opacity-0")}>
          {dust.map((particle, i) => (
            <div 
              key={`ember-${i}`}
              className="absolute bg-white/30 rounded-full blur-[1px] animate-ember-rise"
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
      )}

      {/* WARP TUNNEL EFFECT */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-1 bg-white/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,black_80%)]" />
        </div>
      )}
    </div>
  );
}
