
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
import { User, X, Trophy, Star } from 'lucide-react';
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
    gameMode, setGameMode, gameStarted, quitGame, score
  } = useGameState();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [showFame, setShowFame] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);

  const labels = LOCALIZATION[language];

  const handleAbort = () => {
    quitGame();
    setAbortDialogOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0512]">
      <ParallaxBackground disabled={isBatterySaver} />
      
      {/* High-Priority Command HUD */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-[100] pointer-events-none">
        {/* Left: Abort Mission */}
        <div className="pointer-events-auto">
          {gameStarted && (
            <button 
              onClick={() => setAbortDialogOpen(true)}
              className="w-12 h-12 rounded-full glass-panel border-destructive/30 hover:border-destructive transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-90"
              title={labels.abortMission}
            >
              <X className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Center: Mission Title (Hidden during small mobile play if needed) */}
        {!gameStarted && (
          <div className="hidden md:block text-center mt-2 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="font-headline text-2xl font-black tracking-tighter text-white uppercase italic">
              Stellar <span className="text-primary">Shift</span>
            </h1>
            <p className="text-[8px] tracking-[0.6em] text-primary/60 font-bold uppercase mt-1">Galactic Sector 7G-Alpha</p>
          </div>
        )}

        {/* Right: Personal HUD & Stats */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* All-Time High Display */}
            <div className="hidden sm:flex flex-col items-end glass-panel px-4 py-2 rounded-2xl border-primary/20">
              <span className="text-[8px] uppercase tracking-widest text-primary font-bold">{labels.allTimeHigh}</span>
              <span className="text-sm font-black text-white tabular-nums">{profile.allTimeHigh.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => setShowProfile(true)}
              className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg group active:scale-90"
            >
              <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
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
          
          {/* Mobile High Score (Smaller version) */}
          <div className="sm:hidden flex items-center gap-2 glass-panel px-3 py-1 rounded-full border-primary/10">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-black text-white tabular-nums">{profile.allTimeHigh}</span>
          </div>
        </div>
      </header>

      {/* Main Game Interface */}
      <Board />

      {/* Confirmation Overlays */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-destructive/50 bg-black/95 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)]">
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
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
      <footer className="fixed bottom-0 w-full p-6 text-center z-10 pointer-events-none">
        <div className="text-[8px] md:text-[10px] text-muted-foreground/30 uppercase tracking-[0.4em] font-bold">
          &copy; 2024 STELLAR SHIFT | NEURAL LINK V0.9.8 | SECTOR CLEARANCE GRANTED
        </div>
      </footer>
    </main>
  );
}
