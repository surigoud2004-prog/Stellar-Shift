
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE, 
  offsetToAxial,
  calculateDifficulty,
  getColorVariety,
  SpecialType
} from '@/lib/game-utils';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';
import { collection, addDoc, query, orderBy, limit, getDocs, Firestore, serverTimestamp } from 'firebase/firestore';
import { getFirestore, getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export type GameMode = 'easy' | 'hard' | 'hell';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [lore, setLore] = useState<string>("Align the shards to stabilize the sector.");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  
  const lastMoveTime = useRef(Date.now());
  const lastMatchTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetScore = Math.floor(1000 * calculateDifficulty(level) * (gameMode === 'hard' ? 1.5 : gameMode === 'hell' ? 2 : 1));

  // Persistence
  useEffect(() => {
    const savedBest = localStorage.getItem('stellar_best_score');
    const savedLevel = localStorage.getItem('stellar_level');
    if (savedBest) setBestScore(parseInt(savedBest));
    if (savedLevel) setLevel(parseInt(savedLevel));
  }, []);

  useEffect(() => {
    localStorage.setItem('stellar_best_score', bestScore.toString());
    localStorage.setItem('stellar_level', level.toString());
  }, [bestScore, level]);

  const initBoard = useCallback(() => {
    const variety = getColorVariety(level);
    let initial: CelestialEntity[] = [];
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
    lastMatchTime.current = Date.now();
    lastMoveTime.current = Date.now();
    setIsLocked(false);
    const times = { easy: 180, hard: 90, hell: 45 };
    setTimeLeft(times[gameMode]);
  }, [level, gameMode]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Main Timer & Hell Mode Lock
  useEffect(() => {
    if (isGameOver || isWin) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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

  // Pity Timer (Comet spawn after 15s)
  useEffect(() => {
    if (isGameOver || isWin || isProcessing) return;
    pityTimerRef.current = setInterval(() => {
      if (Date.now() - lastMatchTime.current > 15000) {
        setEntities(prev => {
          const next = [...prev];
          const randIdx = Math.floor(Math.random() * next.length);
          next[randIdx] = { ...next[randIdx], special: 'comet' };
          return next;
        });
        lastMatchTime.current = Date.now();
        setLore("CELESTIAL ANOMALY: A comet has entered the sector.");
      }
    }, 1000);
    return () => clearInterval(pityTimerRef.current!);
  }, [isGameOver, isWin, isProcessing]);

  const syncHighScore = async () => {
    try {
      const { db, auth } = initializeFirebase();
      if (!auth.currentUser) await signInAnonymously(auth);
      await addDoc(collection(db, 'leaderboard'), {
        uid: auth.currentUser?.uid || 'anon',
        displayName: 'Stellar Pilot',
        score,
        level,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Sync failed", e);
    }
  };

  useEffect(() => {
    if (score >= targetScore && !isWin) {
      setIsWin(true);
      if (score > bestScore) setBestScore(score);
      setLore("STABILITY ACHIEVED: Syncing coordinates to Galactic Network.");
      syncHighScore();
      setTimeout(() => setLevel(l => l + 1), 3000);
    }
  }, [score, targetScore, isWin]);

  useEffect(() => {
    if (isGameOver) syncHighScore();
  }, [isGameOver]);

  const triggerLore = useCallback(async (event: string, context?: string) => {
    try {
      const result = await generateDynamicLore({ gameEventDescription: event, gameContext: context });
      setLore(result.loreSnippet);
    } catch (e) {}
  }, []);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMoveId?: string) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMoveId);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      lastMatchTime.current = Date.now();
      
      let points = matches.length * 20;
      setScore(prev => prev + points);

      let matchedSet = new Set(matches);
      let updated = currentEntities.filter(e => !matchedSet.has(e.id));

      // Handle Special Spawns
      if (specialToSpawn) {
        updated.push({
          id: Math.random().toString(36).substring(7),
          type: specialToSpawn.entityType,
          q: specialToSpawn.q,
          r: specialToSpawn.r,
          special: specialToSpawn.type
        });
        triggerLore(`${specialToSpawn.type} Synthesized`, "High resonance event detected.");
      }

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
      setTimeout(() => handleMatch(finalEntities), 400);
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

    // Check for Comet trigger
    if (newEntities[idx1].special === 'comet' || newEntities[idx2].special === 'comet') {
      const cometId = newEntities[idx1].special === 'comet' ? id1 : id2;
      const targetIds = entities.slice(0, 5).map(e => e.id);
      setScore(s => s + 500);
      setEntities(prev => prev.filter(e => !targetIds.includes(e.id) && e.id !== cometId));
      setTimeout(() => handleMatch(entities.filter(e => !targetIds.includes(e.id) && e.id !== cometId)), 200);
      return;
    }

    const q1 = newEntities[idx1].q;
    const r1 = newEntities[idx1].r;
    newEntities[idx1].q = newEntities[idx2].q;
    newEntities[idx1].r = newEntities[idx2].r;
    newEntities[idx2].q = q1;
    newEntities[idx2].r = r1;

    const { matches } = findMatches(newEntities);
    if (matches.length === 0) {
      setLore("Alignment rejected: Low resonance path.");
      return;
    }
    
    setIsProcessing(true);
    setEntities(newEntities);
    setTimeout(() => handleMatch(newEntities, id1), 200);
  }, [entities, handleMatch, isProcessing, isGameOver, isWin, isLocked]);

  return {
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isLocked, lore, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame
  };
}
