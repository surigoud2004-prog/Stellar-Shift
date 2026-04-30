
"use client";

import { useGameState, GameMode } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Atom, Orbit, Shield, Cpu, Timer, Trophy, Skull, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HallOfFame } from './HallOfFame';

export function Board() {
  const { 
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isLocked, lore, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame
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
              <Timer className={cn("w-5 h-5", timeLeft < 15 && "text-destructive animate-pulse")} />
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
              <div className="text-4xl font-headline font-bold text-white">{score.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">BEST: {bestScore.toLocaleString()}</p>
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
                className="w-full uppercase text-[10px] font-bold"
                onClick={() => setGameMode(mode)}
              >
                {mode} Mode
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full uppercase text-[10px] mt-4"
              onClick={() => setShowHallOfFame(!showHallOfFame)}
            >
              <Globe className="w-4 h-4 mr-2" /> {showHallOfFame ? "Close Fame" : "Hall of Fame"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Center - Hex Grid or Hall of Fame */}
      <div className="lg:w-1/2 flex flex-col relative bg-black/40 rounded-3xl overflow-hidden border border-white/5 shadow-2xl min-h-[650px]">
        {showHallOfFame ? (
          <HallOfFame />
        ) : (
          <>
            {isGameOver && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                <Skull className="w-16 h-16 text-destructive mb-4 animate-bounce" />
                <h2 className="text-4xl font-headline font-bold text-white mb-2">MISSION TERMINATED</h2>
                <p className="text-muted-foreground mb-6">Sector collapse. Synchronization failed.</p>
                <Button onClick={initBoard} size="lg" className="bg-destructive hover:bg-destructive/80">REBOOT SYSTEM</Button>
              </div>
            )}
            {isWin && (
              <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <Trophy className="w-16 h-16 text-primary mb-4 animate-pulse" />
                <h2 className="text-4xl font-headline font-bold text-white mb-2">VICTORY ACHIEVED</h2>
                <p className="text-white/80 mb-6">Synchronization 100%. Advancing coordinates.</p>
              </div>
            )}
            {isLocked && (
              <div className="absolute inset-4 z-40 bg-black/40 backdrop-blur-[2px] border-2 border-destructive/20 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
                <Lock className="w-12 h-12 text-destructive animate-pulse mb-2" />
                <span className="text-destructive font-bold text-xs uppercase tracking-[0.5em]">Systems Frozen</span>
                <span className="text-[10px] text-muted-foreground mt-1">Interact to resume flow</span>
              </div>
            )}

            <div className="flex-1 relative p-12 overflow-hidden flex items-center justify-center">
              <div 
                className={cn("relative transition-all duration-500", isLocked && "opacity-50 grayscale")} 
                style={{ width: `${GRID_SIZE * HEX_WIDTH}px`, height: `${(GRID_SIZE - 1) * HEX_WIDTH}px`, marginLeft: `-${HEX_WIDTH/2}px` }}
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

            <div className="w-full h-24 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent border-t border-primary/40 flex items-center justify-center gap-12 px-12 z-40 mt-auto">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-primary font-headline text-[10px] uppercase tracking-[0.5em] font-bold">
                  <Shield className="w-4 h-4" /> Vanguard Wall
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-sm bg-primary/40" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-secondary font-headline text-[10px] uppercase tracking-[0.5em] font-bold opacity-60">
                <Cpu className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} /> Stable Base
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/4 space-y-6">
        <Card className="glass-morphism p-6 h-full flex flex-col border-white/10">
          <h2 className="font-headline text-xl font-bold mb-4 text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Archive Logs
          </h2>
          <div className="flex-1 italic text-muted-foreground leading-relaxed text-sm overflow-y-auto max-h-[400px] pr-2">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {lore}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <Atom className="w-4 h-4 text-secondary animate-spin" style={{ animationDuration: '4s' }} />
              Scanner: {isProcessing ? "Processing..." : "Ready"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
