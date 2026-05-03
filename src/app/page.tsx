
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
      
      {/* High-Priority Command HUD */}
      <header className="fixed top-0 inset-x-0 p-4 md:p-6 z-[999] pointer-events-none">
        <div className="flex justify-between items-start w-full max-w-7xl mx-auto">
          
          {/* Left: Abort Mission & UI Toggle */}
          <div className="pointer-events-auto flex flex-col gap-3">
            {gameStarted && (
              <button 
                onClick={() => setAbortDialogOpen(true)}
                className="w-12 h-12 rounded-full glass-panel border-destructive/30 hover:border-destructive transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 z-[999]"
                title={labels.abortMission}
              >
                <X className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform" />
              </button>
            )}
            
            <button 
              onClick={() => setUiVisible(!uiVisible)}
              className="w-10 h-10 rounded-full glass-panel border-white/10 hover:border-primary/50 transition-all flex items-center justify-center group shadow-lg active:scale-90"
              title={uiVisible ? "Hide UI" : "Show UI"}
            >
              {uiVisible ? (
                <Eye className="w-5 h-5 text-white/70 group-hover:text-primary transition-colors" />
              ) : (
                <EyeOff className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>

          {/* Center: Title & Score Display */}
          <div className={cn(
            "flex flex-col items-center pt-2 transition-all duration-500",
            !uiVisible && "opacity-0 pointer-events-none"
          )}>
            <h1 className="font-headline text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Stellar <span className="text-primary">Shift</span>
            </h1>
            
            {gameStarted && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-700">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-1">{labels.score}</span>
                <div className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">
                  {score.toLocaleString()} <span className="text-white/30 mx-2 text-xl">/</span> {targetScore.toLocaleString()}
                </div>
              </div>
            )}
            
            {!gameStarted && (
              <p className="text-[8px] tracking-[0.6em] text-primary/60 font-bold uppercase mt-1">Galactic Sector 7G-Alpha</p>
            )}
          </div>

          {/* Right: Personal HUD & Time */}
          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <div className="flex items-center gap-3">
              {gameStarted && uiVisible && (
                <div className="hidden sm:flex flex-col items-end glass-panel px-4 py-1.5 rounded-xl border-primary/20 animate-in fade-in slide-in-from-right-4">
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">{labels.time}</span>
                  <div className={cn("text-xl font-black tabular-nums", timeLeft < 10 ? "text-destructive animate-pulse" : "text-white")}>
                    {timeLeft}s
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowProfile(true)}
                className={cn(
                  "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg group active:scale-90",
                  !uiVisible && "opacity-0 pointer-events-none"
                )}
              >
                <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </button>

              <div className={cn("transition-opacity duration-300", !uiVisible && "opacity-0 pointer-events-none")}>
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
            
            {/* Mobile Stats Toggle (Visible only if UI is on) */}
            {uiVisible && (
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2 glass-panel px-3 py-1 rounded-full border-primary/10">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-black text-white tabular-nums">{profile.allTimeHigh}</span>
                </div>
                {gameStarted && (
                  <div className="sm:hidden text-lg font-black text-white tabular-nums">
                    {timeLeft}s
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Interface */}
      <Board />

      {/* Confirmation Overlays */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent className="glass-panel border-destructive/50 bg-black/95 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)] z-[1000]">
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
