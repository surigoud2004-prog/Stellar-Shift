"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_COLS, GRID_ROWS } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, FastForward, Zap, Power, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logAnalyticsEvent } from '@/firebase';

interface BoardProps {
  onShowShop?: () => void;
}

export function Board({ onShowShop }: BoardProps) {
  const { 
    entities, isGameOver, isWin, isWarping, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, isFlashing, isShaking, level, 
    powerUps, triggerColorNuke, quitGame, lasers, revive
  } = useGameState();

  const [isAdReviving, setIsAdReviving] = useState(false);
  const [boardScale, setBoardScale] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);

  // Responsive Board Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      if (!boardRef.current) return;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const boardWidth = GRID_COLS * HEX_WIDTH + 100; // Including padding
      const boardHeight = GRID_ROWS * HEX_WIDTH + 150; 
      
      const horizontalScale = (screenWidth * 0.95) / boardWidth;
      const verticalScale = (screenHeight * 0.6) / boardHeight;
      
      const newScale = Math.min(1, horizontalScale, verticalScale);
      setBoardScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleReviveWithAd = () => {
    setIsAdReviving(true);
    logAnalyticsEvent('game_over_revive_ad_started');
    setTimeout(() => {
      revive(20);
      setIsAdReviving(false);
      logAnalyticsEvent('game_over_revive_ad_completed');
    }, 5000);
  };

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
      "relative flex flex-col items-center justify-center p-2 w-full h-full",
      isShaking && "animate-shake"
    )}>
      {isFlashing && (
        <div className="fixed inset-0 z-[10000] bg-white mix-blend-difference pointer-events-none animate-negative-flash" />
      )}

      {/* Side Actions (Responsive Positioning) */}
      <div className="fixed bottom-32 md:bottom-auto md:left-[5%] md:top-1/2 md:-translate-y-1/2 flex flex-row md:flex-col gap-4 z-[1000]">
         {powerUps.colorNuke > 0 && (
           <button 
             onClick={triggerColorNuke}
             disabled={isProcessing || isGameOver || isWin || isWarping}
             className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex flex-col items-center justify-center border-b-4 border-primary-foreground/30 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-90 transition-all group"
           >
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:animate-pulse" />
              <span className="text-[10px] font-black text-white mt-0.5 md:mt-1">{powerUps.colorNuke}</span>
           </button>
         )}
      </div>

      <div className="responsive-board-wrapper" style={{ transform: `scale(${boardScale})` }}>
        <div 
          ref={boardRef}
          className={cn(
            "stellar-grid-frame p-4 flex items-center justify-center relative transition-all duration-1000",
            isWarping && "scale-90 opacity-40 blur-[10px]"
          )}
        >
          <div 
            className="relative transition-all duration-500" 
            style={{ 
              width: `${GRID_COLS * HEX_WIDTH}px`, 
              height: `${GRID_ROWS * HEX_WIDTH}px`,
            }}
          >
            {electricalArc}
            
            {lasers.map((laser) => (
               <div 
                 key={laser.id}
                 className={cn(
                   "absolute z-[60] bg-white shadow-[0_0_20px_white,0_0_40px_white] animate-laser",
                   laser.type === 'h' 
                     ? "inset-x-[-100px] h-4 top-[var(--laser-pos)]" 
                     : "inset-y-[-100px] w-4 left-[var(--laser-pos)]"
                 )}
                 style={{ 
                   ['--laser-pos' as any]: `${laser.pos * HEX_WIDTH + HEX_WIDTH / 2 - 8}px`
                 }}
               />
            ))}

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
                 <FastForward className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse mb-4" />
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-widest text-center">
                   Warping to Sector {level + 1}
                 </h3>
              </div>
            )}

            {(isGameOver || isWin) && !isWarping && (
              <div className="absolute inset-[-10px] md:inset-[-40px] z-[50] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] animate-in zoom-in duration-300 border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.3)] pointer-events-auto">
                {isWin ? (
                  <>
                    <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                    <h2 className="text-2xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter text-center">Mission Accomplished</h2>
                  </>
                ) : (
                  <>
                    <div className="text-6xl md:text-7xl mb-6 grayscale opacity-50 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)] text-center">🌑</div>
                    <h2 className="text-2xl md:text-5xl font-black text-red-500 mb-4 uppercase italic tracking-tighter text-center">Mission Failed</h2>
                  </>
                )}
                
                <div className="flex flex-col gap-3 w-full max-w-xs px-6">
                  {isWin ? (
                    <Button 
                      onClick={() => {
                        if (onShowShop) onShowShop();
                        else initBoard();
                      }} 
                      size="lg" 
                      className="bg-primary hover:bg-primary/80 active:scale-95 transition-all font-black uppercase tracking-widest h-14 md:h-16 rounded-2xl text-base md:text-lg shadow-2xl w-full"
                    >
                      <RotateCcw className="w-5 h-5 mr-3" /> Next Sector
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleReviveWithAd} 
                        disabled={isAdReviving}
                        size="lg" 
                        className={cn(
                          "bg-secondary hover:bg-secondary/80 active:scale-95 transition-all font-black uppercase tracking-widest h-14 md:h-16 rounded-2xl text-base md:text-lg shadow-2xl w-full flex items-center justify-center gap-3",
                          isAdReviving && "opacity-50 grayscale"
                        )}
                      >
                        {isAdReviving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-white" />}
                        {isAdReviving ? "Syncing..." : "Revive Link"}
                      </Button>

                      <Button 
                        onClick={() => {
                          if (onShowShop) onShowShop();
                          else initBoard();
                        }} 
                        variant="outline"
                        size="lg" 
                        disabled={isAdReviving}
                        className="border-white/10 hover:bg-white/5 text-white/80 active:scale-95 transition-all font-black uppercase tracking-widest h-12 md:h-14 rounded-2xl text-sm w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-3" /> Retry Mission
                      </Button>
                    </>
                  )}
                  
                  {!isWin && (
                    <Button 
                      onClick={quitGame} 
                      variant="outline"
                      size="lg" 
                      disabled={isAdReviving}
                      className="border-white/10 hover:bg-white/5 text-white/60 active:scale-95 transition-all font-black uppercase tracking-widest h-12 md:h-14 rounded-2xl text-xs w-full"
                    >
                      <Power className="w-4 h-4 mr-3" /> Abort Mission
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}