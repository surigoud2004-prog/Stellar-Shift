
"use client";

import { Board } from '@/components/game/Board';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { ProfileDashboard } from '@/components/game/ProfileDashboard';
import { SettingsDrawer } from '@/components/game/SettingsDrawer';
import { ParallaxBackground } from '@/components/game/ParallaxBackground';
import { HallOfFame } from '@/components/game/HallOfFame';
import { MissionLogs } from '@/components/game/MissionLogs';
import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { LOCALIZATION } from '@/lib/localization';
import { User, Trophy, BookOpen } from 'lucide-react';
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
  const [showLogs, setShowLogs] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);

  const labels = LOCALIZATION[language];

  const handleAbort = () => {
    quitGame();
    setAbortDialogOpen(false);
    setSettingsOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0512]">
      <ParallaxBackground disabled={isBatterySaver} />
      
      {/* Global HUD Layer: Fixed and Topmost (Z-9999) */}
      <div id="Global_HUD" className="fixed inset-0 pointer-events-none z-[9999]">
        
        {/* Top-Center Anchor: Mission Telemetry Stack */}
        <div className="absolute top-[30px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          
          {gameStarted && (
            <div className="mt-4 flex flex-col items-center space-y-2 pointer-events-auto">
              <div className="text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] font-black uppercase tracking-widest text-sm md:text-xl flex items-center gap-4">
                <span className="bg-black/40 px-4 py-1 rounded-lg border border-primary/20">
                  {labels.score}: {score.toLocaleString()} / {targetScore.toLocaleString()}
                </span>
                <span className={cn(
                  "bg-black/40 px-4 py-1 rounded-lg border border-primary/20 tabular-nums",
                  timeLeft < 10 && "text-destructive animate-pulse"
                )}>
                  {labels.time}: {timeLeft}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top-Right Anchor: Command Cluster */}
        <div className="absolute top-[30px] right-[30px] flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowLogs(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg active:scale-90 bg-black/40 backdrop-blur-md"
            title={labels.archive}
          >
            <BookOpen className="w-6 h-6 text-secondary" />
          </button>

          <button 
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg active:scale-90 bg-black/40 backdrop-blur-md"
            title={labels.profile}
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
            onAbort={() => setAbortDialogOpen(true)}
            gameStarted={gameStarted}
            labels={labels}
            anchor="bottom"
          />
        </div>

        {/* Dynamic Personal Best Anchor */}
        <div className="absolute top-[100px] right-[30px] pointer-events-none">
          <div className="flex items-center gap-2 glass-panel px-3 py-1 rounded-full border-primary/10 bg-black/40 backdrop-blur-md">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-black text-white tabular-nums tracking-widest uppercase">
              {labels.best}: {profile.allTimeHigh}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Tactical Board */}
      <Board />

      {/* Confirmation Protocols */}
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

      {/* Footer Metadata */}
      <footer className="fixed bottom-0 w-full p-6 text-center z-10 pointer-events-none opacity-30">
        <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">
          &copy; 2024 STELLAR SHIFT | NEURAL LINK V0.9.9 | SECTOR CLEARANCE GRANTED
        </div>
      </footer>
    </main>
  );
}
