'use client';

import { useEffect, useState } from 'react';

interface Star {
  width: string;
  height: string;
  left: string;
  top: string;
  opacity: number;
}

interface DustParticle {
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export function ParallaxBackground({ disabled }: { disabled?: boolean }) {
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
        opacity: Math.random() * 0.6 + 0.2
      }));

    setStars(generateStars(100));

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
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-[#020108] overflow-hidden select-none">
      
      {/* LAYER 1: PULSING NEBULA CLOUD */}
      <div 
        className="absolute inset-[-100px] opacity-20 mix-blend-screen animate-nebula-breath blur-[80px]"
        style={{ 
          background: `
            radial-gradient(circle at 30% 40%, #4c1d95 0%, transparent 60%),
            radial-gradient(circle at 70% 60%, #1e3a8a 0%, transparent 60%)
          `
        }}
      />
      
      {/* LAYER 2: DRIFTING STARFIELD */}
      <div className="absolute inset-0 animate-drift-left">
        {stars.map((star, i) => (
          <div 
            key={`star-${i}`}
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

      {/* LAYER 3: FLOATING STELLAR EMBERS */}
      {!disabled && (
        <div className="absolute inset-0">
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
    </div>
  );
}