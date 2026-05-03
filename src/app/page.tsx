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
import { useState, useEffect, useMemo } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, Trophy, BookOpen, X as XIcon, Eye, EyeOff, Radio, Orbit, Coins } from 'lucide-react';
import { getSectorInfo } from '@/lib/game-utils';
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

function MissionContent() {
  const { 
    profile, showProfile, setShowProfile, setAvatar, setName, getRank, updateStats, spendCoins
  } = usePlayerProfile();
  
  const { 
    gameMode, setGameMode, gameStarted, quitGame, score, targetScore, timeLeft, startGame, level, isWin, isWarping,
    powerUps, setPowerUps
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
  
  // Guard to prevent multiple reward processing for the same win event
  const [lastProcessedLevel, setLastProcessedLevel] = useState(0);

  const labels = LOCALIZATION[language];
  const sector = useMemo(() => getSectorInfo(level), [level]);

  // Update profile stats when a win occurs
  useEffect(() => {
    if (isWin && level > lastProcessedLevel) {
      const coinsWon = 100 + (timeLeft * 5);
      updateStats(score, 0, true, coinsWon);
      setLastProcessedLevel(level);
      setShowCoins(true);
      
      // Automatically show shop for next level
      setTimeout(() => {
        setShowShop(true);
        setShowCoins(false);
      }, 2500);
    }
  }, [isWin, score, updateStats, level, lastProcessedLevel, timeLeft]);

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
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-hidden">
      
      {/* LAYER 1: COSMIC BACKGROUND */}
      <ParallaxBackground disabled={isBatterySaver} isWarping={isWarping} level={level} />
      
      {/* LAYER 2: GLOBAL HUD (TOP LAYER - Z:9999) */}
      <div id="Global_HUD" className="fixed inset-0 pointer-events-none z-[9999]">
        
        {/* TOP-LEFT ANCHOR: COMMAND CLUSTER */}
        <div className="absolute top-[30px] left-[30px] flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => setAbortDialogOpen(true)}
            className="w-[50px] h-[50px] rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-90 transition-all border-none"
            title={labels.abortMission}
          >
            <XIcon className="w-6 h-6 text-white stroke-[3px]" />
          </button>
          
          <button 
            onClick={() => setUiVisible(!uiVisible)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/40 backdrop-blur-md"
            title="Cloak UI"
          >
            {uiVisible ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white/40" />}
          </button>
        </div>

        {/* TOP-CENTER ANCHOR: MISSION STATUS */}
        <div className={cn(
          "absolute top-[30px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-auto transition-all duration-500",
          !uiVisible && "opacity-0",
          isWarping && "scale-110 brightness-150"
        )}>
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
               <div className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] font-black uppercase tracking-[0.2em] text-sm md:text-lg bg-black/40 px-6 py-2 rounded-xl border border-primary/20 backdrop-blur-md min-w-[200px]">
                {labels.score}: {score.toLocaleString()} / {targetScore.toLocaleString()}
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-primary/20 border border-primary/40 rounded-xl px-4 py-1.5 flex items-center gap-2 backdrop-blur-md">
                  <Radio className={cn("w-3.5 h-3.5 text-primary", isWarping ? "animate-ping" : "animate-pulse")} />
                  <span className="text-white font-black uppercase text-xs tracking-widest">LVL {level}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 flex items-center justify-center gap-1.5 backdrop-blur-md">
                   <Orbit className="w-2.5 h-2.5 text-secondary" />
                   <span className="text-[8px] text-white font-bold uppercase tracking-widest whitespace-nowrap">
                     {sector.name}
                   </span>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "text-white/80 font-mono text-xs uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md transition-all",
              timeLeft < 10 && "text-red-400 animate-pulse border-red-500/50",
              isWarping && "opacity-0 scale-50"
            )}>
              {labels.time}: {timeLeft}s
            </div>
          </div>
        </div>

        {/* TOP-RIGHT ANCHOR: COMMAND CLUSTER */}
        <div className="absolute top-[30px] right-[30px] flex items-center gap-4 pointer-events-auto">
          {/* COIN HUD */}
          <div className={cn(
            "flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-yellow-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all",
            !uiVisible && "opacity-0"
          )}>
            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]">
               <Coins className="w-3 h-3 text-black stroke-[3px]" />
            </div>
            <span className="text-white font-black text-sm tracking-widest">
              {(profile.coins || 0).toLocaleString()}
            </span>
          </div>

          <button 
            onClick={() => setShowLogs(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/40 backdrop-blur-md"
            title={labels.archive}
          >
            <BookOpen className="w-5 h-5 text-secondary" />
          </button>

          <button 
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-white/20 hover:border-primary transition-all bg-black/40 backdrop-blur-md"
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
            onShowFame={() => setShowFame(true)}
            onAbort={handleAbort}
            gameStarted={gameStarted}
            labels={labels}
          />
        </div>
      </div>

      <CoinFountain isActive={showCoins} />

      {/* LAYER 3: GAME BOARD (CENTER LAYER) */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center z-10 pt-48 pb-20">
        {!gameStarted ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-700">
             <button 
                onClick={handleStartMission}
                className="group relative px-16 py-8 bg-primary rounded-full text-2xl font-black uppercase tracking-[0.3em] text-white shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-110 active:scale-95 transition-all"
             >
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                Start Mission
             </button>
             <p className="mt-8 text-[10px] text-primary font-bold uppercase tracking-[0.5em] animate-pulse">
               Initialize Neural Link
             </p>
          </div>
        ) : (
          <Board />
        )}
      </div>

      {/* LAYER 4: CONFIRMATION PROTOCOLS */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-red-500/30 bg-black/95 text-white z-[10000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl uppercase italic font-black text-red-500">
              {labels.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
              {labels.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12 uppercase font-black text-[10px]">
              {labels.no}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbort}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 uppercase font-black text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.4)]"
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
        isOpen={showShop}
        onClose={() => { setShowShop(false); if (!gameStarted) startGame(); }}
        labels={labels}
      />

      {showFame && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-2xl h-[80vh] relative">
            <button 
              onClick={() => setShowFame(false)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center z-10"
            >
              <XIcon />
            </button>
            <HallOfFame title={labels.hallOfFame} subtitle={labels.sector + " 7G-Alpha"} />
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 w-full p-6 text-center z-10 opacity-20 pointer-events-none">
        <div className="text-[10px] text-white uppercase tracking-[0.5em] font-bold">
          Neural Link V2.0 • Sector Clearance Confirmed
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
