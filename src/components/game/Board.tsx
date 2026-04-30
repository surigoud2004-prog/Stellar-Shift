"use client";

import { useGameState } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Atom, Orbit, Shield } from 'lucide-react';

export function Board() {
  const { 
    entities, 
    score, 
    goals, 
    lore, 
    selectedId, 
    setSelectedId, 
    swapEntities,
    isProcessing 
  } = useGameState();

  const handleSelect = (id: string) => {
    if (isProcessing) return;
    
    if (selectedId === null) {
      setSelectedId(id);
    } else {
      if (selectedId === id) {
        setSelectedId(null);
        return;
      }

      const entity1 = entities.find(e => e.id === selectedId);
      const entity2 = entities.find(e => e.id === id);

      if (entity1 && entity2 && areAdjacent(entity1, entity2)) {
        swapEntities(selectedId, id);
        setSelectedId(null);
      } else {
        setSelectedId(id);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto p-4 lg:p-8 min-h-[90vh]">
      {/* Left Panel - Stats & Goals */}
      <div className="lg:w-1/4 space-y-6">
        <Card className="glass-morphism p-6 border-primary/20">
          <h2 className="font-headline text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <Orbit className="w-6 h-6" /> Mission Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                <span>Ship Power</span>
                <span>{Math.min(100, Math.floor(score / 10))}%</span>
              </div>
              <Progress value={Math.min(100, score / 10)} className="h-2 bg-muted" />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Energy Level</p>
              <div className="text-4xl font-headline font-bold text-white tracking-tight">
                {score.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-6 border-secondary/20">
          <h2 className="font-headline text-xl font-bold mb-4 text-secondary flex items-center gap-2">
            <Zap className="w-5 h-5" /> Objectives
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ancient Runes</span>
              <Badge variant="outline" className="border-secondary text-secondary">
                {Math.floor(score / 50)} / 20
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stellar Clusters</span>
              <Badge variant="outline" className="border-primary text-primary">
                {Math.floor(score / 100)} / 5
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Center - Hex Grid */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center relative bg-black/20 rounded-3xl overflow-hidden border border-white/5 shadow-inner hex-grid-container p-12">
        <div 
          className="relative transition-transform duration-500 mb-8" 
          style={{ 
            width: `${GRID_SIZE * HEX_WIDTH * 1.5}px`, 
            height: `${GRID_SIZE * HEX_WIDTH * 1.5}px`,
            transform: `translate(0, 0)`
          }}
        >
          {entities.map(entity => (
            <Entity 
              key={entity.id} 
              entity={entity} 
              isSelected={selectedId === entity.id}
              onSelect={handleSelect}
              disabled={isProcessing}
            />
          ))}
        </div>

        {/* Starting Point Wall / Foundation */}
        <div className="w-full h-12 bg-gradient-to-t from-primary/20 to-transparent border-t border-primary/30 relative flex items-center justify-center gap-8 px-12 mt-4 rounded-b-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(187,112,255,0.1)_0%,transparent_70%)]" />
          <div className="flex items-center gap-2 text-primary font-headline text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">
            <Shield className="w-3 h-3" />
            Vanguard Wall Active
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Lore & Logs */}
      <div className="lg:w-1/4 space-y-6">
        <Card className="glass-morphism p-6 h-full flex flex-col border-white/10">
          <h2 className="font-headline text-xl font-bold mb-4 text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Cosmic Lore
          </h2>
          <div className="flex-1 italic text-muted-foreground leading-relaxed text-sm overflow-y-auto max-h-[400px] pr-2">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {lore}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <Atom className="w-4 h-4 text-secondary animate-spin" style={{ animationDuration: '4s' }} />
              Scanner active
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
