"use client";

import { useEffect, useState, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Board() {
  const { 
    entities, score, targetScore, timeLeft, level,
    isGameOver, isWin, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard,
    gameStarted, startGame
  } = useGameState();

  const handleSelect = useCallback((id: string) => {
    if (isProcessing || isGameOver || isWin) return;
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
  }, [selectedId, entities, isProcessing, isGameOver, isWin, setSelectedId, swapEntities]);

  const progress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 w-full h-full">
      <div className="nebula-bg" />
      
      {/* Header Stats */}
      <div className="w-full max-w-[500px] flex justify-between items-end mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Target Score</span>
          <div className="text-4xl font-black text-white tabular-nums">{score} / {targetScore}</div>
          <Progress value={progress} className="h-1.5 w-full bg-white/10" />
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Time Left</span>
          <div className={cn("text-2xl font-bold tabular-nums", timeLeft < 10 ? "text-destructive animate-pulse" : "text-white")}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="stellar-grid-frame p-6">
        {!gameStarted ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <h1 className="text-5xl font-black text-white mb-8 italic uppercase tracking-tighter">Stellar Shift</h1>
            <Button size="lg" onClick={startGame} className="bg-primary hover:bg-primary/80 h-16 px-12 text-xl font-black uppercase tracking-widest rounded-full">
              <Play className="w-6 h-6 mr-2 fill-white" /> Start Mission
            </Button>
          </div>
        ) : (
          <div 
            className="relative" 
            style={{ 
              width: `${GRID_SIZE * HEX_WIDTH}px`, 
              height: `${GRID_SIZE * HEX_WIDTH}px`,
              transform: `scale(${Math.min(1, 400 / (GRID_SIZE * HEX_WIDTH))})`,
              transformOrigin: 'center center'
            }}
          >
            {entities.map((entity) => (
              <Entity 
                key={entity.id} 
                entity={entity} 
                isSelected={selectedId === entity.id} 
                onSelect={handleSelect} 
                disabled={isProcessing || isGameOver || isWin} 
              />
            ))}

            {(isGameOver || isWin) && (
              <div className="absolute inset-[-40px] z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl animate-in zoom-in duration-300">
                {isWin ? (
                  <>
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
                    <h2 className="text-4xl font-black text-white mb-6 uppercase">Victory</h2>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🌑</div>
                    <h2 className="text-4xl font-black text-white mb-6 uppercase">Failed</h2>
                  </>
                )}
                <Button onClick={initBoard} size="lg" className="bg-white text-black hover:bg-white/80 font-bold uppercase tracking-widest">
                  <RotateCcw className="w-4 h-4 mr-2" /> Restart
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">
        Align Shards to Stabilize Sector
      </div>
    </div>
  );
}