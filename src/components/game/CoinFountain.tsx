"use client";

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { playCoinClinkSound } from '@/lib/audio-system';

interface CoinFountainProps {
  isActive: boolean;
}

export function CoinFountain({ isActive }: CoinFountainProps) {
  const [coins, setCoins] = useState<{ id: number; delay: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      const newCoins = Array.from({ length: 10 }).map((_, i) => ({
        id: Math.random(),
        delay: i * 80,
      }));
      setCoins(newCoins);

      // Play sounds as they "spawn" or "hit"
      newCoins.forEach((coin, i) => {
        setTimeout(() => {
          playCoinClinkSound();
        }, coin.delay + 600); // Sound roughly when they hit the top right
      });

      const timer = setTimeout(() => {
        setCoins([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (coins.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10005]">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-coin-fly"
          style={{ animationDelay: `${coin.delay}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.8)] border-2 border-yellow-200">
            <Coins className="w-5 h-5 text-black stroke-[3px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
