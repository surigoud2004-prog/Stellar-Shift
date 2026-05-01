
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
  
  const [soundOn, setSoundOn] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  
  const lastMoveTime = useRef(Date.now());
  const lastMatchTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const profile = usePlayerProfile();

  const t = LOCALIZATION[language];

  const targetScore = Math.floor(1000 * calculateDifficulty(level) * (gameMode === 'hard' ? 1.5 : gameMode === 'hell' ? 2 : 1));

  const isInputFrozen = isProcessing || isGameOver || isWin || isLocked || isPaused || isSettingsOpen || profile.showProfile;
  const isTimerFrozen = !gameStarted || isGameOver || isWin || isPaused || isSettingsOpen || profile.showProfile;

  useEffect(() => {
    const savedBest = localStorage.getItem('stellar_best_score');
    const savedLevel = localStorage.getItem('stellar_level');
    const savedSound = localStorage.getItem('stellar_sound_on');
    const savedLang = localStorage.getItem('stellar_language') as Language;

    if (savedBest) setBestScore(parseInt(savedBest));
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedLang) setLanguage(savedLang);
    
    if (savedSound !== null) {
      const isSound = savedSound === 'true';
      setSoundOn(isSound);
      toggleSFX(isSound);
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    const newState = !soundOn;
    setSoundOn(newState);
    toggleSFX(newState);
    localStorage.setItem('stellar_sound_on', newState.toString());
  }, [soundOn]);

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
    setLoreLogs(prev => [msg, ...prev].slice(0, 50));
  }, []);

  const syncHighScore = async () => {
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
      
      // Update persistent player stats
      profile.updateStats(score, 0, true);
    } catch (e) {
      // Auth or general failure
    }
  };

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
    setIsGameOver(false);
    setIsWin(false);
    setIsPaused(false);
    setIsSettingsOpen(false);
    setScore(0);
    lastMatchTime.current = Date.now();
    lastMoveTime.current = Date.now();
    setIsLocked(false);
    setTimeLeft(gameMode === 'easy' ? 180 : gameMode === 'hard' ? 90 : 45);
    addLoreLog("SECTOR INITIALIZED: Awaiting alignment protocol.");
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
  }, [isTimerFrozen, score, targetScore, gameMode]);

  useEffect(() => {
    if (isInputFrozen) return;
    const interval = setInterval(() => {
      if (Date.now() - lastMatchTime.current > 25000) {
        setEntities(prev => {
          const next = [...prev];
          const randIdx = Math.floor(Math.random() * next.length);
          next[randIdx] = { ...next[randIdx], special: 'comet' };
          return next;
        });
        lastMatchTime.current = Date.now();
        addLoreLog("CELESTIAL ANOMALY: A comet shard has appeared.");
        playSpecialActivationSound();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isInputFrozen, addLoreLog]);

  useEffect(() => {
    if (gameStarted && score >= targetScore && !isWin) {
      setIsWin(true);
      syncHighScore();
      setTimeout(() => setLevel(l => l + 1), 3000);
    }
  }, [score, targetScore, isWin, gameStarted]);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[], lastMoveId?: string, comboLevel: number = 0) => {
    const { matches, specialToSpawn } = findMatches(currentEntities, lastMoveId);
    
    if (matches.length > 0) {
      if (comboLevel === 0) playMatchSound();
      else playComboSound(comboLevel);
      
      setIsProcessing(true);
      lastMatchTime.current = Date.now();
      
      setEntities(prev => prev.map(e => matches.includes(e.id) ? { ...e, isMatched: true } : e));
      
      await new Promise(resolve => setTimeout(resolve, 400));

      let matchedSet = new Set(matches);
      let updated = currentEntities.filter(e => !matchedSet.has(e.id));

      if (specialToSpawn) {
        playSpecialActivationSound();
        updated.push({
          id: specialToSpawn.id,
          type: specialToSpawn.entityType,
          q: specialToSpawn.q,
          r: specialToSpawn.r,
          special: specialToSpawn.type
        });
        const loreRes = await generateDynamicLore({ gameEventDescription: `Created a ${specialToSpawn.type}` });
        addLoreLog(loreRes.loreSnippet);
      }

      const matchPoints = matches.length * 20 * (comboLevel + 1);
      setScore(s => s + matchPoints);
      profile.updateStats(matchPoints, matches.length);

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
      await new Promise(resolve => setTimeout(resolve, 400));
      await handleMatch(newGrid, undefined, comboLevel + 1);
    } else {
      setIsProcessing(false);
    }
  }, [level, addLoreLog, profile]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isInputFrozen) return;
    
    playSwapSound();
    lastMoveTime.current = Date.now();
    setIsLocked(false);
    setIsProcessing(true);

    const newEntities = [...entities];
    const idx1 = newEntities.findIndex(e => e.id === id1);
    const idx2 = newEntities.findIndex(e => e.id === id2);

    if (newEntities[idx1].special === 'comet' || newEntities[idx2].special === 'comet') {
      playSpecialActivationSound();
      const comet = newEntities[idx1].special === 'comet' ? newEntities[idx1] : newEntities[idx2];
      const cleared = entities.filter(e => e.id !== comet.id).slice(0, 5).map(e => e.id);
      
      const bonusScore = 500;
      setScore(s => s + bonusScore);
      profile.updateStats(bonusScore, 1);

      const filtered = entities.filter(e => !cleared.includes(e.id) && e.id !== comet.id);
      setEntities(filtered);
      setTimeout(() => handleMatch(filtered, undefined, 0), 200);
      return;
    }

    const q1 = newEntities[idx1].q;
    const r1 = newEntities[idx1].r;
    newEntities[idx1] = { ...newEntities[idx1], q: newEntities[idx2].q, r: newEntities[idx2].r };
    newEntities[idx2] = { ...newEntities[idx2], q: q1, r: r1 };
    setEntities(newEntities);

    await new Promise(resolve => setTimeout(resolve, 400));

    const { matches } = findMatches(newEntities);
    if (matches.length === 0) {
      addLoreLog("ALIGNMENT REJECTED: Resonant frequency mismatch.");
      playRejectSound();
      
      const reverted = [...newEntities];
      reverted[idx1] = { ...reverted[idx1], q: q1, r: r1 };
      reverted[idx2] = { ...reverted[idx2], q: newEntities[idx1].q, r: newEntities[idx1].r };
      setEntities(reverted);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setIsProcessing(false);
      return;
    }
    
    await handleMatch(newEntities, id1, 0);
  }, [entities, handleMatch, isInputFrozen, addLoreLog, profile]);

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
    setIsLocked(false);
    setIsSettingsOpen(false);
    setGameStarted(false);
    setLoreLogs(["SYSTEM READY: Neural link established."]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isLocked, isPaused, setIsPaused, lore, loreLogs, selectedId, setSelectedId,
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame,
    gameStarted, startGame, resetToMainMenu,
    isSettingsOpen, setIsSettingsOpen, isInputFrozen,
    soundOn, handleToggleSound,
    language, cycleLanguage, t,
    profile
  };
}
