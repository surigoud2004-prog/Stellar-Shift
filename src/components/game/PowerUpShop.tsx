
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Zap, Radiation, Coins, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';

interface PowerUpShopProps {
  coins: number;
  onBuy: (type: 'time' | 'nova' | 'nuke') => void;
  powerUps: {
    timeDilator: boolean;
    novaBlast: boolean;
    colorNuke: number;
  };
  isOpen: boolean;
  onClose: () => void;
  labels: any;
}

export function PowerUpShop({ coins, onBuy, powerUps, isOpen, onClose, labels }: PowerUpShopProps) {
  if (!isOpen) return null;

  const items = [
    {
      id: 'time',
      name: 'Time Dilator',
      cost: 200,
      icon: Timer,
      desc: '+15s Neural Link stability.',
      color: 'text-cyan-400',
      active: powerUps.timeDilator
    },
    {
      id: 'nova',
      name: 'Nova Blast',
      cost: 500,
      icon: Radiation,
      desc: 'Start with 2 Cosmic Bombs.',
      color: 'text-amber-400',
      active: powerUps.novaBlast
    },
    {
      id: 'nuke',
      name: 'Color Nuke',
      cost: 800,
      icon: Zap,
      desc: 'Vaporize one color type.',
      color: 'text-primary',
      active: false, // Stackable
      count: powerUps.colorNuke
    }
  ];

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[60px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-xl glass-morphism border-primary/40 bg-black/80 overflow-hidden flex flex-col p-8 relative shadow-[0_0_150px_rgba(168,85,247,0.4)]">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={() => { playUIClickSound(); onClose(); }}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10 border border-white/10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="flex items-center justify-between mb-8 pr-12">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                <ShoppingCart className="w-8 h-8 text-primary" />
             </div>
             <div>
                <h2 className="text-3xl font-headline font-black text-white uppercase italic tracking-tighter">Tactical Procurement</h2>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Sector Clearance Loadout</p>
             </div>
          </div>
        </div>

        {/* REAL-TIME WALLET DISPLAY */}
        <div className="flex items-center justify-center gap-4 bg-yellow-500/10 border border-yellow-500/30 px-8 py-5 rounded-3xl mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.7)] border-2 border-yellow-200">
             <Coins className="w-6 h-6 text-black stroke-[3px]" />
          </div>
          <span className="text-4xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{coins.toLocaleString()}</span>
        </div>

        <div className="grid gap-4 mb-8">
          {items.map((item) => (
            <div 
              key={item.id}
              className={cn(
                "group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                item.active ? "bg-primary/10 border-primary/40 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]" : "bg-white/5 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-5">
                 <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10", item.color)}>
                    <item.icon className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-white font-black uppercase text-sm tracking-widest">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.desc}</p>
                 </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 {item.id === 'nuke' && item.count > 0 && (
                   <span className="text-[10px] text-primary font-black uppercase mb-1">Stocked: {item.count}</span>
                 )}
                 <Button
                    onClick={() => { playUIClickSound(); onBuy(item.id as any); }}
                    disabled={coins < item.cost || (item.id !== 'nuke' && item.active)}
                    className={cn(
                      "h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                      item.active ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-primary hover:bg-primary/80 text-white shadow-lg"
                    )}
                 >
                    {item.active ? 'Equipped' : `${item.cost} Coins`}
                 </Button>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => { playUIClickSound(); onClose(); }}
          className="w-full h-16 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.4em] rounded-2xl border border-white/10 shadow-2xl transition-all"
        >
          Confirm Loadout
        </Button>
      </Card>
    </div>
  );
}
