
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  CelestialEntity, 
  generateRandomEntity, 
  findMatches, 
  GRID_SIZE, 
  offsetToAxial
} from '@/lib/game-utils';
import { generateDynamicLore } from '@/ai/flows/dynamic-lore-generation';

export function useGameState() {
  const [entities, setEntities] = useState<CelestialEntity[]>([]);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState({ stars: 0, nebulae: 0, target: 100 });
  const [lore, setLore] = useState<string>("Welcome to the cosmos, explorer. Align the celestial bodies to power your journey.");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Board as a Rectangle
  useEffect(() => {
    const initial: CelestialEntity[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { q, r } = offsetToAxial(col, row);
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
      
      const points = matches.length * 10;
      setScore(prev => prev + points);
      
      if (blackholes.length > 0) {
        triggerLore("Black Hole Triggered", "A massive cosmic collapse has occurred.");
      } else if (supernovas.length > 0) {
        triggerLore("Supernova Achieved", "Energy levels surging across the sector.");
      } else if (matches.length > 10) {
        triggerLore("Great Alignment", "Multiple celestial bodies matched in one cycle.");
      }

      // Filter out matched entities
      let updated = currentEntities.filter(e => !matches.includes(e.id));
      
      // Hexagonal Gravity Refill
      const finalEntities = [...updated];
      const gridMap = new Map<string, CelestialEntity>();
      finalEntities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

      for (let col = 0; col < GRID_SIZE; col++) {
        let holes = 0;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          const { q, r } = offsetToAxial(col, row);
          const key = `${q},${r}`;
          
          if (!gridMap.has(key)) {
            holes++;
          } else if (holes > 0) {
            const e = gridMap.get(key)!;
            gridMap.delete(key);
            const targetAxial = offsetToAxial(col, row + holes);
            e.q = targetAxial.q;
            e.r = targetAxial.r;
            gridMap.set(`${e.q},${e.r}`, e);
          }
        }
        // Fill top
        for (let h = 0; h < holes; h++) {
          const { q, r } = offsetToAxial(col, h);
          const newE = generateRandomEntity(q, r);
          finalEntities.push(newE);
        }
      }

      setEntities(finalEntities);
      setTimeout(() => handleMatch(finalEntities), 600);
    } else {
      setIsProcessing(false);
    }
  }, [triggerLore]);

  const swapEntities = useCallback(async (id1: string, id2: string) => {
    if (isProcessing) return;

    const newEntities = entities.map(e => ({ ...e }));
    const idx1 = newEntities.findIndex(e => e.id === id1);
    const idx2 = newEntities.findIndex(e => e.id === id2);
    
    if (idx1 === -1 || idx2 === -1) return;

    // Swap axial coordinates
    const q1 = newEntities[idx1].q;
    const r1 = newEntities[idx1].r;
    newEntities[idx1].q = newEntities[idx2].q;
    newEntities[idx1].r = newEntities[idx2].r;
    newEntities[idx2].q = q1;
    newEntities[idx2].r = r1;

    const { matches } = findMatches(newEntities);
    
    if (matches.length === 0) {
      setLore("The stars refuse to shift. No resonance found in this alignment.");
      return; // Revert
    }
    
    setIsProcessing(true);
    setEntities(newEntities);
    setTimeout(() => handleMatch(newEntities), 200);
  }, [entities, handleMatch, isProcessing]);

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
