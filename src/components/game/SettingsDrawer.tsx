
"use client";

import { Settings, Volume2, VolumeX, Languages, Zap, Trophy, BatteryLow, BatteryFull } from 'lucide-react';
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
          "settings-gear-btn group",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <Settings className="w-6 h-6 text-slate-900" />
      </button>

      <div className={cn(
        "absolute right-0 flex flex-col gap-2 p-3 glass-morphism rounded-3xl transition-all duration-500 ease-out z-[65] shadow-2xl",
        anchor === 'bottom' ? "bottom-full mb-4" : "top-full mt-4",
        isOpen ? "translate-y-0 opacity-100" : (anchor === 'bottom' ? "translate-y-8" : "-translate-y-8") + " opacity-0 pointer-events-none"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => { playUIClickSound(); btn.onClick(); }}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              btn.active === false ? "bg-black/20 text-muted-foreground" : "bg-white/5 text-white",
              btn.color,
              "hover:bg-white/10 active:scale-95"
            )}
            title={btn.label}
          >
            <btn.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
