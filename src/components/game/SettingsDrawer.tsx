
"use client";

import { Settings, Volume2, VolumeX, Music, Home, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';
import { Language } from '@/lib/localization';

interface SettingsDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onHome: () => void;
  disabled?: boolean;
  gameInProgress?: boolean;
  soundOn: boolean;
  musicOn: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  language: Language;
  onCycleLanguage: () => void;
  labels: Record<string, string>;
}

export function SettingsDrawer({ 
  isOpen, 
  onToggle, 
  onHome, 
  disabled, 
  gameInProgress,
  soundOn,
  musicOn,
  onToggleSound,
  onToggleMusic,
  language,
  onCycleLanguage,
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

  const buttons = [
    { 
      icon: soundOn ? Volume2 : VolumeX, 
      label: labels.sound, 
      active: soundOn, 
      onClick: onToggleSound 
    },
    { 
      icon: Music, 
      label: labels.music, 
      active: musicOn, 
      onClick: onToggleMusic 
    },
    { 
      icon: Languages, 
      label: labels.language + `: ${language.toUpperCase()}`, 
      onClick: onCycleLanguage,
      active: true
    },
    ...(gameInProgress ? [{ icon: Home, label: labels.exit, onClick: onHome, color: 'text-destructive' }] : []),
  ];

  return (
    <div className="fixed top-8 right-8 z-[60] flex flex-row-reverse items-start gap-6 pointer-events-none">
      {/* Settings Gear */}
      <button
        onClick={toggleSettings}
        disabled={disabled}
        className={cn(
          "settings-gear-btn group flex-shrink-0 pointer-events-auto",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <div className="gear-core" />
        <Settings className="w-10 h-10 text-slate-900 relative z-10 drop-shadow-md" />
        <div className={cn("gear-aura", !disabled && "group-hover:opacity-100")} />
      </button>

      {/* Drawer Panel */}
      <div className={cn(
        "pointer-events-auto glass-morphism border-primary/20 rounded-[2rem] p-5 transition-all duration-700 ease-out flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        isOpen ? "translate-x-0 opacity-100 w-24" : "translate-x-12 opacity-0 w-0 p-0 overflow-hidden"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={btn.label}
            onClick={() => handleAction(btn.onClick)}
            style={{ transitionDelay: `${isOpen ? (idx + 1) * 100 : 0}ms` }}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative group/btn",
              "hover:bg-primary/30 hover:scale-110 active:scale-95 shadow-lg",
              btn.active === false ? "bg-black/40 text-muted-foreground" : "bg-white/10 text-white",
              btn.color,
              isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
            title={btn.label}
          >
            <btn.icon className="w-7 h-7" />
            <span className="absolute right-full mr-4 bg-black/80 text-[8px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest font-bold border border-white/10 pointer-events-none">
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
