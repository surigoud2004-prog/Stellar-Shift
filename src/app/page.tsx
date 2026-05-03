
"use client";

import { Board } from '@/components/game/Board';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileDashboard } from '@/components/game/ProfileDashboard';
import { SettingsDrawer } from '@/components/game/SettingsDrawer';
import { ParallaxBackground } from '@/components/game/ParallaxBackground';
import { HallOfFame } from '@/components/game/HallOfFame';
import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, X, Trophy, Eye, EyeOff } from 'lucide-react';
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

export default function Home() {
  const { 
    profile, showProfile, setShowProfile, setAvatar, setName, getRank 
  } = usePlayerProfile();
  
  const { 
    gameMode, setGameMode, gameStarted, quitGame, score, targetScore, timeLeft
  } = useGameState();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [showFame, setShowFame] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);

  const labels = LOCALIZATION[language];

  const handleAbort = () => {
    quitGame();
    setAbortDialogOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0512]">
      <ParallaxBackground disabled={isBatterySaver} />
      
      {/* Global_HUD Layer: Highest Priority Overlay */}
      <div id="Global_HUD" className="fixed inset-0 pointer-events-none z-[9999]">
        
        {/* Top-Left Anchor: Abort Control (Always Accessible) */}
        <div className="absolute top-[30px] left-[30px] pointer-events-auto">
          {gameStarted && (
            <button 
              onClick={() => setAbortDialogOpen(true)}
              className="w-[50px] h-[50px] rounded-full glass-panel border-destructive/50 bg-black/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              title={labels.abortMission}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          )}
          
          <button 
            onClick={() => setUiVisible(!uiVisible)}
            className="mt-4 w-10 h-10 rounded-full glass-panel border-white/10 hover:border-primary/50 transition-all flex items-center justify-center group active:scale-90"
            title={uiVisible ? "Hide UI" : "Show UI"}
          >
            {uiVisible ? (
              <Eye className="w-5 h-5 text-white/70 group-hover:text-primary" />
            ) : (
              <EyeOff className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>

        {/* Top-Center Anchor: Title & Strict Score Stacking */}
        <div className={cn(
          "absolute top-[30px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center transition-all duration-500 pointer-events-auto",
          !uiVisible && "opacity-0"
        )}>
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          
          {gameStarted && (
            <div className="mt-[40px] flex flex-col items-center animate-in fade-in slide-in-from-top-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-1">{labels.score}</span>
              <div className="text-2xl md:text-4xl font-black text-white tabular-nums tracking-tighter bg-black/40 px-6 py-2 rounded-2xl border border-primary/20 backdrop-blur-sm">
                SCORE: {score.toLocaleString()} <span className="text-white/30 mx-2">/</span> {targetScore.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Top-Right Anchor: Settings & Timer */}
        <div className={cn(
          "absolute top-[30px] right-[30px] flex items-center gap-4 pointer-events-auto transition-all duration-500",
          !uiVisible && "opacity-0"
        )}>
          {gameStarted && (
            <div className="hidden sm:flex flex-col items-end glass-panel px-4 py-1.5 rounded-xl border-primary/20">
              <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">{labels.time}</span>
              <div className={cn("text-xl font-black tabular-nums", timeLeft < 10 ? "text-destructive animate-pulse" : "text-white")}>
                {timeLeft}s
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg active:scale-90"
          >
            <User className="w-6 h-6 text-primary" />
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
              const next = langs[(langs.indexOf(language) + 1) % langs.length];
              setLanguage(next);
            }}
            gameMode={gameMode}
            onSetGameMode={setGameMode}
            onShowFame={() => setShowFame(true)}
            labels={labels}
            anchor="bottom"
          />
        </div>

        {/* High Score HUD Meta */}
        <div className={cn(
          "absolute top-[90px] right-[30px] transition-all duration-500",
          !uiVisible && "opacity-0"
        )}>
          <div className="flex items-center gap-2 glass-panel px-3 py-1 rounded-full border-primary/10">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-black text-white tabular-nums">{profile.allTimeHigh}</span>
          </div>
        </div>
      </div>

      {/* Main Game Interface - Centered Board */}
      <Board />

      {/* Confirmation Overlays */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-destructive/50 bg-black/95 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)] z-[10000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl uppercase italic font-black text-destructive">
              {labels.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold leading-relaxed">
              {labels.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 uppercase font-black text-[10px] tracking-widest rounded-xl h-12">
              {labels.no}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbort}
              className="bg-destructive hover:bg-destructive/80 text-white uppercase font-black text-[10px] tracking-widest rounded-xl h-12 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              {labels.yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dashboard Overlays */}
      <ProfileDashboard 
        profile={profile}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpdateName={setName}
        onUpdateAvatar={setAvatar}
        getRankLabel={getRank}
        labels={labels}
      />

      {showFame && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl h-[80vh] relative">
            <button 
              onClick={() => setShowFame(false)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center z-10 hover:scale-110 transition-transform shadow-lg"
            >
              ×
            </button>
            <HallOfFame title={labels.hallOfFame} subtitle={labels.sector + " 7G-Alpha"} />
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <footer className="fixed bottom-0 w-full p-6 text-center z-10 pointer-events-none opacity-30">
        <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">
          &copy; 2024 STELLAR SHIFT | NEURAL LINK V0.9.8 | SECTOR CLEARANCE GRANTED
        </div>
      </footer>
    </main>
  );
}
