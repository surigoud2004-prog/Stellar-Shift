
"use client";

import { useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_COLS, GRID_ROWS } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, FastForward, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Board() {
  const { 
    entities, isGameOver, isWin, isWarping, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, isFlashing, level, targetScore,
    powerUps, triggerColorNuke
  } = useGameState();

  const handleSelect = useCallback((id: string) => {
    if (isProcessing || isGameOver || isWin || isWarping) return;
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
  }, [selectedId, entities, isProcessing, isGameOver, isWin, isWarping, setSelectedId, swapEntities]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full h-full max-w-[95vw]">
      {/* High-Contrast Negative Flash Overlay */}
      {isFlashing && (
        <div className="fixed inset-0 z-[10000] bg-white mix-blend-difference pointer-events-none animate-negative-flash" />
      )}

      {/* Power-Up HUD Sidebar (Integrated into Board Area) */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex flex-col gap-4">
         {powerUps.colorNuke > 0 && (
           <button 
             onClick={triggerColorNuke}
             disabled={isProcessing || isGameOver || isWin || isWarping}
             className="w-16 h-16 rounded-2xl bg-primary flex flex-col items-center justify-center border-b-4 border-primary-foreground/30 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-90 transition-all group"
           >
              <Zap className="w-8 h-8 text-white group-hover:animate-pulse" />
              <span className="text-[10px] font-black text-white mt-1">{powerUps.colorNuke}</span>
           </button>
         )}
      </div>

      {/* 9x7 High-Density Sector Grid Centered */}
      <div className={cn(
        "stellar-grid-frame p-4 flex items-center justify-center relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border-primary/10 overflow-visible transition-all duration-1000",
        isWarping && "scale-90 opacity-40 blur-[10px]"
      )}>
        <div 
          className="relative transition-all duration-500" 
          style={{ 
            width: `${GRID_COLS * HEX_WIDTH}px`, 
            height: `${GRID_ROWS * HEX_WIDTH}px`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {entities.map((entity) => (
            <Entity 
              key={entity.id} 
              entity={entity} 
              isSelected={selectedId === entity.id} 
              onSelect={handleSelect} 
              disabled={isProcessing || isGameOver || isWin || isWarping} 
            />
          ))}

          {isWarping && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-in zoom-in duration-500">
               <FastForward className="w-16 h-16 text-primary animate-pulse mb-4" />
               <h3 className="text-2xl font-black text-white uppercase italic tracking-widest text-center">
                 Warping to Sector {level + 1}
               </h3>
               <p className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.5em] mt-2">
                 CALIBRATING NEURAL LINK...
               </p>
            </div>
          )}

          {(isGameOver || isWin) && !isWarping && (
            <div className="absolute inset-[-20px] md:inset-[-40px] z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl rounded-[3rem] animate-in zoom-in duration-300 border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.3)]">
              {isWin ? (
                <>
                  <Trophy className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter">Mission Victory</h2>
                  <p className="text-primary font-bold uppercase tracking-widest mb-4">Level {level} Secured</p>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-6 grayscale opacity-50">🌑</div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter">Link Severed</h2>
                </>
              )}
              <Button 
                onClick={initBoard} 
                size="lg" 
                className="bg-primary hover:bg-primary/80 active:scale-95 transition-all font-black uppercase tracking-widest px-12 h-16 rounded-full text-lg shadow-2xl"
              >
                <RotateCcw className="w-5 h-5 mr-3" /> Reboot Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
