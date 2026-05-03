
"use client";

import { Settings, Volume2, VolumeX, Languages, Zap, Trophy, BatteryLow, BatteryFull, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';
import { Language } from '@/lib/localization';
import { GameMode } from '@/hooks/useGameState';

interface SettingsDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  disabled?: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  isBatterySaver: boolean;
  onToggleBattery: () => void;
  language: Language;
  onCycleLanguage: () => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
  onShowFame: () => void;
  onAbort: () => void;
  gameStarted: boolean;
  labels: Record<string, string>;
  anchor?: 'top' | 'bottom';
}

export function SettingsDrawer({ 
  isOpen, 
  onToggle, 
  disabled, 
  soundOn,
  onToggleSound,
  isBatterySaver,
  onToggleBattery,
  language,
  onCycleLanguage,
  gameMode,
  onSetGameMode,
  onShowFame,
  onAbort,
  gameStarted,
  labels,
  anchor = 'bottom'
}: SettingsDrawerProps) {
  const toggleSettings = () => {
    if (disabled) return;
    playUIClickSound();
    onToggle(!isOpen);
  };

  const cycleDifficulty = () => {
    const modes: GameMode[] = ['easy', 'hard', 'hell'];
    const currentIndex = modes.indexOf(gameMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onSetGameMode(modes[nextIndex]);
    playUIClickSound();
  };

  // Define the core mission controls
  const buttons = [
    { 
      icon: Trophy, 
      label: labels.hallOfFame, 
      onClick: onShowFame,
      active: true,
      color: 'text-amber-400'
    },
    { 
      icon: Zap, 
      label: gameMode.toUpperCase(), 
      onClick: cycleDifficulty,
      active: true,
      color: 'text-primary'
    },
    { 
      icon: isBatterySaver ? BatteryLow : BatteryFull, 
      label: labels.batterySaver, 
      active: isBatterySaver, 
      onClick: onToggleBattery,
      color: isBatterySaver ? 'text-green-400' : 'text-slate-400'
    },
    { 
      icon: soundOn ? Volume2 : VolumeX, 
      label: labels.sound, 
      active: soundOn, 
      onClick: onToggleSound 
    },
    { 
      icon: Languages, 
      label: language.toUpperCase(), 
      onClick: onCycleLanguage,
      active: true
    },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={toggleSettings}
        disabled={disabled}
        className={cn(
          "w-12 h-12 rounded-full glass-panel flex items-center justify-center border-primary/30 hover:border-primary transition-all shadow-lg group active:scale-90",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <Settings className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
      </button>

      <div className={cn(
        "absolute right-0 flex flex-col gap-3 p-4 glass-morphism rounded-[2rem] transition-all duration-500 ease-out z-[65] shadow-2xl border-white/5",
        anchor === 'bottom' ? "top-full mt-4" : "bottom-full mb-4",
        isOpen ? "translate-y-0 opacity-100" : (anchor === 'bottom' ? "-translate-y-8" : "translate-y-8") + " opacity-0 pointer-events-none"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => { playUIClickSound(); btn.onClick(); }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              btn.active === false ? "bg-black/40 text-muted-foreground" : "bg-white/5 text-white",
              btn.color,
              "hover:bg-white/10 active:scale-90 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            )}
            title={btn.label}
          >
            <btn.icon className={cn("w-6 h-6", btn.color)} />
          </button>
        ))}

        {/* HIGH PRIORITY EMERGENCY STOP CONTROL */}
        {gameStarted && (
          <button
            onClick={() => { playUIClickSound(); onAbort(); }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            title={labels.abortMission}
          >
            <Power className="w-6 h-6 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          </button>
        )}
      </div>
    </div>
  );
}
