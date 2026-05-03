
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE,
  HEX_WIDTH,
  SpecialType,
  EntityType
} from '@/lib/game-utils';
import { playSwapSound, playMatchSound, playRejectSound, playBombSound } from '@/lib/audio-system';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export type GameMode = 'easy' | 'hard' | 'hell';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetScore = 1000 * level;

  const initBoard = useCallback(() => {
    let initial: CelestialEntity[] = [];
    let hasMatches = true;
    while (hasMatches) {
      initial = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let q = 0; q < GRID_SIZE; q++) {
          initial.push(generateRandomEntity(q, r));
        }
      }
      const { matches } = findMatches(initial);
      if (matches.length === 0) hasMatches = false;
    }
    setEntities(initial);
    setSelectedId(null);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    setTimeLeft(60);
    setIsProcessing(false);
  }, []);

  // Timer only starts if board is ready and game started
  useEffect(() => {
    if (!gameStarted || isGameOver || isWin || entities.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (score >= targetScore) setIsWin(true);
          else setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [gameStarted, isGameOver, isWin, score, targetScore, entities.length]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMovedId?: string) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMovedId);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      playMatchSound();
      
      // Mark matches for animation
      setEntities(prev => prev.map(e => matches.includes(e.id) ? { ...e, isMatched: true } : e));
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check for Bomb/AoE triggers
      const bombIds: string[] = [];
      matches.forEach(id => {
        const ent = currentEntities.find(e => e.id === id);
        if (ent?.special === 'bomb') {
          // Identify 3x3 area
          const neighbors = currentEntities.filter(e => 
            Math.abs(e.q - ent.q) <= 1 && Math.abs(e.r - ent.r) <= 1
          ).map(e => e.id);
          bombIds.push(...neighbors);
        }
      });

      const allToDelete = Array.from(new Set([...matches, ...bombIds]));
      if (bombIds.length > 0) playBombSound();

      const updated = currentEntities.filter(e => !allToDelete.includes(e.id));
      const points = allToDelete.length * 10 * (bombIds.length > 0 ? 5 : 1);
      setScore(s => s + points);

      const newGrid: CelestialEntity[] = [];
      for (let q = 0; q < GRID_SIZE; q++) {
        const column = updated.filter(e => e.q === q).sort((a, b) => b.r - a.r);
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          const existing = column.shift();
          if (existing) {
            newGrid.push({ ...existing, r });
          } else {
            newGrid.push(generateRandomEntity(q, r));
          }
        }
      }

      // If we spawned a special entity
      if (specialToSpawn) {
        newGrid.push({
          id: specialToSpawn.id,
          type: specialToSpawn.entityType,
          q: specialToSpawn.q,
          r: specialToSpawn.r,
          special: specialToSpawn.type
        });
      }

      setEntities(newGrid);
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleMatch(newGrid);
    } else {
      setIsProcessing(false);
      if (score >= targetScore) setIsWin(true);
    }
  }, [score, targetScore]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newEntities = [...entities];
    const idx1 = newEntities.findIndex(e => e.id === id1);
    const idx2 = newEntities.findIndex(e => e.id === id2);

    if (idx1 === -1 || idx2 === -1) {
      setIsProcessing(false);
      return;
    }

    const q1 = newEntities[idx1].q;
    const r1 = newEntities[idx1].r;
    newEntities[idx1] = { ...newEntities[idx1], q: newEntities[idx2].q, r: newEntities[idx2].r };
    newEntities[idx2] = { ...newEntities[idx2], q: q1, r: r1 };
    
    setEntities(newEntities);
    playSwapSound();
    await new Promise(resolve => setTimeout(resolve, 300));

    const { matches } = findMatches(newEntities);
    if (matches.length === 0) {
      playRejectSound();
      const reverted = [...newEntities];
      reverted[idx1] = { ...reverted[idx1], q: q1, r: r1 };
      reverted[idx2] = { ...reverted[idx2], q: newEntities[idx1].q, r: newEntities[idx1].r };
      setEntities(reverted);
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsProcessing(false);
      return;
    }
    
    await handleMatch(newEntities, id1);
  }, [entities, handleMatch, isProcessing]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    initBoard();
  }, [initBoard]);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, isWin, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame, gameMode, setGameMode
  };
}
