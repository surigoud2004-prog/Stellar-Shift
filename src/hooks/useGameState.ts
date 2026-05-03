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
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { 
  playSwapSound, 
  playMatchSound, 
  playSpecialActivationSound, 
  playRejectSound,
  playComboSound,
  playUIClickSound,
  playCosmicBombSound,
  toggleSFX
} from '@/lib/audio-system';
import { Language, LOCALIZATION } from '@/lib/localization';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePlayerProfile } from './usePlayerProfile';

export type GameMode = 'easy' | 'hard' | 'hell';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lore, setLore] = useState<string>("Align the shards to stabilize the sector.");
  const [loreLogs, setLoreLogs] = useState<string[]>(["SYSTEM READY: Neural link established."]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeExplosions, setActiveExplosions] = useState<{q: number, r: number, id: string}[]>([]);
  
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  const lastMatchTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const profile = usePlayerProfile();
  const t = LOCALIZATION[language];

  const targetScore = Math.floor(1000 * calculateDifficulty(level) * (gameMode === 'hard' ? 1.5 : gameMode === 'hell' ? 2 : 1));

  const isInputFrozen = isProcessing || isGameOver || isWin || isLocked || isPaused || isSettingsOpen || profile.showProfile;
  const isTimerFrozen = !gameStarted || isGameOver || isWin || isPaused || isSettingsOpen || profile.showProfile;

  const syncHighScore = useCallback(async () => {
    try {
      const { db, auth } = initializeFirebase();
      if (!auth.currentUser) await signInAnonymously(auth);
      
      const payload = {
        uid: auth.currentUser?.uid || 'anon',
        displayName: profile.profile.name,
        score,
        level,
        timestamp: Date.now()
      };

      addDoc(collection(db, 'leaderboard'), payload)
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: 'leaderboard',
            operation: 'create',
            requestResourceData: payload,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('stellar_best_score', score.toString());
      }
      localStorage.setItem('stellar_level', level.toString());
      
      profile.updateStats(score, 0, isWin);
    } catch (e) {
      // Silence background failures
    }
  }, [score, level, bestScore, profile, isWin]);

  useEffect(() => {
    const { auth } = initializeFirebase();
    if (!auth.currentUser) signInAnonymously(auth).catch(() => {});

    const savedBest = localStorage.getItem('stellar_best_score');
    const savedLevel = localStorage.getItem('stellar_level');
    const savedSound = localStorage.getItem('stellar_sound_on');
    const savedBattery = localStorage.getItem('stellar_battery_saver');
    const savedLang = localStorage.getItem('stellar_language') as Language;

    if (savedBest) setBestScore(parseInt(savedBest));
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedLang) setLanguage(savedLang);
    if (savedBattery === 'true') setIsBatterySaver(true);
    
    if (savedSound !== null) {
      const isSound = savedSound === 'true';
      setSoundOn(isSound);
      toggleSFX(isSound);
    }
  }, []);

  useEffect(() => {
    if (isGameOver || isWin) {
      syncHighScore();
    }
  }, [isGameOver, isWin, syncHighScore]);

  const handleToggleSound = useCallback(() => {
    const newState = !soundOn;
    setSoundOn(newState);
    toggleSFX(newState);
    localStorage.setItem('stellar_sound_on', newState.toString());
  }, [soundOn]);

  const toggleBatterySaver = useCallback(() => {
    const newState = !isBatterySaver;
    setIsBatterySaver(newState);
    localStorage.setItem('stellar_battery_saver', newState.toString());
    playUIClickSound();
  }, [isBatterySaver]);

  const cycleLanguage = useCallback(() => {
    const languages: Language[] = ['en', 'es', 'fr'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    setLanguage(nextLang);
    localStorage.setItem('stellar_language', nextLang);
    playUIClickSound();
  }, [language]);

  const addLoreLog = useCallback((msg: string) => {
    setLore(msg);
    setLoreLogs(prev => [msg, ...prev].slice(0, 30));
  }, []);

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
    setIsPaused(false);
    setIsSettingsOpen(false);
    setScore(0);
    lastMatchTime.current = Date.now();
    setIsLocked(false);
    setIsProcessing(false);
    setTimeLeft(gameMode === 'easy' ? 180 : gameMode === 'hard' ? 90 : 45);
    addLoreLog("SECTOR INITIALIZED");
  }, [level, gameMode, addLoreLog]);

  useEffect(() => {
    if (gameStarted) {
      initBoard();
    }
  }, [initBoard, gameStarted]);

  useEffect(() => {
    if (isTimerFrozen) {
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
  }, [isTimerFrozen, score, targetScore]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMoveId?: string, comboLevel: number = 0) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMoveId);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      lastMatchTime.current = Date.now();
      
      const bombMatches = currentEntities.filter(e => matches.includes(e.id) && e.special === 'bomb');
      let finalMatchedIds = new Set(matches);
      let bombClearedIds = new Set<string>();

      if (bombMatches.length > 0) {
        setEntities(prev => prev.map(e => {
          const isCore = bombMatches.some(b => b.id === e.id);
          return isCore ? { ...e, isExploding: true } : e;
        }));
        playCosmicBombSound();
        await new Promise(resolve => setTimeout(resolve, 100));

        const newExplosions: {q: number, r: number, id: string}[] = [];
        bombMatches.forEach(bomb => {
          newExplosions.push({ q: bomb.q, r: bomb.r, id: `exp-${bomb.id}` });
          currentEntities.forEach(e => {
            if (Math.abs(e.q - bomb.q) <= 1 && Math.abs(e.r - bomb.r) <= 1) {
              if (!finalMatchedIds.has(e.id)) {
                bombClearedIds.add(e.id);
                finalMatchedIds.add(e.id);
              }
            }
          });
        });
        
        setActiveExplosions(newExplosions);
        addLoreLog("SUPERNOVA EVENT");
        
        await new Promise(resolve => setTimeout(resolve, 200));
        setActiveExplosions([]);
      } else {
        if (comboLevel === 0) playMatchSound();
        else playComboSound(comboLevel);
      }

      setEntities(prev => prev.map(e => finalMatchedIds.has(e.id) ? { ...e, isMatched: true } : e));
      await new Promise(resolve => setTimeout(resolve, 200));

      let updated = currentEntities.filter(e => !finalMatchedIds.has(e.id));

      if (specialToSpawn) {
        playSpecialActivationSound();
        updated.push({
          id: specialToSpawn.id,
          type: specialToSpawn.entityType,
          q: specialToSpawn.q,
          r: specialToSpawn.r,
          special: specialToSpawn.type
        });
        generateDynamicLore({ gameEventDescription: `Created a ${specialToSpawn.type}` }).then(loreRes => {
          addLoreLog(loreRes.loreSnippet);
        });
      }

      const regularPoints = matches.length * 20;
      const bombPoints = bombClearedIds.size * 100;
      const matchPoints = (regularPoints + bombPoints) * (comboLevel + 1);
      
      setScore(s => s + matchPoints);
      profile.updateStats(matchPoints, finalMatchedIds.size);

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
      await new Promise(resolve => setTimeout(resolve, 200));
      await handleMatch(newGrid, undefined, comboLevel + 1);
    } else {
      setIsProcessing(false);
    }
  }, [level, addLoreLog, profile]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isInputFrozen) return;
    
    playSwapSound();
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
    
    await handleMatch(newEntities, id1, 0);
  }, [entities, handleMatch, isInputFrozen]);

  const startGame = () => {
    playUIClickSound();
    setGameStarted(true);
  };

  const resetToMainMenu = () => {
    setEntities([]);
    setScore(0);
    setIsGameOver(false);
    setIsWin(false);
    setIsPaused(false);
    setIsProcessing(false);
    setGameStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isLocked, isPaused, setIsPaused, lore, loreLogs, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame,
    gameStarted, startGame, resetToMainMenu,
    isSettingsOpen, setIsSettingsOpen, isInputFrozen,
    soundOn, handleToggleSound, isBatterySaver, toggleBatterySaver,
    language, cycleLanguage, t,
    profile, activeExplosions
  };
}