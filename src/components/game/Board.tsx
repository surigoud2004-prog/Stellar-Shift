
"use client";

import { useCallback, useMemo } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_COLS, GRID_ROWS } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, FastForward, Zap, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Board() {
  const { 
    entities, isGameOver, isWin, isWarping, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, isFlashing, isShaking, level, 
    powerUps, triggerColorNuke, quitGame
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

  // Electrical Arc Visuals
  const electricalArc = useMemo(() => {
    if (!selectedId) return null;
    const sEnt = entities.find(e => e.id === selectedId);
    if (!sEnt || !sEnt.special) return null;

    const adjacentSpecials = entities.filter(e => e.special && areAdjacent(sEnt, e));
    if (adjacentSpecials.length === 0) return null;

    return adjacentSpecials.map(target => {
      const x1 = sEnt.q * HEX_WIDTH + HEX_WIDTH / 2;
      const y1 = sEnt.r * HEX_WIDTH + HEX_WIDTH / 2;
      const x2 = target.q * HEX_WIDTH + HEX_WIDTH / 2;
      const y2 = target.r * HEX_WIDTH + HEX_WIDTH / 2;

      return (
        <svg key={`${sEnt.id}-${target.id}`} className="absolute inset-0 w-full h-full pointer-events-none z-50">
          <line 
            x1={x1} y1={y1} x2={x2} y2={y2} 
            stroke="white" 
            strokeWidth="4" 
            strokeDasharray="10 5" 
            className="animate-pulse opacity-80"
            style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.8))' }}
          />
          <line 
            x1={x1} y1={y1} x2={x2} y2={y2} 
            stroke="rgba(139, 92, 246, 0.4)" 
            strokeWidth="12" 
            className="animate-pulse"
          />
        </svg>
      );
    });
  }, [selectedId, entities]);

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center p-2 w-full h-full max-w-[95vw]",
      isShaking && "animate-shake"
    )}>
      {isFlashing && (
        <div className="fixed inset-0 z-[10000] bg-white mix-blend-difference pointer-events-none animate-negative-flash" />
      )}

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
          {electricalArc}
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
            <div className="absolute inset-[-20px] md:inset-[-40px] z-[50] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl rounded-[3rem] animate-in zoom-in duration-300 border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.3)] pointer-events-auto">
              {isWin ? (
                <>
                  <Trophy className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter">Mission Accomplished</h2>
                  <p className="text-primary font-bold uppercase tracking-widest mb-12">Sector {level} Secured</p>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-6 grayscale opacity-50 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">🌑</div>
                  <h2 className="text-3xl md:text-5xl font-black text-red-500 mb-8 uppercase italic tracking-tighter">Mission Failed</h2>
                  <p className="text-white/40 font-bold uppercase tracking-widest mb-12">Neural Link Severed</p>
                </>
              )}
              
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button 
                  onClick={initBoard} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/80 active:scale-95 transition-all font-black uppercase tracking-widest h-16 rounded-2xl text-lg shadow-2xl w-full"
                >
                  <RotateCcw className="w-5 h-5 mr-3" /> {isWin ? 'Next Sector' : 'Retry Mission'}
                </Button>
                
                {!isWin && (
                  <Button 
                    onClick={quitGame} 
                    variant="outline"
                    size="lg" 
                    className="border-white/10 hover:bg-white/5 text-white/60 active:scale-95 transition-all font-black uppercase tracking-widest h-16 rounded-2xl text-sm w-full"
                  >
                    <Power className="w-4 h-4 mr-3" /> Abort to Menu
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
