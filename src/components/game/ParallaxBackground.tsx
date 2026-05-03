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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Generate stable cosmic data once after hydration
    const generatedStars = [...Array(50)].map(() => ({
      width: Math.random() * 1.5 + 0.5 + 'px',
      height: Math.random() * 1.5 + 0.5 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * 5 + 's',
      opacity: Math.random() * 0.5 + 0.2
    }));
    setStars(generatedStars);

    const generatedHeroStars = [...Array(6)].map(() => ({
      width: Math.random() * 3 + 2 + 'px',
      height: Math.random() * 3 + 2 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * 3 + 's',
      opacity: Math.random() * 0.4 + 0.6
    }));
    setHeroStars(generatedHeroStars);

    const generatedDust = [...Array(8)].map(() => ({
      size: Math.random() * 200 + 100 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      duration: Math.random() * 30 + 30 + 's',
      delay: Math.random() * -30 + 's',
    }));
    setDustMotes(generatedDust);

    setHasMounted(true);

    if (disabled) return;

    // INTERACTIVE TILT: Desktop (Mouse) & Mobile (Orientation)
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 80;
      const y = (e.clientY - window.innerHeight / 2) / 80;
      setOffset({ x, y });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // beta: -180 to 180 (tilt front-back)
        // gamma: -90 to 90 (tilt left-right)
        const x = e.gamma / 3;
        const y = (e.beta - 45) / 3; // Offset by typical holding angle
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
      {/* LAYER 1: DEEPEST VOID & GALAXY CLUSTERS (Blurred for Depth) */}
      <div 
        className="absolute inset-[-200px] transition-transform duration-1000 ease-out bg-[#020108] blur-[4px]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #0c081a 0%, #020108 100%)',
          transform: `translate3d(${offset.x * 0.3}px, ${offset.y * 0.3}px, 0)`
        }}
      />

      {/* LAYER 2: PULSING NEBULA (Blur + Drift + Breath) */}
      <div 
        className="absolute inset-[-250px] opacity-20 mix-blend-screen transition-transform duration-700 ease-out animate-slow-drift-nebula blur-[3px]"
        style={{ 
          background: `
            radial-gradient(circle at 20% 30%, #4c1d95 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, #1e3a8a 0%, transparent 40%),
            radial-gradient(circle at 40% 60%, #581c87 0%, transparent 50%)
          `,
          transform: `translate3d(${offset.x * 0.8}px, ${offset.y * 0.8}px, 0)` 
        }}
      >
        <div className="absolute inset-0 bg-primary/5 animate-nebula-breath" />
      </div>
      
      {/* LAYER 3: STARFIELD (Drift at 0.1 Speed) */}
      <div 
        className="absolute inset-[-100px] transition-transform duration-500 ease-out animate-slow-drift-stars"
        style={{ transform: `translate3d(${offset.x * 1.5}px, ${offset.y * 1.5}px, 0)` }}
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

      {/* LAYER 4: HERO STARS & DUST (Focus Layer) */}
      <div 
        className="absolute inset-[-150px] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${offset.x * 2.5}px, ${offset.y * 2.5}px, 0)` }}
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
            className="absolute bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.7)]"
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