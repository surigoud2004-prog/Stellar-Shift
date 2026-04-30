
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE, 
  EntityType 
} from '@/lib/game-utils';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState({ stars: 0, nebulae: 0, target: 100 });
  const [lore, setLore] = useState<string>("Welcome to the cosmos, explorer. Align the celestial bodies to power your journey.");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Board
  useEffect(() => {
    const initial: CelestialEntity[] = [];
    for (let q = 0; q < GRID_SIZE; q++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        // Hex grid boundaries often need offset adjustment for 'rectangular' layout
        // We'll use a simple axial grid but keep it within bounds
        initial.push(generateRandomEntity(q, r));
      }
    }
    setEntities(initial);
  }, []);

  const triggerLore = useCallback(async (event: string, context?: string) => {
    try {
      const result = await generateDynamicLore({ gameEventDescription: event, gameContext: context });
      setLore(result.loreSnippet);
    } catch (e) {
      console.error("Lore generation failed", e);
    }
  }, []);

  const handleMatch = useCallback(async (currentEntities: CelestialEntity[]) => {
    const { matches, supernovas, blackholes } = findMatches(currentEntities);
    
    if (matches.length > 0) {
      setIsProcessing(true);
      
      // Update score and goals
      const points = matches.length * 10;
      setScore(prev => prev + points);
      
      // Detect special events
      if (blackholes.length > 0) {
        triggerLore("Black Hole Triggered", "A massive cosmic collapse has occurred.");
      } else if (supernovas.length > 0) {
        triggerLore("Supernova Achieved", "Energy levels surging across the sector.");
      } else if (matches.length > 10) {
        triggerLore("Great Alignment", "Multiple celestial bodies matched in one cycle.");
      }

      // Filter out matched entities
      let updated = currentEntities.filter(e => !matches.includes(e.id));
      
      // Simulate gravity (simplified for axial)
      // Entities with empty space below them (higher R at same Q) should fall
      // This is a naive implementation for the POC
      const finalEntities = Array.from(updated);
      const gridMap = new Map<string, CelestialEntity>();
      finalEntities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

      for (let q = 0; q < GRID_SIZE; q++) {
        let holes = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          const key = `${q},${r}`;
          if (!gridMap.has(key)) {
            holes++;
          } else if (holes > 0) {
            const e = gridMap.get(key)!;
            gridMap.delete(key);
            e.r += holes;
            gridMap.set(`${q},${e.r}`, e);
          }
        }
        // Fill top
        for (let h = 0; h < holes; h++) {
          const newE = generateRandomEntity(q, h);
          finalEntities.push(newE);
        }
      }

      setEntities(Array.from(finalEntities));
      
      // Recursively check for new matches after gravity
      setTimeout(() => handleMatch(finalEntities), 600);
    } else {
      setIsProcessing(false);
    }
  }, [triggerLore]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing) return;

    setEntities(prev => {
      const newEntities = [...prev];
      const idx1 = newEntities.findIndex(e => e.id === id1);
      const idx2 = newEntities.findIndex(e => e.id === id2);
      
      if (idx1 === -1 || idx2 === -1) return prev;

      // Swap coordinates
      const tempQ = newEntities[idx1].q;
      const tempR = newEntities[idx1].r;
      newEntities[idx1].q = newEntities[idx2].q;
      newEntities[idx1].r = newEntities[idx2].r;
      newEntities[idx2].q = tempQ;
      newEntities[idx2].r = tempR;

      // Check if this swap creates a match
      const { matches } = findMatches(newEntities);
      if (matches.length === 0) {
        // Revert swap (visualize this if possible)
        return prev;
      }
      
      setTimeout(() => handleMatch(newEntities), 300);
      return newEntities;
    });
  }, [handleMatch, isProcessing]);

  return {
    entities,
    score,
    goals,
    lore,
    selectedId,
    setSelectedId,
    swapEntities,
    isProcessing
  };
}
