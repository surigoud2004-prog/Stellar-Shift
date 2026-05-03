
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState as useGameStateHook } from '@/hooks/useGameState';

const GameStateContext = createContext<ReturnType<typeof useGameStateHook> | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const gameState = useGameStateHook();
  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
