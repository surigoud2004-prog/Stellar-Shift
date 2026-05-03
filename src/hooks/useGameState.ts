
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_COLS,
  GRID_ROWS
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetScore = 1000 * level;

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
    let initial: CelestialEntity[] = [];
    let hasMatches = true;
    let attempts = 0;
    
    while (hasMatches && attempts < 100) {
      attempts++;
      initial = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let q = 0; q < GRID_COLS; q++) {
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
    setIsFlashing(false);
  }, []);

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
      
      // Phase 1: Neural Implosion Trigger
      setEntities(prev => prev.map(e => matches.includes(e.id) ? { ...e, isMatched: true } : e));
      await new Promise(resolve => setTimeout(resolve, 400)); // Match the CSS animation duration

      // Phase 2: Handle Black Hole/Singularity Explosions
      const bombIds: string[] = [];
      let hasBombDetonated = false;

      matches.forEach(id => {
        const ent = currentEntities.find(e => e.id === id);
        if (ent?.special === 'bomb') {
          hasBombDetonated = true;
          const neighbors = currentEntities.filter(e => 
            Math.abs(e.q - ent.q) <= 1 && Math.abs(e.r - ent.r) <= 1
          ).map(e => e.id);
          bombIds.push(...neighbors);
        }
      });

      if (hasBombDetonated) {
        setIsFlashing(true);
        playBombSound();
        setEntities(prev => prev.map(e => bombIds.includes(e.id) ? { ...e, isExploding: true } : e));
        setTimeout(() => setIsFlashing(false), 400);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const allToDelete = Array.from(new Set([...matches, ...bombIds]));
      const updated = currentEntities.filter(e => !allToDelete.includes(e.id));
      const points = allToDelete.length * 10 * (bombIds.length > 0 ? 5 : 1);
      setScore(s => s + points);

      // Phase 3: Cascade Refill
      const newGrid: CelestialEntity[] = [];
      for (let q = 0; q < GRID_COLS; q++) {
        const column = updated.filter(e => e.q === q).sort((a, b) => b.r - a.r);
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
          const existing = column.shift();
          if (existing) {
            newGrid.push({ ...existing, r });
          } else {
            newGrid.push(generateRandomEntity(q, r));
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
      
      // Cascade check
      await handleMatch(newGrid);
    } else {
      setIsProcessing(false);
      if (score >= targetScore) {
        setIsWin(true);
        archiveLore("Mission Victory", `Link stabilized at score ${score}`);
      }
    }
  }, [score, targetScore, archiveLore]);

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

    const e1 = newEntities[idx1];
    const e2 = newEntities[idx2];
    
    newEntities[idx1] = { ...e1, q: e2.q, r: e2.r };
    newEntities[idx2] = { ...e2, q: e1.q, r: e1.r };
    
    setEntities(newEntities);
    playSwapSound();
    await new Promise(resolve => setTimeout(resolve, 300)); 

    const { matches } = findMatches(newEntities);
    if (matches.length === 0) {
      playRejectSound();
      const reverted = [...newEntities];
      reverted[idx1] = { ...newEntities[idx1], q: e1.q, r: e1.r };
      reverted[idx2] = { ...newEntities[idx2], q: e2.q, r: e2.r };
      setEntities(reverted);
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsProcessing(false);
      return;
    }
    
    await handleMatch(newEntities, id1);
  }, [entities, handleMatch, isProcessing]);

  const startGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(true);
    initBoard();
    archiveLore("Mission Started", "Neural link established.");
  }, [initBoard, archiveLore]);

  const quitGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(false);
    setEntities([]);
    setScore(0);
    setTimeLeft(60);
  }, []);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, isWin, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame, quitGame, gameMode, setGameMode,
    isFlashing
  };
}
