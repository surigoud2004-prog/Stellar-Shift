
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_COLS,
  GRID_ROWS,
  SpecialType
} from '@/lib/game-utils';
import { playSwapSound, playMatchSound, playRejectSound, playBombSound, playUIClickSound } from '@/lib/audio-system';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export type GameMode = 'easy' | 'hard' | 'hell';

export function useGameState() {
  const firestoreState = useFirestore();
  const authState = useAuth();
  const firestore = firestoreState || null;
  const auth = authState || null;
  
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
  const [isFlashing, setIsFlashing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetScore = level * 1000; // Level 1: 1000, Level 2: 2000, Level 3: 3000

  // Early Game Ease: 4 colors for first 2 mins, then 6.
  const getVariety = useCallback(() => {
    if (!sessionStartTime) return 6;
    const elapsed = (Date.now() - sessionStartTime) / 1000;
    return elapsed < 120 ? 4 : 6;
  }, [sessionStartTime]);

  const archiveLore = useCallback(async (event: string, context?: string) => {
    if (!firestore || !auth?.currentUser) return;
    try {
      const lore = await generateDynamicLore({ gameEventDescription: event, gameContext: context });
      const logRef = doc(collection(firestore, 'users', auth.currentUser.uid, 'logs'));
      setDoc(logRef, {
        id: logRef.id,
        event,
        snippet: lore.loreSnippet,
        timestamp: Date.now()
      });
    } catch (e) {
      // Fail silently
    }
  }, [firestore, auth]);

  const initBoard = useCallback(() => {
    const variety = getVariety();
    let initial: CelestialEntity[] = [];
    let hasMatches = true;
    let attempts = 0;
    
    while (hasMatches && attempts < 100) {
      attempts++;
      initial = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let q = 0; q < GRID_COLS; q++) {
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
    setTimeLeft(level > 1 ? 55 : 60);
    setIsProcessing(false);
    setIsFlashing(false);
  }, [getVariety, level]);

  // Level Progression Logic: Fixed stuck state
  useEffect(() => {
    if (isWin) {
      const timeout = setTimeout(() => {
        setLevel(prev => prev + 1);
        setScore(0);
        setIsWin(false);
        // Note: initBoard is called via setLevel changing the dependencies if needed, 
        // but we explicitly call it here to ensure clean reset.
      }, 2000); // 2 second delay for MISSION ACCOMPLISHED message
      return () => clearTimeout(timeout);
    }
  }, [isWin]);

  // Handle re-init when level changes
  useEffect(() => {
    if (gameStarted && !isWin && score === 0 && level > 1) {
      initBoard();
      archiveLore("Sector Advancement", `Neural link calibrated for Level ${level}.`);
    }
  }, [level, gameStarted, initBoard, archiveLore]);

  useEffect(() => {
    if (!gameStarted || isGameOver || isWin || entities.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [gameStarted, isGameOver, isWin, entities.length]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMovedId?: string, comboFactor: number = 1) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMovedId);
    const variety = getVariety();
    
    const activatedSpecialIds = new Set<string>();
    const explosiveIds = new Set<string>();
    let triggeredFlash = false;

    const addExplosives = (id: string) => {
      const ent = currentEntities.find(e => e.id === id);
      if (!ent || activatedSpecialIds.has(id)) return;
      activatedSpecialIds.add(id);

      if (ent.special === 'bomb') {
        triggeredFlash = true;
        currentEntities.forEach(e => {
          if (Math.abs(e.q - ent.q) <= 1 && Math.abs(e.r - ent.r) <= 1) explosiveIds.add(e.id);
        });
      } else if (ent.special === 'nova-h') {
        currentEntities.forEach(e => {
          if (e.r === ent.r) explosiveIds.add(e.id);
        });
      }
    };

    matches.forEach(addExplosives);

    if (matches.length > 0 || explosiveIds.size > 0) {
      setIsProcessing(true);
      playMatchSound();
      
      const allToDestroy = new Set([...matches, ...Array.from(explosiveIds)]);
      
      setEntities(prev => prev.map(e => allToDestroy.has(e.id) ? { ...e, isMatched: true } : e));
      if (triggeredFlash) {
        setIsFlashing(true);
        playBombSound();
        setTimeout(() => setIsFlashing(false), 400);
      }
      await new Promise(resolve => setTimeout(resolve, 400));

      const points = allToDestroy.size * 10 * comboFactor;
      
      // Calculate new score immediately for win check
      let currentNewScore = 0;
      setScore(s => {
        currentNewScore = s + points;
        return currentNewScore;
      });

      const updated = currentEntities.filter(e => !allToDestroy.has(e.id));
      const newGrid: CelestialEntity[] = [];
      for (let q = 0; q < GRID_COLS; q++) {
        const column = updated.filter(e => e.q === q).sort((a, b) => b.r - a.r);
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
          const existing = column.shift();
          if (existing) {
            newGrid.push({ ...existing, r });
          } else {
            newGrid.push(generateRandomEntity(q, r, variety));
          }
        }
      }

      if (specialToSpawn) {
        const spawnedIdx = newGrid.findIndex(e => e.q === specialToSpawn.q && e.r === specialToSpawn.r);
        if (spawnedIdx !== -1) {
          newGrid[spawnedIdx] = {
            id: specialToSpawn.id,
            type: specialToSpawn.entityType,
            q: specialToSpawn.q,
            r: specialToSpawn.r,
            special: specialToSpawn.type
          };
        }
      }

      setEntities(newGrid);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await handleMatch(newGrid, undefined, comboFactor * 2);
    } else {
      setIsProcessing(false);
      // Event-based check: Score is updated asynchronously so we check state here
      // However, if we are in the 'else' block, it means matches are done.
      // We use the functional update result indirectly or just check the score state
      // which will be updated by the time we reach this point in the async flow.
      setScore(current => {
        if (current >= targetScore && !isWin && gameStarted) {
          setIsWin(true);
          archiveLore("Mission Milestone Achieved", `Target reached: ${current}/${targetScore}`);
        }
        return current;
      });
    }
  }, [targetScore, archiveLore, getVariety, isWin, gameStarted]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing || isWin || isGameOver) return;
    setIsProcessing(true);
    
    const newEntities = [...entities];
    const idx1 = newEntities.findIndex(e => e.id === id1);
    const idx2 = newEntities.findIndex(e => e.id === id2);

    if (idx1 === -1 || idx2 === -1) {
      setIsProcessing(false);
      return;
    }

    const e1 = newEntities[idx1];
    const e2 = newEntities[idx2];
    
    newEntities[idx1] = { ...e1, q: e2.q, r: e2.r };
    newEntities[idx2] = { ...e2, q: e1.q, r: e1.r };
    
    setEntities(newEntities);
    playSwapSound();
    await new Promise(resolve => setTimeout(resolve, 300)); 

    const { matches } = findMatches(newEntities);
    const isSpecialMoved = e1.special || e2.special;

    if (matches.length === 0 && !isSpecialMoved) {
      playRejectSound();
      const reverted = [...newEntities];
      reverted[idx1] = { ...newEntities[idx1], q: e1.q, r: e1.r };
      reverted[idx2] = { ...newEntities[idx2], q: e2.q, r: e2.r };
      setEntities(reverted);
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsProcessing(false);
      return;
    }
    
    await handleMatch(newEntities, id1, 1);
  }, [entities, handleMatch, isProcessing, isWin, isGameOver]);

  const startGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(true);
    setSessionStartTime(Date.now());
    setLevel(1);
    setScore(0);
    initBoard();
    archiveLore("Mission Started", "Neural link established.");
  }, [initBoard, archiveLore]);

  const quitGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(false);
    setEntities([]);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setSessionStartTime(0);
  }, []);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, isWin, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame, quitGame, gameMode, setGameMode,
    isFlashing
  };
}
