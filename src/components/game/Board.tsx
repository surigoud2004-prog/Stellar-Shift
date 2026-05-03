"use client";

import { useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_COLS, GRID_ROWS } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

export function Board() {
  const { 
    entities, isGameOver, isWin, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard
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

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full h-full max-w-[95vw]">
      {/* 9x7 High-Density Sector Grid Centered */}
      <div className="stellar-grid-frame p-4 flex items-center justify-center relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border-primary/10 overflow-visible">
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
              disabled={isProcessing || isGameOver || isWin} 
            />
          ))}

          {(isGameOver || isWin) && (
            <div className="absolute inset-[-20px] md:inset-[-40px] z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl rounded-[3rem] animate-in zoom-in duration-300 border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.3)]">
              {isWin ? (
                <>
                  <Trophy className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter">Mission Victory</h2>
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
