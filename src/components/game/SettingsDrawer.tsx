"use client";

import { useState } from 'react';
import { Settings, Volume2, Music, Home, Languages, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';

interface SettingsDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onHome: () => void;
  disabled?: boolean;
}

export function SettingsDrawer({ isOpen, onToggle, onHome, disabled }: SettingsDrawerProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);

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
    { icon: Volume2, label: 'Sound', active: soundOn, onClick: () => setSoundOn(!soundOn) },
    { icon: Music, label: 'Music', active: musicOn, onClick: () => setMusicOn(!musicOn) },
    { icon: Languages, label: 'Language', onClick: () => {} },
    { icon: Home, label: 'Exit', onClick: onHome, color: 'text-destructive' },
  ];

  return (
    <div className="fixed top-8 right-8 z-[60] flex items-start justify-end gap-4 pointer-events-none">
      {/* Settings Gear - Metallic 3D Styling */}
      <button
        onClick={toggleSettings}
        disabled={disabled}
        className={cn(
          "pointer-events-auto relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border-2 border-slate-500/50 shadow-2xl transition-all duration-500 overflow-hidden flex items-center justify-center group",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
        <Settings className="w-8 h-8 text-slate-800 drop-shadow-sm relative z-10" />
        <div className="absolute inset-0 rounded-full ring-4 ring-primary/20 animate-pulse-slow opacity-0 group-hover:opacity-100" />
      </button>

      {/* Drawer Panel - Glassmorphism */}
      <div className={cn(
        "pointer-events-auto glass-morphism border-primary/20 rounded-3xl p-4 transition-all duration-500 ease-out flex flex-col gap-3",
        isOpen ? "translate-x-0 opacity-100 w-20" : "translate-x-full opacity-0 w-0 p-0 overflow-hidden"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={btn.label}
            onClick={() => handleAction(btn.onClick)}
            style={{ transitionDelay: `${isOpen ? (idx + 1) * 100 : 0}ms` }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              "hover:bg-primary/20 hover:scale-110 active:scale-95",
              btn.active === false ? "bg-black/20 text-muted-foreground" : "bg-white/5 text-white",
              btn.color,
              isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            title={btn.label}
          >
            <btn.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
