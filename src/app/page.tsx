
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
import { User, X, Settings } from 'lucide-react';
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
    gameMode, setGameMode, gameStarted, quitGame 
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
      
      {/* Tactical Header Controls */}
      <header className="fixed top-0 w-full p-5 flex justify-between items-start z-[100] pointer-events-none">
        {/* Top Left: Abort Mission (Only visible during active game) */}
        <div className="pointer-events-auto">
          {gameStarted && (
            <button 
              onClick={() => setAbortDialogOpen(true)}
              className="w-10 h-10 rounded-full glass-panel border-destructive/30 hover:border-destructive transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              title={labels.abortMission}
            >
              <X className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Center Title (Optional, keeping it subtle) */}
        {!gameStarted && (
          <div className="hidden md:block text-center mt-2 pointer-events-none opacity-40">
            <h1 className="font-headline text-xl font-black tracking-tighter text-white uppercase italic">
              Stellar <span className="text-primary">Shift</span>
            </h1>
          </div>
        )}

        {/* Top Right: Settings & Profile */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center border-primary/20 hover:border-primary transition-all shadow-lg group"
            >
              <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
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
        </div>
      </header>

      {/* Main Game Interface */}
      <Board />

      {/* Confirmation Overlays */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-destructive/50 bg-black/90 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl uppercase italic font-black text-destructive">
              {labels.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
              {labels.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 uppercase font-black text-[10px] tracking-widest">
              {labels.no}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbort}
              className="bg-destructive hover:bg-destructive/80 text-white uppercase font-black text-[10px] tracking-widest"
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
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center z-10 hover:scale-110 transition-transform"
            >
              ×
            </button>
            <HallOfFame title={labels.hallOfFame} subtitle={labels.sector + " 7G-Alpha"} />
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 w-full p-4 text-center text-[8px] md:text-[10px] text-muted-foreground/40 z-10 uppercase tracking-[0.4em]">
        &copy; 2024 STELLAR SHIFT | NEURAL LINK ESTABLISHED | V0.9.5
      </footer>
    </main>
  );
}
