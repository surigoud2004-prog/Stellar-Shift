
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_COLS,
  GRID_ROWS,
  SpecialType,
  EntityType
} from '@/lib/game-utils';
import { playSwapSound, playMatchSound, playRejectSound, playBombSound, playUIClickSound } from '@/lib/audio-system';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export type GameMode = 'easy' | 'hard' | 'hell';

export interface PowerUpState {
  timeDilator: boolean;
  novaBlast: boolean;
  colorNuke: number;
}

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
  const [isWarping, setIsWarping] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [isReviving, setIsReviving] = useState(false);
  const [reviveCost, setReviveCost] = useState(200);

  // Power Up States
  const [powerUps, setPowerUps] = useState<PowerUpState>({
    timeDilator: false,
    novaBlast: false,
    colorNuke: 0
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // INFINITE LEVELING MATH - Level * 1500
  const targetScore = useMemo(() => level * 1500, [level]);
  
  const levelTimeLimit = useMemo(() => {
    const base = Math.max(30, 60 - (level - 1) * 2);
    return powerUps.timeDilator ? base + 15 : base;
  }, [level, powerUps.timeDilator]);
  
  // 5% speed increase per level
  const animationDuration = useMemo(() => 0.3 * Math.pow(0.95, level - 1), [level]);

  const getVariety = useCallback(() => {
    if (!sessionStartTime) return 6;
    if (level <= 5) return 4;
    return 6;
  }, [sessionStartTime, level]);

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
    } catch (e) {}
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

    if (powerUps.novaBlast) {
      for (let i = 0; i < 2; i++) {
        const randIdx = Math.floor(Math.random() * initial.length);
        initial[randIdx].special = 'bomb';
      }
    }
    
    setEntities(initial);
    setSelectedId(null);
    setIsGameOver(false);
    setIsWin(false);
    setIsWarping(false);
    setTimeLeft(levelTimeLimit);
    setScore(0);
    setIsProcessing(false);
    setIsFlashing(false);
    setIsShaking(false);
    setIsReviving(false);
    setReviveCost(200);
  }, [getVariety, levelTimeLimit, powerUps.novaBlast]);

  useEffect(() => {
    if (isWin) {
      setIsWarping(true);
      // Clear entities immediately to prepare for warp refill
      setEntities([]);
      const timeout = setTimeout(() => {
        setLevel(prev => prev + 1);
        setScore(0);
        setIsWin(false);
        setIsWarping(false);
        setPowerUps(prev => ({ ...prev, timeDilator: false, novaBlast: false }));
        setReviveCost(200);
      }, 2500); 
      return () => clearTimeout(timeout);
    }
  }, [isWin]);

  useEffect(() => {
    if (gameStarted && !isWin && !isGameOver && !isWarping && !isReviving) {
      if (entities.length === 0) {
        initBoard();
      }
    }
  }, [level, gameStarted, initBoard, isWin, isGameOver, entities.length, isReviving, isWarping]);

  useEffect(() => {
    if (!gameStarted || isGameOver || isWin || isWarping || isReviving || entities.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsReviving(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [gameStarted, isGameOver, isWin, isWarping, isReviving, entities.length]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMovedId?: string, comboFactor: number = 1, forceExplosionIds?: Set<string>) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMovedId);
    const variety = getVariety();
    
    const activatedSpecialIds = new Set<string>();
    const explosiveIds = new Set<string>(forceExplosionIds || []);
    let triggeredFlash = false;
    let triggeredShake = false;
    let chainMultiplier = 1;

    const addExplosives = (id: string) => {
      const ent = currentEntities.find(e => e.id === id);
      if (!ent || activatedSpecialIds.has(id)) return;
      
      if (ent.special) {
        chainMultiplier *= 2;
      }
      
      activatedSpecialIds.add(id);

      if (ent.special === 'bomb') {
        triggeredFlash = true;
        triggeredShake = true;
        currentEntities.forEach(e => {
          if (Math.abs(e.q - ent.q) <= 1 && Math.abs(e.r - ent.r) <= 1) explosiveIds.add(e.id);
        });
      } else if (ent.special === 'nova-h') {
        currentEntities.forEach(e => {
          if (e.r === ent.r) explosiveIds.add(e.id);
        });
      } else if (ent.special === 'nova-v') {
        currentEntities.forEach(e => {
          if (e.q === ent.q) explosiveIds.add(e.id);
        });
      } else if (ent.special === 'rainbow-core') {
         explosiveIds.add(ent.id);
      }
    };

    matches.forEach(addExplosives);
    if (forceExplosionIds) forceExplosionIds.forEach(addExplosives);

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
      if (triggeredShake) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }

      await new Promise(resolve => setTimeout(resolve, animationDuration * 1000 * 1.3));

      const points = Math.floor(allToDestroy.size * 10 * comboFactor * chainMultiplier);
      
      setScore(s => {
        const newScore = Math.floor(s + points);
        if (newScore >= targetScore && !isWin && !isWarping) {
           setIsWin(true);
           archiveLore("Sector Secured", `Level ${level} targets reached.`);
        }
        return newScore;
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
      await new Promise(resolve => setTimeout(resolve, animationDuration * 1000));
      await handleMatch(newGrid, undefined, comboFactor * 1.5);
    } else {
      setIsProcessing(false);
    }
  }, [targetScore, getVariety, isWin, isWarping, level, archiveLore, animationDuration]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing || isWin || isGameOver || isWarping || isReviving) return;
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
    
    if (e1.special && e2.special) {
      const explosionIds = new Set<string>();
      
      if (e1.special === 'rainbow-core' && e2.special === 'rainbow-core') {
        newEntities.forEach(e => explosionIds.add(e.id));
      } else if (e1.special === 'rainbow-core' || e2.special === 'rainbow-core') {
        const rainbow = e1.special === 'rainbow-core' ? e1 : e2;
        const other = e1.special === 'rainbow-core' ? e2 : e1;
        const targetType = other.type;
        const targetSpecial = other.special;
        
        newEntities.forEach(e => {
          if (e.type === targetType) {
            e.special = targetSpecial;
            explosionIds.add(e.id);
          }
        });
        explosionIds.add(rainbow.id);
      } else if ((e1.special === 'nova-h' || e1.special === 'nova-v') && (e2.special === 'nova-h' || e2.special === 'nova-v')) {
        newEntities.forEach(e => {
          if (e.q === e1.q || e.r === e1.r) explosionIds.add(e.id);
        });
      } else if (((e1.special === 'nova-h' || e1.special === 'nova-v') && e2.special === 'bomb') || (e1.special === 'bomb' && (e2.special === 'nova-h' || e2.special === 'nova-v'))) {
        newEntities.forEach(e => {
          if (Math.abs(e.q - e1.q) <= 1 || Math.abs(e.r - e1.r) <= 1) explosionIds.add(e.id);
        });
      } else if (e1.special === 'bomb' && e2.special === 'bomb') {
        newEntities.forEach(e => {
          if (Math.abs(e.q - e1.q) <= 3 && Math.abs(e.r - e1.r) <= 3) explosionIds.add(e.id);
        });
      }

      setEntities(newEntities);
      playBombSound();
      await handleMatch(newEntities, undefined, 2, explosionIds);
      return;
    }

    if (e1.special === 'rainbow-core' || e2.special === 'rainbow-core') {
      const rainbow = e1.special === 'rainbow-core' ? e1 : e2;
      const normal = e1.special === 'rainbow-core' ? e2 : e1;
      const targetType = normal.type;
      
      const explosionIds = new Set<string>();
      newEntities.forEach(e => {
        if (e.type === targetType || e.id === rainbow.id) {
          explosionIds.add(e.id);
        }
      });
      
      setEntities(newEntities);
      playBombSound();
      await handleMatch(newEntities, undefined, 1, explosionIds);
      return;
    }

    newEntities[idx1] = { ...e1, q: e2.q, r: e2.r };
    newEntities[idx2] = { ...e2, q: e1.q, r: e1.r };
    
    setEntities(newEntities);
    playSwapSound();
    await new Promise(resolve => setTimeout(resolve, animationDuration * 1000)); 

    const { matches } = findMatches(newEntities, id1);
    if (matches.length === 0) {
      playRejectSound();
      const reverted = [...newEntities];
      reverted[idx1] = { ...newEntities[idx1], q: e1.q, r: e1.r };
      reverted[idx2] = { ...newEntities[idx2], q: e2.q, r: e2.r };
      setEntities(reverted);
      await new Promise(resolve => setTimeout(resolve, animationDuration * 1000));
      setIsProcessing(false);
      return;
    }
    
    await handleMatch(newEntities, id1, 1);
  }, [entities, handleMatch, isProcessing, isWin, isGameOver, isWarping, isReviving, animationDuration]);

  const triggerColorNuke = useCallback(() => {
    if (isProcessing || powerUps.colorNuke <= 0 || isReviving) return;
    playBombSound();
    setIsProcessing(true);
    setPowerUps(prev => ({ ...prev, colorNuke: prev.colorNuke - 1 }));

    const counts: Record<number, number> = {};
    entities.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    const mostFrequentColor = Number(Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0]);

    const matchingIds = entities.filter(e => e.type === mostFrequentColor).map(e => e.id);
    const updated = entities.map(e => matchingIds.includes(e.id) ? { ...e, isMatched: true } : e);
    setEntities(updated);

    setTimeout(() => {
      handleMatch(updated);
    }, 500);
  }, [entities, handleMatch, isProcessing, powerUps.colorNuke, isReviving]);

  const startGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(true);
    setSessionStartTime(Date.now());
    setLevel(1);
    setScore(0);
    setReviveCost(200);
    // Clearing entities triggers the refill effect which calls initBoard
    setEntities([]);
  }, []);

  const quitGame = useCallback(() => {
    playUIClickSound();
    setGameStarted(false);
    setEntities([]);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsWin(false);
    setIsWarping(false);
    setIsReviving(false);
    setReviveCost(200);
    setSessionStartTime(0);
    setPowerUps({ timeDilator: false, novaBlast: false, colorNuke: 0 });
  }, []);

  const revive = useCallback((extraTime: number) => {
    setTimeLeft(extraTime);
    setIsReviving(false);
    setIsGameOver(false);
    setReviveCost(prev => prev * 2);
    playUIClickSound();
  }, []);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, setIsGameOver, isWin, isWarping, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame, quitGame, gameMode, setGameMode,
    isFlashing, isShaking, animationDuration,
    powerUps, setPowerUps, triggerColorNuke,
    isReviving, setIsReviving, revive, reviveCost
  };
}
