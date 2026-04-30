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
    <div className="fixed top-8 right-8 z-[60] flex items-start justify-end gap-6 pointer-events-none">
      {/* Settings Gear - 3D Metallic Sprocket Design */}
      <button
        onClick={toggleSettings}
        disabled={disabled}
        className={cn(
          "settings-gear-btn group",
          isOpen && "rotate-90",
          disabled && "opacity-50 grayscale"
        )}
      >
        <div className="gear-core" />
        <Settings className="w-10 h-10 text-slate-900 relative z-10 drop-shadow-md" />
        <div className="gear-aura" />
      </button>

      {/* Drawer Panel - Glassmorphism Side Panel */}
      <div className={cn(
        "pointer-events-auto glass-morphism border-primary/20 rounded-[2rem] p-5 transition-all duration-700 ease-out flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        isOpen ? "translate-x-0 opacity-100 w-24" : "translate-x-[200%] opacity-0 w-0 p-0 overflow-hidden"
      )}>
        {buttons.map((btn, idx) => (
          <button
            key={btn.label}
            onClick={() => handleAction(btn.onClick)}
            style={{ transitionDelay: `${isOpen ? (idx + 1) * 100 : 0}ms` }}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
              "hover:bg-primary/30 hover:scale-110 active:scale-95 shadow-lg",
              btn.active === false ? "bg-black/40 text-muted-foreground" : "bg-white/10 text-white",
              btn.color,
              isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
            title={btn.label}
          >
            <btn.icon className="w-7 h-7" />
          </button>
        ))}
      </div>
    </div>
  );
}
