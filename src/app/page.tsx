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
import { GameStateProvider, useGameState } from '@/context/GameStateContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, Trophy, BookOpen, X as XIcon, Eye, EyeOff, Radio, Orbit, Coins, ShieldAlert, Play, Loader2 } from 'lucide-react';
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
  const isHudHidden = !uiVisible || showShop || showFame || showLogs || showProfile;

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
      
      {/* GLOBAL HUD - ADAPTIVE FOR ALL DEVICES */}
      <div id="Global_HUD" className="fixed inset-x-0 top-0 pointer-events-none z-[10010] p-4 md:p-8">
        
        {/* TOP HUD BAR */}
        <div className="flex items-start justify-between w-full max-w-7xl mx-auto pointer-events-auto">
          
          {/* TOP-LEFT: ABORT & WALLET */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setAbortDialogOpen(true)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
              title={labels.abortMission}
            >
              <XIcon className="w-5 h-5 md:w-6 md:h-6 text-white stroke-[4px]" />
            </button>
            
            <div className={cn(
              "hidden sm:flex items-center gap-3 bg-black/70 px-4 py-2 rounded-2xl border-2 border-yellow-500/40 backdrop-blur-xl transition-all",
              isHudHidden && "opacity-0"
            )}>
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-black text-sm md:text-base">
                {Math.floor(profile.coins || 0).toLocaleString()}
              </span>
            </div>

            <button 
              onClick={() => setUiVisible(!uiVisible)}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/60",
                (showShop || showFame || showLogs || showProfile) && "opacity-0 pointer-events-none"
              )}
            >
              {uiVisible ? <Eye className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-white/40" />}
            </button>
          </div>

          {/* TOP-CENTER: STATUS (COMPACT ON MOBILE) */}
          <div className={cn(
            "flex flex-col items-center transition-all duration-500",
            isHudHidden && "opacity-0 -translate-y-full"
          )}>
            <div className="bg-black/70 px-4 py-1.5 md:px-6 md:py-2 rounded-xl md:rounded-2xl border border-primary/40 backdrop-blur-xl shadow-xl flex flex-col items-center gap-1">
              <span className="text-primary font-black text-[10px] md:text-sm uppercase tracking-widest leading-none">
                {labels.score}: {Math.floor(score).toLocaleString()}
              </span>
              <div className="h-0.5 w-full bg-primary/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className={cn(
              "mt-2 text-white font-mono text-[9px] md:text-[10px] uppercase tracking-widest bg-black/60 px-3 py-0.5 md:px-4 md:py-1 rounded-full border border-white/10",
              timeLeft < 10 && "text-red-500 animate-pulse border-red-500"
            )}>
              {labels.time}: {timeLeft}s
            </div>
          </div>

          {/* TOP-RIGHT: ACTIONS & SETTINGS */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setShowLogs(true)}
              className={cn(
                "hidden md:flex w-12 h-12 rounded-full glass-panel items-center justify-center border-white/20",
                (showShop || showFame) && "opacity-0 pointer-events-none"
              )}
            >
              <BookOpen className="w-5 h-5 text-secondary" />
            </button>

            <button 
              onClick={() => setShowProfile(true)}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center border-white/20 bg-black/60",
                (showShop || showFame) && "opacity-0 pointer-events-none"
              )}
            >
              <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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
              onShowFame={() => setShowFame(true)}
              onAbort={handleAbort}
              onResetProgress={resetProfile}
              gameStarted={gameStarted}
              labels={labels}
            />
          </div>
        </div>
      </div>

      <CoinFountain isActive={showCoins} />

      <div className={cn(
        "relative flex-1 w-full flex flex-col items-center justify-center z-10 transition-all duration-700 p-4",
        (showShop || showFame) && "blur-xl opacity-20 scale-95"
      )}>
        {!gameStarted ? (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-700 px-6">
             <div className="mb-12">
               <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]">
                 Stellar <span className="text-primary">Shift</span>
               </h1>
               <p className="text-[10px] md:text-xs text-primary/60 font-black uppercase tracking-[0.5em] mt-2">
                 Neural Link Established • Sector {profile.currentLevel || 1}
               </p>
             </div>

             <button 
                onClick={handleStartMission}
                className="group relative px-12 py-6 md:px-20 md:py-10 bg-primary rounded-[2rem] md:rounded-[2.5rem] text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-white shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-110 active:scale-95 transition-all border-4 border-white/20 overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                Start Mission
             </button>
          </div>
        ) : (
          <Board onShowShop={() => setShowShop(true)} />
        )}
      </div>

      {/* MOBILE COIN DISPLAY (STICKY BOTTOM) */}
      {!gameStarted && (
        <div className="sm:hidden fixed bottom-12 bg-black/70 px-6 py-2 rounded-2xl border border-yellow-500/40 backdrop-blur-xl flex items-center gap-3 z-[100]">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-black">{Math.floor(profile.coins || 0).toLocaleString()}</span>
        </div>
      )}

      {isReviving && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm md:max-w-md bg-black/90 border-2 border-primary/50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <ShieldAlert className="w-16 h-16 text-primary mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-headline font-black text-white uppercase italic tracking-tighter mb-2">Mission Critical</h2>
            <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-black mb-8">
              {isAdReviving ? "Syncing..." : `Link Severing in ${reviveCountdown}s`}
            </p>
            
            <div className="w-full flex flex-col gap-3">
               <button 
                 onClick={handleRecoverLink}
                 disabled={profile.coins < reviveCost || isAdReviving}
                 className={cn(
                   "w-full h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-between px-6 md:px-8 font-black uppercase tracking-widest transition-all text-xs md:text-sm",
                   (profile.coins >= reviveCost && !isAdReviving)
                    ? "bg-primary text-white hover:scale-105 active:scale-95" 
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                 )}
               >
                 <span>Recover Link</span>
                 <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    {reviveCost}
                 </div>
               </button>

               <button 
                 onClick={handleReviveWithAd}
                 disabled={isAdReviving}
                 className={cn(
                   "w-full h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all bg-secondary text-white text-xs md:text-sm",
                   isAdReviving && "opacity-50"
                 )}
               >
                 {isAdReviving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                 Watch Ad to Revive
               </button>

               <button 
                 onClick={handleFailAbort}
                 className="w-full h-12 md:h-14 rounded-xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px]"
               >
                 Abort Mission
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT DIALOG (MOBILE OPTIMIZED) */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-red-600/50 bg-black/95 text-white z-[10000] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] max-w-[90vw] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl md:text-3xl uppercase italic font-black text-red-500 mb-2 md:mb-4">
              {labels.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground uppercase text-[10px] tracking-widest font-black leading-relaxed">
              {labels.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 md:mt-10 gap-3">
            <AlertDialogCancel className="bg-white/5 border-white/20 text-white rounded-xl h-12 md:h-14 uppercase font-black text-[10px] tracking-widest px-6 md:px-8">
              {labels.no}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbort}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 md:h-14 uppercase font-black text-[10px] tracking-widest px-6 md:px-8 shadow-lg"
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

      {showFame && (
        <div className="fixed inset-0 z-[100020] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-2xl h-[90vh] md:h-[85vh] relative">
            <button 
              onClick={() => setShowFame(false)}
              className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white flex items-center justify-center z-[100021] border-2 border-white/20 shadow-xl"
            >
              <XIcon className="w-5 h-5 md:w-6 md:h-6" />
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
        "fixed bottom-0 w-full p-4 md:p-6 text-center z-10 opacity-20 pointer-events-none transition-opacity",
        (showShop || showFame) && "opacity-0"
      )}>
        <div className="flex flex-col items-center gap-1 md:gap-2">
          <div className="text-[8px] md:text-[10px] text-white uppercase tracking-[0.4em] font-bold">
            Neural Link V2.0 • Command Verified
          </div>
          <div className="pointer-events-auto">
            <Link href="/privacy" className="text-[7px] md:text-[8px] text-white/40 hover:text-primary uppercase tracking-widest transition-colors">
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