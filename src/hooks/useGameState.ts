"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE, 
  offsetToAxial,
  calculateDifficulty,
  getColorVariety
} from '@/lib/game-utils';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export type GameMode = 'easy' | 'hard' | 'hell';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [lore, setLore] = useState<string>("Select a difficulty mode to begin your alignment.");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const lastMoveTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetScore = Math.floor(1000 * calculateDifficulty(level) * (gameMode === 'hard' ? 1.5 : gameMode === 'hell' ? 2 : 1));

  const initBoard = useCallback(() => {
    const variety = getColorVariety(level);
    let initial: CelestialEntity[] = [];
    
    // Generate until no immediate matches exist
    let hasMatches = true;
    while (hasMatches) {
      initial = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const { q, r } = offsetToAxial(col, row);
          initial.push(generateRandomEntity(q, r, variety));
        }
      }
      const { matches } = findMatches(initial);
      if (matches.length === 0) hasMatches = false;
    }

    setEntities(initial);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    lastMoveTime.current = Date.now();
    setIsLocked(false);
    
    const times = { easy: 180, hard: 90, hell: 45 };
    setTimeLeft(times[gameMode]);
  }, [level, gameMode]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  useEffect(() => {
    if (isGameOver || isWin) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (score < targetScore) setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });

      if (gameMode === 'hell' && Date.now() - lastMoveTime.current > 5000) {
        setIsLocked(true);
      }
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isGameOver, isWin, score, targetScore, gameMode]);

  useEffect(() => {
    if (score >= targetScore && !isWin) {
      setIsWin(true);
      setLore("MISSION SUCCESS: Sector stability reached. Moving to next coordinate.");
      setTimeout(() => {
        setLevel(l => l + 1);
      }, 3000);
    }
  }, [score, targetScore, isWin]);

  const triggerLore = useCallback(async (event: string, context?: string) => {
    try {
      const result = await generateDynamicLore({ gameEventDescription: event, gameContext: context });
      setLore(result.loreSnippet);
    } catch (e) {
      console.error("Lore generation failed", e);
    }
  }, []);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[]) => {
    const { matches, meteorStrike, timeWarp, pulseWave } = findMatches(currentEntities);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      
      let points = matches.length * 10;
      if (meteorStrike) {
        points += 500;
        triggerLore("Meteor Strike Detected", "Random structures cleared by impact.");
      }
      if (timeWarp) {
        setTimeLeft(t => t + 10);
        triggerLore("Time Warp Stabilized", "Chronal energy restored.");
      }
      if (pulseWave) {
        points += 200;
        triggerLore("Pulse Wave Released", "Local space cleared of debris.");
      }

      setScore(prev => prev + points);

      let matchedSet = new Set(matches);
      
      // Meteor Strike logic: smash 5 randoms
      if (meteorStrike) {
        const remaining = currentEntities.filter(e => !matchedSet.has(e.id));
        for (let i = 0; i < 5 && remaining.length > 0; i++) {
          const randIdx = Math.floor(Math.random() * remaining.length);
          matchedSet.add(remaining[randIdx].id);
          remaining.splice(randIdx, 1);
        }
      }

      let updated = currentEntities.filter(e => !matchedSet.has(e.id));
      
      // Gravity refill
      const finalEntities = [...updated];
      const gridMap = new Map<string, CelestialEntity>();
      finalEntities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));
      const variety = getColorVariety(level);

      for (let col = 0; col < GRID_SIZE; col++) {
        let holes = 0;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          const { q, r } = offsetToAxial(col, row);
          const key = `${q},${r}`;
          if (!gridMap.has(key)) {
            holes++;
          } else if (holes > 0) {
            const e = gridMap.get(key)!;
            gridMap.delete(key);
            const targetAxial = offsetToAxial(col, row + holes);
            e.q = targetAxial.q;
            e.r = targetAxial.r;
            gridMap.set(`${e.q},${e.r}`, e);
          }
        }
        for (let h = 0; h < holes; h++) {
          const { q, r } = offsetToAxial(col, h);
          finalEntities.push(generateRandomEntity(q, r, variety));
        }
      }

      setEntities(finalEntities);
      const dropSpeed = Math.max(150, 600 - (level * 5));
      setTimeout(() => handleMatch(finalEntities), dropSpeed);
    } else {
      setIsProcessing(false);
    }
  }, [triggerLore, level]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing || isGameOver || isWin || isLocked) return;

    lastMoveTime.current = Date.now();
    setIsLocked(false);

    const newEntities = entities.map(e => ({ ...e }));
    const idx1 = newEntities.findIndex(e => e.id === id1);
    const idx2 = newEntities.findIndex(e => e.id === id2);
    
    if (idx1 === -1 || idx2 === -1) return;

    const q1 = newEntities[idx1].q;
    const r1 = newEntities[idx1].r;
    newEntities[idx1].q = newEntities[idx2].q;
    newEntities[idx1].r = newEntities[idx2].r;
    newEntities[idx2].q = q1;
    newEntities[idx2].r = r1;

    const { matches } = findMatches(newEntities);
    
    if (matches.length === 0) {
      setLore("Alignment rejected: Swapping these shards creates no resonance.");
      return;
    }
    
    setIsProcessing(true);
    setEntities(newEntities);
    setTimeout(() => handleMatch(newEntities), 200);
  }, [entities, handleMatch, isProcessing, isGameOver, isWin, isLocked]);

  return {
    entities,
    score,
    targetScore,
    timeLeft,
    level,
    gameMode,
    setGameMode,
    isGameOver,
    isWin,
    isLocked,
    lore,
    selectedId,
    setSelectedId,
    swapEntities,
    isProcessing,
    initBoard
  };
}