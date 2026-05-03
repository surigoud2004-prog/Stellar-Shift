
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  generateMatchFreeGrid,
  findMatches, 
  GRID_COLS,
  GRID_ROWS,
  SpecialType,
  EntityType
} from '@/lib/game-utils';
import { 
  playSwapSound, 
  playMatchSound, 
  playRejectSound, 
  playBombSound, 
  playUIClickSound,
  playVictoryFanfare,
  playWarpSound
} from '@/lib/audio-system';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore, logAnalyticsEvent } from '@/firebase';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export type GameMode = 'easy' | 'hard' | 'hell';

export interface PowerUpState {
  timeDilator: boolean;
  novaBlast: boolean;
  colorNuke: number;
}

export interface LaserEffect {
  id: string;
  type: 'h' | 'v';
  pos: number;
}

export function useGameState() {
  const db = useFirestore();
  const auth = useAuth();
  
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
  const [isReviving, setIsReviving] = useState(false);
  const [reviveCost, setReviveCost] = useState(200);
  const [firstMatchMade, setFirstMatchMade] = useState(false);
  const [lasers, setLasers] = useState<LaserEffect[]>([]);

  const [powerUps, setPowerUps] = useState<PowerUpState>({
    timeDilator: false,
    novaBlast: false,
    colorNuke: 0
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetScore = useMemo(() => level * 1500, [level]);
  
  const levelTimeLimit = useMemo(() => {
    const base = Math.max(30, 60 - (level - 1) * 2);
    return powerUps.timeDilator ? base + 15 : base;
  }, [level, powerUps.timeDilator]);
  
  const animationDuration = useMemo(() => 0.3 * Math.pow(0.95, level - 1), [level]);

  const getVariety = useCallback(() => {
    if (level <= 5) return 4;
    return 6;
  }, [level]);

  const archiveLore = useCallback(async (event: string, context?: string) => {
    if (!db || !auth?.currentUser) return;
    try {
      const lore = await generateDynamicLore({ gameEventDescription: event, gameContext: context });
      const logRef = doc(collection(db, 'users', auth.currentUser.uid, 'logs'));
      setDoc(logRef, {
        id: logRef.id,
        event,
        snippet: lore.loreSnippet,
        timestamp: Date.now()
      });
    } catch (e) {}
  }, [db, auth]);

  const submitHighScore = useCallback(async (finalScore: number, finalLevel: number) => {
    if (!db || !auth?.currentUser) return;
    try {
      const scoreId = `${auth.currentUser.uid}_${Date.now()}`;
      const scoreRef = doc(db, 'leaderboard', scoreId);
      setDoc(scoreRef, {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Pilot',
        score: Math.floor(finalScore),
        level: finalLevel,
        timestamp: Date.now()
      });
      logAnalyticsEvent('high_score_submitted', { score: finalScore, level: finalLevel });
    } catch (e) {}
  }, [db, auth]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMovedId?: string, comboFactor: number = 1, forceExplosionIds?: Set<string>, silent: boolean = false) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMovedId);
    
    const idsToProcess = new Set<string>([...matches, ...(forceExplosionIds || [])]);
    if (idsToProcess.size === 0) {
      if (!silent) setIsProcessing(false);
      return;
    }

    const allToDestroy = new Set<string>();
    const activatedSpecialIds = new Set<string>();
    const currentLasers: LaserEffect[] = [];
    
    let triggeredFlash = false;
    let triggeredShake = false;
    let chainMultiplier = 1;

    const queue = Array.from(idsToProcess);
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (allToDestroy.has(id)) continue;
      
      const ent = currentEntities.find(e => e.id === id);
      if (!ent) continue;

      allToDestroy.add(id);

      if (ent.special && !activatedSpecialIds.has(id)) {
        activatedSpecialIds.add(id);
        chainMultiplier *= 1.25;

        if (ent.special === 'bomb') {
          triggeredFlash = true;
          triggeredShake = true;
          currentEntities.forEach(e => {
            if (Math.abs(e.q - ent.q) <= 1 && Math.abs(e.r - ent.r) <= 1) {
              if (!allToDestroy.has(e.id)) queue.push(e.id);
            }
          });
        } else if (ent.special === 'nova-h') {
          currentLasers.push({ id: `laser-${ent.id}-${Date.now()}`, type: 'h', pos: ent.r });
          currentEntities.forEach(e => {
            if (e.r === ent.r) {
              if (!allToDestroy.has(e.id)) queue.push(e.id);
            }
          });
        } else if (ent.special === 'nova-v') {
          currentLasers.push({ id: `laser-${ent.id}-${Date.now()}`, type: 'v', pos: ent.q });
          currentEntities.forEach(e => {
            if (e.q === ent.q) {
              if (!allToDestroy.has(e.id)) queue.push(e.id);
            }
          });
        } else if (ent.special === 'rainbow-core') {
          triggeredFlash = true;
          triggeredShake = true;
        }
      }
    }

    if (allToDestroy.size > 0) {
      if (!silent) {
        setIsProcessing(true);
        playMatchSound();
        setFirstMatchMade(true);
        if (currentLasers.length > 0) setLasers(currentLasers);
      }
      
      setEntities(prev => prev.map(e => allToDestroy.has(e.id) ? { ...e, isMatched: true } : e));
      
      if (!silent) {
        if (triggeredFlash) {
          setIsFlashing(true);
          playBombSound();
          setTimeout(() => setIsFlashing(false), 400);
        }
        if (triggeredShake) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        }
        if (currentLasers.length > 0) {
          setTimeout(() => setLasers([]), 600);
        }
      }

      await new Promise(resolve => setTimeout(resolve, animationDuration * 1000 * 1.3));

      if (!silent) {
        const points = Math.floor(allToDestroy.size * 10 * comboFactor * chainMultiplier);
        setScore(s => {
          const newScore = Math.floor(s + points);
          if (newScore >= targetScore && !isWin && !isWarping) {
            setIsWin(true);
            playVictoryFanfare(level);
            archiveLore("Sector Secured", `Level ${level} targets reached.`);
            submitHighScore(newScore, level);
            logAnalyticsEvent('level_up', { level: level + 1, score: newScore });
          }
          return newScore;
        });
      }

      const variety = getVariety();
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
      await handleMatch(newGrid, undefined, comboFactor * 1.5, undefined, silent);
    } else {
      if (!silent) setIsProcessing(false);
    }
  }, [targetScore, getVariety, isWin, isWarping, level, archiveLore, submitHighScore, animationDuration]);

  const initBoard = useCallback(async () => {
    const variety = getVariety();
    setIsProcessing(true);
    setScore(0);
    setFirstMatchMade(false);
    
    const initial = generateMatchFreeGrid(variety);

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
    setIsFlashing(false);
    setIsShaking(false);
    setIsReviving(false);
    setReviveCost(200);

    await handleMatch(initial, undefined, 1, undefined, true);
    setIsProcessing(false);
  }, [getVariety, levelTimeLimit, powerUps.novaBlast, handleMatch]);

  useEffect(() => {
    if (isWin) {
      const warpStartTimeout = setTimeout(() => {
        setIsWarping(true);
        setEntities([]);
        setScore(0); 
        playWarpSound();
        
        const nextLevelTimeout = setTimeout(() => {
          setLevel(prev => prev + 1);
          setIsWin(false);
          setIsWarping(false);
          setPowerUps(prev => ({ ...prev, timeDilator: false, novaBlast: false }));
          setReviveCost(200);
        }, 2500);
        
        return () => clearTimeout(nextLevelTimeout);
      }, 1000);
      
      return () => clearTimeout(warpStartTimeout);
    }
  }, [isWin]);

  useEffect(() => {
    if (gameStarted && !isWin && !isGameOver && !isWarping && !isReviving) {
      if (entities.length === 0) {
        initBoard();
      }
    }
  }, [gameStarted, initBoard, isWin, isGameOver, entities.length, isReviving, isWarping]);

  useEffect(() => {
    if (!gameStarted || isGameOver || isWin || isWarping || isReviving || entities.length === 0 || !firstMatchMade) {
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
  }, [gameStarted, isGameOver, isWin, isWarping, isReviving, entities.length, firstMatchMade]);

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
    
    newEntities[idx1] = { ...e1, q: e2.q, r: e2.r };
    newEntities[idx2] = { ...e2, q: e1.q, r: e1.r };
    
    setEntities(newEntities);
    playSwapSound();
    await new Promise(resolve => setTimeout(resolve, animationDuration * 1000)); 

    const { matches } = findMatches(newEntities, id1);
    
    if (e1.special && e2.special) {
      await handleMatch(newEntities, id1, 1, new Set([id1, id2]));
      return;
    }

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
      handleMatch(updated, undefined, 1, new Set(matchingIds));
    }, 500);
  }, [entities, handleMatch, isProcessing, powerUps.colorNuke, isReviving]);

  const startGame = useCallback((initialLevel: number = 1) => {
    playUIClickSound();
    setGameStarted(true);
    setLevel(initialLevel);
    setScore(0);
    setReviveCost(200);
    setFirstMatchMade(false);
    setEntities([]); 
    logAnalyticsEvent('mission_start', { level: initialLevel });
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
    setFirstMatchMade(false);
    setPowerUps({ timeDilator: false, novaBlast: false, colorNuke: 0 });
    logAnalyticsEvent('mission_quit');
  }, []);

  const revive = useCallback((extraTime: number) => {
    setTimeLeft(extraTime);
    setIsReviving(false);
    setIsGameOver(false);
    setReviveCost(prev => prev * 2); 
    playUIClickSound();
    logAnalyticsEvent('mission_revive', { cost: reviveCost });
  }, [reviveCost]);

  return {
    entities, score, targetScore, timeLeft, level,
    isGameOver, setIsGameOver, isWin, isWarping, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame, quitGame, gameMode, setGameMode,
    isFlashing, isShaking, animationDuration,
    powerUps, setPowerUps, triggerColorNuke,
    isReviving, setIsReviving, revive, reviveCost, lasers
  };
}
