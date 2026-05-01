"use client";

import { Settings, Volume2, VolumeX, Languages, Zap, Trophy } from 'lucide-react';
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
  language: Language;
  onCycleLanguage: () => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
  onShowFame: () => void;
  labels: Record<string, string>;
}

export function SettingsDrawer({ 
  isOpen, 
  onToggle, 
  disabled, 
  soundOn,
  onToggleSound,
  language,
  onCycleLanguage,
  gameMode,
  onSetGameMode,
  onShowFame,
  labels
}: SettingsDrawerProps) {
  const toggleSettings = () => {
    if (disabled) return;
    playUIClickSound();
    onToggle(!isOpen);
  };

  const handleAction = (action: () => void) => {
    playUIClickSound();
    action();
  };

  const cycleDifficulty = () => {
    const modes: GameMode[] = ['easy', 'hard', 'hell'];
    const currentIndex = modes.indexOf(gameMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onSetGameMode(modes[nextIndex]);
  };

  const buttons = [
    { 
      icon: Zap, 
      label: `${labels.subsystems}: ${gameMode.toUpperCase()}`, 
      onClick: cycleDifficulty,
      active: true,
      color: 'text-amber-400'
    },
    { 
      icon: Trophy, 
      label: labels.hallOfFame, 
      onClick: onShowFame,
      active: true,
      color: 'text-primary'
    },
    { 
      icon: soundOn ? Volume2 : VolumeX, 
      label: labels.sound, 
      active: soundOn, 
      onClick: onToggleSound 
    },
    { 
      icon: Languages, 
      label: labels.language + `: ${language.toUpperCase()}`, 
      onClick: onCycleLanguage,
      active: true
    },
  ];

  return (
    <div className="relative flex flex-col items-end gap-4">
      {/* Settings Gear */}
      <button
        onClick={toggleSettings}
        disabled={disabled}
        className={cn(
          "settings-gear-btn group pointer-events-auto",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <div className="gear-core" />
        <Settings className="w-8 h-8 text-slate-900 relative z-10 drop-shadow-md" />
        <div className={cn("gear-aura", !disabled && "group-hover:opacity-100")} />
      </button>

      {/* Drawer Panel - Positioned below buttons */}
      <div className={cn(
        "absolute top-full right-0 mt-4 pointer-events-auto glass-morphism border-primary/20 rounded-[2rem] p-4 transition-all duration-700 ease-out flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[65]",
        isOpen ? "translate-y-0 opacity-100 w-20" : "-translate-y-8 opacity-0 w-0 p-0 overflow-hidden"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={btn.label}
            onClick={() => handleAction(btn.onClick)}
            style={{ transitionDelay: `${isOpen ? (idx + 1) * 100 : 0}ms` }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group/btn",
              "hover:bg-primary/30 hover:scale-110 active:scale-95 shadow-lg",
              btn.active === false ? "bg-black/40 text-muted-foreground" : "bg-white/10 text-white",
              btn.color,
              isOpen ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
            )}
            title={btn.label}
          >
            <btn.icon className="w-6 h-6" />
            <span className="absolute right-full mr-4 bg-black/80 text-[8px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest font-bold border border-white/10 pointer-events-none">
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
