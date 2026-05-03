"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE, 
  calculateDifficulty,
  getColorVariety
} from '@/lib/game-utils';
import { playSwapSound, playMatchSound, playRejectSound } from '@/lib/audio-system';

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetScore = 1000 * level;

  const initBoard = useCallback(() => {
    const variety = getColorVariety(level);
    let initial: CelestialEntity[] = [];
    let hasMatches = true;
    while (hasMatches) {
      initial = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let q = 0; q < GRID_SIZE; q++) {
          initial.push(generateRandomEntity(q, r, variety));
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
  }, [level]);

  useEffect(() => {
    if (gameStarted && entities.length === 0) {
      initBoard();
    }
  }, [initBoard, gameStarted, entities.length]);

  useEffect(() => {
    if (!gameStarted || isGameOver || isWin) {
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
  }, [gameStarted, isGameOver, isWin, score, targetScore]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[]) => {
    const { matches } = findMatches(currentEntities);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      playMatchSound();
      
      setEntities(prev => prev.map(e => matches.includes(e.id) ? { ...e, isMatched: true } : e));
      await new Promise(resolve => setTimeout(resolve, 300));

      const updated = currentEntities.filter(e => !matches.includes(e.id));
      setScore(s => s + matches.length * 10);

      const variety = getColorVariety(level);
      const newGrid: CelestialEntity[] = [];
      for (let q = 0; q < GRID_SIZE; q++) {
        const column = updated.filter(e => e.q === q).sort((a, b) => b.r - a.r);
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          const existing = column.shift();
          if (existing) {
            newGrid.push({ ...existing, r });
          } else {
            newGrid.push(generateRandomEntity(q, r, variety));
          }
        }
      }

      setEntities(newGrid);
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleMatch(newGrid);
    } else {
      setIsProcessing(false);
      if (score >= targetScore) setIsWin(true);
    }
  }, [level, score, targetScore]);

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
    
    await handleMatch(newEntities);
  }, [entities, handleMatch, isProcessing]);

  const startGame = () => setGameStarted(true);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, isWin, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame
  };
}