
"use client";

import { Board } from '@/components/game/Board';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileDashboard } from '@/components/game/ProfileDashboard';
import { SettingsDrawer } from '@/components/game/SettingsDrawer';
import { ParallaxBackground } from '@/components/game/ParallaxBackground';
import { HallOfFame } from '@/components/game/HallOfFame';
import { MissionLogs } from '@/components/game/MissionLogs';
import { PowerUpShop } from '@/components/game/PowerUpShop';
import { CoinFountain } from '@/components/game/CoinFountain';
import { DevTerminal } from '@/components/game/DevTerminal';
import { GameStateProvider, useGameState } from '@/context/GameStateContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, Trophy, BookOpen, X as XIcon, Eye, EyeOff, Radio, Orbit, Coins, ShieldAlert, Play, Loader2, Terminal } from 'lucide-react';
import { getSectorInfo } from '@/lib/game-utils';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';
import { logAnalyticsEvent } from '@/firebase';

function MissionContent() {
  const { 
    profile, showProfile, setShowProfile, setAvatar, setName, getRank, updateStats, addCoins, spendCoins, resetProfile
  } = usePlayerProfile();
  
  const { 
    gameMode, setGameMode, gameStarted, quitGame, score, targetScore, timeLeft, startGame, level, isWin, isWarping,
    powerUps, setPowerUps, isGameOver, setIsGameOver, isReviving, setIsReviving, revive, reviveCost, initBoard
  } = useGameState();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [showFame, setShowFame] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [showCoins, setShowCoins] = useState(false);
  const [reviveCountdown, setReviveCountdown] = useState(5);
  const [isAdReviving, setIsAdReviving] = useState(false);
  
  const [lastProcessedLevel, setLastProcessedLevel] = useState(0);

  const labels = LOCALIZATION[language];
  const sector = useMemo(() => getSectorInfo(level), [level]);

  // Combined HUD visibility check
  const isHudHidden = !uiVisible || showShop || showFame || showLogs || showProfile || showTerminal;

  useEffect(() => {
    if (isWin && level > lastProcessedLevel) {
      const coinsWon = Math.floor(100 + (timeLeft * 5));
      updateStats(score, 0, true, coinsWon, level + 1);
      setLastProcessedLevel(level);
      setShowCoins(true);
      
      setTimeout(() => {
        setShowShop(true);
        setShowCoins(false);
      }, 2500);
    }
  }, [isWin, score, updateStats, level, lastProcessedLevel, timeLeft]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReviving && !isAdReviving) {
      setReviveCountdown(5);
      timer = setInterval(() => {
        setReviveCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsReviving(false);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isReviving, isAdReviving, setIsReviving, setIsGameOver]);

  const handleAbort = () => {
    quitGame();
    setAbortDialogOpen(false);
    setSettingsOpen(false);
    setLastProcessedLevel(0);
  };

  const handleBuyPowerUp = (type: 'time' | 'nova' | 'nuke') => {
    const costs = { time: 200, nova: 500, nuke: 800 };
    if (spendCoins(costs[type])) {
      if (type === 'time') setPowerUps(p => ({ ...p, timeDilator: true }));
      if (type === 'nova') setPowerUps(p => ({ ...p, novaBlast: true }));
      if (type === 'nuke') setPowerUps(p => ({ ...p, colorNuke: p.colorNuke + 1 }));
    }
  };

  const handleStartMission = () => {
    setShowShop(true);
    logAnalyticsEvent('open_shop');
  };

  const handleRecoverLink = () => {
    if (profile.coins >= reviveCost) {
      if (spendCoins(reviveCost)) {
        revive(20);
      }
    }
  };

  const handleReviveWithAd = () => {
    setIsAdReviving(true);
    logAnalyticsEvent('revive_ad_started');
    setTimeout(() => {
      revive(20);
      setIsAdReviving(false);
      logAnalyticsEvent('revive_ad_completed');
    }, 5000);
  };

  const handleFailAbort = () => {
    setIsReviving(false);
    setIsGameOver(true);
    playUIClickSound();
  };

  const onConfirmLoadout = useCallback(() => {
    setShowShop(false);
    if (!gameStarted) {
      startGame(profile.currentLevel || 1);
    } else {
      initBoard();
    }
  }, [gameStarted, startGame, initBoard, profile.currentLevel]);

  const handleAwardShareCoins = () => {
    updateStats(0, 0, false, 50);
    setShowCoins(true);
    setTimeout(() => setShowCoins(false), 2000);
    logAnalyticsEvent('score_shared');
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-hidden">
      
      <ParallaxBackground disabled={isBatterySaver} isWarping={isWarping} level={level} />
      
      {/* GLOBAL HUD - PINNED AT TOP-MOST LAYER Z-10010 */}
      <div id="Global_HUD" className="fixed inset-x-0 top-0 pointer-events-none z-[10010] h-40">
        
        {/* TOP-LEFT: ABORT MISSION (X) & WALLET */}
        <div className="absolute top-[20px] left-[30px] flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setAbortDialogOpen(true)}
            className="w-[50px] h-[50px] rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.7)] hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
            title={labels.abortMission}
          >
            <XIcon className="w-7 h-7 text-white stroke-[4px]" />
          </button>
          
          <div className={cn(
            "flex items-center gap-3 bg-black/70 px-5 py-2.5 rounded-2xl border-2 border-yellow-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(234,179,8,0.2)] transition-all",
            isHudHidden && "opacity-0"
          )}>
            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.6)] border-2 border-yellow-200">
               <Coins className="w-4 h-4 text-black stroke-[3px]" />
            </div>
            <span className="text-white font-black text-lg tracking-widest">
              {Math.floor(profile.coins || 0).toLocaleString()}
            </span>
          </div>

          <button 
            onClick={() => setUiVisible(!uiVisible)}
            className={cn(
              "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/60 backdrop-blur-md",
              (showShop || showFame || showLogs || showProfile || showTerminal) && "opacity-0 pointer-events-none"
            )}
            title="Cloak UI"
          >
            {uiVisible ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white/40" />}
          </button>
        </div>

        {/* TOP-CENTER: MISSION STATUS & TELEMETRY */}
        <div className={cn(
          "absolute top-[10px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-auto transition-all duration-500 w-full max-w-md",
          isHudHidden && "opacity-0 translate-y-[-100px]"
        )}>
          <div className="flex items-center gap-3 mb-2">
             <div className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] font-black uppercase tracking-[0.2em] text-xs md:text-lg bg-black/70 px-6 py-2 rounded-2xl border-2 border-primary/40 backdrop-blur-xl min-w-[240px] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              {labels.score}: <span className="text-primary">{Math.floor(score).toLocaleString()} / {targetScore.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-primary/30 border border-primary/50 rounded-xl px-3 py-1 flex items-center gap-2 backdrop-blur-md shadow-lg">
                <Radio className={cn("w-3 h-3 text-primary", (isWarping || gameStarted) ? "animate-pulse" : "")} />
                <span className="text-white font-black uppercase text-[10px] tracking-widest">LVL {level}</span>
              </div>
            </div>
          </div>

          <h1 className="font-headline text-lg md:text-xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] mb-1 mt-10">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          
          <div className={cn(
            "text-white font-mono text-[10px] uppercase tracking-[0.2em] bg-black/60 px-4 py-1 rounded-full border border-white/20 backdrop-blur-md transition-all shadow-xl",
            timeLeft < 10 && "text-red-500 animate-pulse border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]",
            (isWarping || showShop || showFame) && "opacity-0 scale-50"
          )}>
            {labels.time}: <span className={timeLeft < 10 ? "font-black" : ""}>{timeLeft}s</span>
          </div>
        </div>

        {/* TOP-RIGHT: ARCHIVE & SETTINGS */}
        <div className="absolute top-[20px] right-[30px] flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowTerminal(true)}
            className={cn(
              "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/60 backdrop-blur-md",
              (showShop || showFame) && "opacity-0 pointer-events-none"
            )}
            title="Dev Terminal"
          >
            <Terminal className="w-5 h-5 text-green-400" />
          </button>

          <button 
            onClick={() => setShowLogs(true)}
            className={cn(
              "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/60 backdrop-blur-md",
              (showShop || showFame) && "opacity-0 pointer-events-none"
            )}
            title={labels.archive}
          >
            <BookOpen className="w-5 h-5 text-secondary" />
          </button>

          <button 
            onClick={() => setShowProfile(true)}
            className={cn(
              "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/60 backdrop-blur-md",
              (showShop || showFame) && "opacity-0 pointer-events-none"
            )}
            title={labels.profile}
          >
            <User className="w-5 h-5 text-primary" />
          </button>

          <SettingsDrawer 
            isOpen={settingsOpen}
            onToggle={setSettingsOpen}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn(!soundOn)}
            isBatterySaver={isBatterySaver}
            onToggleBattery={() => setIsBatterySaver(!isBatterySaver)}
            language={language}
            onCycleLanguage={() => {
              const langs: ('en' | 'es' | 'fr')[] = ['en', 'es', 'fr'];
              setLanguage(langs[(langs.indexOf(language) + 1) % langs.length]);
            }}
            gameMode={gameMode}
            onSetGameMode={setGameMode}
            onShowFame={() => {
              setShowFame(true);
              logAnalyticsEvent('view_leaderboard');
            }}
            onAbort={handleAbort}
            onResetProgress={resetProfile}
            gameStarted={gameStarted}
            labels={labels}
          />
        </div>
      </div>

      <CoinFountain isActive={showCoins} />

      <div className={cn(
        "relative flex-1 w-full flex flex-col items-center justify-center z-10 pt-48 pb-20 transition-all duration-700",
        (showShop || showFame) && "blur-xl opacity-20 scale-95"
      )}>
        {!gameStarted ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-700">
             <button 
                onClick={handleStartMission}
                className="group relative px-20 py-10 bg-primary rounded-[2.5rem] text-3xl font-black uppercase tracking-[0.4em] text-white shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
             >
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all" />
                Start Mission
             </button>
             <p className="mt-10 text-sm text-primary font-black uppercase tracking-[0.6em] animate-pulse">
               Initialize Neural Link (Sector {profile.currentLevel || 1})
             </p>
          </div>
        ) : (
          <Board onShowShop={() => setShowShop(true)} />
        )}
      </div>

      {isReviving && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-black/80 border-2 border-primary/50 rounded-[3rem] p-10 backdrop-blur-xl shadow-[0_0_100px_rgba(168,85,247,0.4)] flex flex-col items-center text-center">
            <ShieldAlert className="w-20 h-20 text-primary mb-6 animate-pulse" />
            <h2 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter mb-2">Mission Critical</h2>
            <p className="text-muted-foreground uppercase text-xs tracking-widest font-black mb-8">
              {isAdReviving ? "Syncing Neural Stream..." : `Neural Link Severing in ${reviveCountdown}s`}
            </p>
            
            <div className="w-full flex flex-col gap-4">
               <button 
                 onClick={handleRecoverLink}
                 disabled={profile.coins < reviveCost || isAdReviving}
                 className={cn(
                   "w-full h-16 rounded-2xl flex items-center justify-between px-8 font-black uppercase tracking-widest transition-all",
                   (profile.coins >= reviveCost && !isAdReviving)
                    ? "bg-primary text-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.5)]" 
                    : "bg-white/5 text-white/20 cursor-not-allowed grayscale"
                 )}
               >
                 <span className="flex items-center gap-2">
                   Recover Link <span className="text-xs opacity-60 text-black font-black bg-white/40 px-2 py-0.5 rounded-md">+20s</span>
                 </span>
                 <div className="flex items-center gap-2">
                    <Coins className={cn("w-4 h-4", reviveCost > 200 && "text-red-500 animate-pulse")} />
                    {reviveCost}
                 </div>
               </button>

               <button 
                 onClick={handleReviveWithAd}
                 disabled={isAdReviving}
                 className={cn(
                   "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all bg-secondary text-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(30,58,138,0.5)]",
                   isAdReviving && "opacity-50 grayscale"
                 )}
               >
                 {isAdReviving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                 Watch Ad to Revive
               </button>

               <button 
                 onClick={handleFailAbort}
                 disabled={isAdReviving}
                 className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 font-black uppercase tracking-widest transition-all"
               >
                 Abort Mission
               </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-red-600/50 bg-black/95 text-white z-[10000] p-10 rounded-[3rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-3xl uppercase italic font-black text-red-500 mb-4">
              {labels.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground uppercase text-xs tracking-[0.2em] font-black leading-relaxed">
              {labels.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl h-14 uppercase font-black text-xs tracking-widest px-8">
              {labels.no}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbort}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 uppercase font-black text-xs tracking-widest px-8 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            >
              {labels.yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProfileDashboard 
        profile={profile}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpdateName={setName}
        onUpdateAvatar={setAvatar}
        getRankLabel={getRank}
        labels={labels}
      />

      <MissionLogs 
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        labels={labels}
      />

      <PowerUpShop 
        coins={profile.coins || 0}
        powerUps={powerUps}
        onBuy={handleBuyPowerUp}
        onAddCoins={addCoins}
        isOpen={showShop}
        onClose={onConfirmLoadout}
        labels={labels}
      />

      <DevTerminal 
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
        repoUrl="https://github.com/surigoud2004-prog/Stellar-Shift.git"
      />

      {showFame && (
        <div className="fixed inset-0 z-[100020] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[60px] animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-2xl h-[85vh] relative">
            <button 
              onClick={() => setShowFame(false)}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center z-[100021] border-2 border-white/20 shadow-xl hover:scale-110 active:scale-90 transition-all"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <HallOfFame 
              title={labels.hallOfFame} 
              subtitle={labels.sector + " 7G-Alpha"} 
              onAwardShare={handleAwardShareCoins}
            />
          </div>
        </div>
      )}

      <footer className={cn(
        "fixed bottom-0 w-full p-6 text-center z-10 opacity-20 pointer-events-none transition-opacity",
        (showShop || showFame) && "opacity-0"
      )}>
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-white uppercase tracking-[0.5em] font-bold">
            Neural Link V2.0 • Sector Clearance Confirmed
          </div>
          <div className="pointer-events-auto">
            <Link href="/privacy" className="text-[8px] text-white/40 hover:text-primary uppercase tracking-widest transition-colors">
              Privacy Protocol
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <GameStateProvider>
      <MissionContent />
    </GameStateProvider>
  );
}
