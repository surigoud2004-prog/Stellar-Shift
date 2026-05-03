'use client';

import { useEffect, useState } from 'react';

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

interface DustMote {
  size: string;
  left: string;
  top: string;
  duration: string;
  delay: string;
}

export function ParallaxBackground({ disabled }: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);
  const [heroStars, setHeroStars] = useState<Star[]>([]);
  const [dustMotes, setDustMotes] = useState<DustMote[]>([]);

  useEffect(() => {
    // LAYER 3: Pin-prick stars (50)
    const generatedStars = [...Array(50)].map(() => ({
      width: Math.random() * 1.5 + 0.5 + 'px',
      height: Math.random() * 1.5 + 0.5 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * 5 + 's',
      opacity: Math.random() * 0.5 + 0.2
    }));
    setStars(generatedStars);

    // LAYER 4: Hero stars (6)
    const generatedHeroStars = [...Array(6)].map(() => ({
      width: Math.random() * 3 + 2 + 'px',
      height: Math.random() * 3 + 2 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * 3 + 's',
      opacity: Math.random() * 0.4 + 0.6
    }));
    setHeroStars(generatedHeroStars);

    // LAYER 4: Dust motes (8)
    const generatedDust = [...Array(8)].map(() => ({
      size: Math.random() * 200 + 100 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      duration: Math.random() * 30 + 30 + 's',
      delay: Math.random() * -30 + 's',
    }));
    setDustMotes(generatedDust);

    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 100;
      const y = (e.clientY - window.innerHeight / 2) / 100;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [disabled]);

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-black overflow-hidden select-none">
      {/* LAYER 1: DEEPEST VOID & DISTANT GALAXY CLUSTERS */}
      <div 
        className="absolute inset-[-100px] transition-transform duration-700 ease-out bg-[#020108]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #0c081a 0%, #020108 100%)',
          transform: `translate3d(${offset.x * 0.5}px, ${offset.y * 0.5}px, 0)`
        }}
      />

      {/* LAYER 2: VIOLET & BLUE NEBULA CLOUD */}
      <div 
        className="absolute inset-[-150px] opacity-20 mix-blend-screen transition-transform duration-500 ease-out"
        style={{ 
          background: `
            radial-gradient(circle at 20% 30%, #4c1d95 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, #1e3a8a 0%, transparent 40%),
            radial-gradient(circle at 40% 60%, #581c87 0%, transparent 50%)
          `,
          filter: 'blur(80px)',
          transform: `translate3d(${offset.x * 1.2}px, ${offset.y * 1.2}px, 0)` 
        }}
      />
      
      {/* LAYER 3: STARFIELD (PIN-PRICK) */}
      <div 
        className="absolute inset-[-50px] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${offset.x * 2.5}px, ${offset.y * 2.5}px, 0)` }}
      >
        {stars.map((star, i) => (
          <div 
            key={`star-${i}`}
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

      {/* LAYER 4: HERO STARS & DRIFTING DUST MOTES */}
      <div 
        className="absolute inset-[-100px] transition-transform duration-150 ease-out"
        style={{ transform: `translate3d(${offset.x * 4}px, ${offset.y * 4}px, 0)` }}
      >
        {/* Dust Motes */}
        {dustMotes.map((mote, i) => (
          <div 
            key={`dust-${i}`}
            className="absolute bg-white/5 rounded-full blur-[60px]"
            style={{
              width: mote.size,
              height: mote.size,
              left: mote.left,
              top: mote.top,
              animation: `orbitalFloat ${mote.duration} infinite linear`,
              animationDelay: mote.delay
            }}
          />
        ))}

        {/* Hero Stars */}
        {heroStars.map((star, i) => (
          <div 
            key={`hero-${i}`}
            className="absolute bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            style={{
              width: star.width,
              height: star.height,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              animation: `animate-pulse ${star.delay} infinite alternate`
            }}
          />
        ))}
      </div>
    </div>
  );
}
