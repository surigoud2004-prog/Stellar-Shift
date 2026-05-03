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
import { User } from 'lucide-react';

export default function Home() {
  const { 
    profile, showProfile, setShowProfile, setAvatar, setName, getRank 
  } = usePlayerProfile();
  
  const { 
    gameMode, setGameMode 
  } = useGameState();

  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [soundOn, setSoundOn] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [showFame, setShowFame] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const labels = LOCALIZATION[language];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0512]">
      <ParallaxBackground disabled={isBatterySaver} />
      
      {/* Top Header */}
      <header className="fixed top-0 w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-[50]">
        <div className="group cursor-default">
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic transition-all group-hover:tracking-normal group-hover:text-primary">
            Stellar <span className="text-primary group-hover:text-white transition-colors">Shift</span>
          </h1>
          <p className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-muted-foreground font-bold mt-1">
            <span className="text-primary animate-pulse">●</span> {labels.protocol}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/20 hover:border-primary transition-all shadow-lg group"
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
      </header>

      <Board />

      {/* Overlays */}
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
        &copy; 2024 STELLAR SHIFT | NEURAL LINK ESTABLISHED | V0.9.1
      </footer>
    </main>
  );
}
