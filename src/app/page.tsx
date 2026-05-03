
"use client";

import { Board } from '@/components/game/Board';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileDashboard } from '@/components/game/ProfileDashboard';
import { SettingsDrawer } from '@/components/game/SettingsDrawer';
import { ParallaxBackground } from '@/components/game/ParallaxBackground';
import { HallOfFame } from '@/components/game/HallOfFame';
import { MissionLogs } from '@/components/game/MissionLogs';
import { GameStateProvider, useGameState } from '@/context/GameStateContext';
import { useState } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, Trophy, BookOpen, X as XIcon, Eye, EyeOff } from 'lucide-react';
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
    profile, showProfile, setShowProfile, setAvatar, setName, getRank 
  } = usePlayerProfile();
  
  const { 
    gameMode, setGameMode, gameStarted, quitGame, score, targetScore, timeLeft, startGame
  } = useGameState();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [showFame, setShowFame] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);

  const labels = LOCALIZATION[language];

  const handleAbort = () => {
    quitGame();
    setAbortDialogOpen(false);
    setSettingsOpen(false);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-hidden">
      
      {/* LAYER 1: COSMIC BACKGROUND */}
      <ParallaxBackground disabled={isBatterySaver} />
      
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
          "absolute top-[30px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-auto transition-opacity duration-500",
          !uiVisible && "opacity-0"
        )}>
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] font-black uppercase tracking-[0.2em] text-sm md:text-lg bg-black/40 px-6 py-2 rounded-xl border border-primary/20 backdrop-blur-md">
              {labels.score}: {score.toLocaleString()} / {targetScore.toLocaleString()}
            </div>
            <div className={cn(
              "text-white/80 font-mono text-xs uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md",
              timeLeft < 10 && "text-red-400 animate-pulse border-red-500/50"
            )}>
              {labels.time}: {timeLeft}s
            </div>
          </div>
        </div>

        {/* TOP-RIGHT ANCHOR: COMMAND CLUSTER */}
        <div className="absolute top-[30px] right-[30px] flex items-center gap-4 pointer-events-auto">
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
            onAbort={() => setAbortDialogOpen(true)}
            gameStarted={gameStarted}
            labels={labels}
          />
        </div>
      </div>

      {/* LAYER 3: GAME BOARD (CENTER LAYER) */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center z-10 pt-48 pb-20">
        {!gameStarted ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-700">
             <button 
                onClick={startGame}
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
