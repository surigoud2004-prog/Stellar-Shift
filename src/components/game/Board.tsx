"use client";

import { useGameState, GameMode } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Atom, Orbit, Shield, Cpu, Timer, Trophy, Skull, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Board() {
  const { 
    entities, 
    score, 
    targetScore,
    timeLeft,
    level,
    gameMode,
    setGameMode,
    isGameOver,
    isWin,
    isLocked,
    lore, 
    selectedId, 
    setSelectedId, 
    swapEntities,
    isProcessing,
    initBoard
  } = useGameState();

  const handleSelect = (id: string) => {
    if (isProcessing || isGameOver || isWin || isLocked) return;
    
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

  const progress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto p-4 lg:p-8 min-h-[90vh]">
      {/* Left Panel */}
      <div className="lg:w-1/4 space-y-6">
        <Card className="glass-morphism p-6 border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <Orbit className="w-6 h-6" /> Level {level}
            </h2>
            <Badge variant="outline" className="border-primary uppercase text-[10px]">
              {gameMode}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <Timer className={cn("w-5 h-5", timeLeft < 10 && "text-destructive animate-pulse")} />
              <span className="text-2xl font-mono font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-muted-foreground uppercase tracking-wider">
                <span>Alignment Goal</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-muted" />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Resonance</p>
              <div className="text-4xl font-headline font-bold text-white">
                {score.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">TARGET: {targetScore.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-6 border-secondary/20">
          <h2 className="font-headline text-xl font-bold mb-4 text-secondary flex items-center gap-2">
            <Zap className="w-5 h-5" /> Protocols
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {(['easy', 'hard', 'hell'] as GameMode[]).map((mode) => (
              <Button 
                key={mode} 
                variant={gameMode === mode ? "default" : "outline"} 
                size="sm"
                className="w-full uppercase text-[10px] font-bold tracking-tighter"
                onClick={() => setGameMode(mode)}
              >
                {mode} Mode
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Center - Hex Grid */}
      <div className="lg:w-1/2 flex flex-col relative bg-black/40 rounded-3xl overflow-hidden border border-white/5 shadow-2xl hex-grid-container min-h-[650px]">
        {/* Overlays */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <Skull className="w-16 h-16 text-destructive mb-4 animate-bounce" />
            <h2 className="text-4xl font-headline font-bold text-white mb-2">MISSION TERMINATED</h2>
            <p className="text-muted-foreground mb-6">Alignment synchronization failed. Core collapse imminent.</p>
            <Button onClick={initBoard} size="lg" className="bg-destructive hover:bg-destructive/80">RETRY PROTOCOL</Button>
          </div>
        )}

        {isWin && (
          <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
            <Trophy className="w-16 h-16 text-primary mb-4 animate-pulse" />
            <h2 className="text-4xl font-headline font-bold text-white mb-2">SYSTEM STABILIZED</h2>
            <p className="text-white/80 mb-6">Celestial alignment achieved. Advancing to higher sector...</p>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-4 z-40 bg-black/40 backdrop-blur-[2px] border-2 border-destructive/20 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <Lock className="w-12 h-12 text-destructive animate-pulse mb-2" />
            <span className="text-destructive font-bold text-xs uppercase tracking-[0.5em]">System Locked</span>
            <span className="text-[10px] text-muted-foreground mt-1">Interact to resume</span>
          </div>
        )}

        {/* Game Area */}
        <div className="flex-1 relative p-12 overflow-hidden flex items-center justify-center">
          <div 
            className={cn(
              "relative transition-transform duration-500",
              isLocked && "opacity-50 grayscale"
            )} 
            style={{ 
              width: `${GRID_SIZE * HEX_WIDTH}px`, 
              height: `${(GRID_SIZE - 1) * HEX_WIDTH}px`,
              marginLeft: `-${HEX_WIDTH/2}px` 
            }}
          >
            {entities.map(entity => (
              <Entity 
                key={entity.id} 
                entity={entity} 
                isSelected={selectedId === entity.id}
                onSelect={handleSelect}
                disabled={isProcessing || isGameOver || isWin || isLocked}
              />
            ))}
          </div>
        </div>

        {/* Foundation Wall */}
        <div className="w-full h-32 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent border-t-4 border-primary/40 relative flex items-center justify-center gap-12 px-12 z-40 mt-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(187,112,255,0.15)_0%,transparent_70%)]" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 text-primary font-headline text-sm uppercase tracking-[0.5em] font-bold">
              <Shield className="w-5 h-5 animate-pulse" />
              Structural Foundation
            </div>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 rounded-sm bg-primary/60 animate-pulse" 
                  style={{ animationDelay: `${i * 0.1}s` }} 
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-secondary font-headline text-xs uppercase tracking-[0.5em] font-bold opacity-80">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            Stable Base
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/4 space-y-6">
        <Card className="glass-morphism p-6 h-full flex flex-col border-white/10">
          <h2 className="font-headline text-xl font-bold mb-4 text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Archive Logs
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
              Scanner: {isProcessing ? "Recalibrating..." : "Active"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}