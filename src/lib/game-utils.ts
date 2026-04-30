
export type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SpecialType = 'nova-h' | 'nova-v' | 'black-hole' | 'bomb' | 'comet' | null;

export interface CelestialEntity {
  id: string;
  type: EntityType;
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  special: SpecialType;
}

export const GRID_SIZE = 8;
export const HEX_WIDTH = 64;

export function calculateDifficulty(level: number): number {
  // P = P0 * (1 + r)^n -> level 1 is baseline.
  // Using user requested multiplier formula approximation
  return Math.pow(1.05, level - 1);
}

export function getColorVariety(level: number): number {
  return Math.min(8, 4 + Math.floor(level / 10));
}

export function axialToPixel(q: number, r: number) {
  const size = HEX_WIDTH / 1.7;
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
}

export function offsetToAxial(col: number, row: number) {
  const q = col - Math.floor(row / 2);
  const r = row;
  return { q, r };
}

export function generateRandomEntity(q: number, r: number, variety: number = 6): CelestialEntity {
  return {
    id: Math.random().toString(36).substring(7),
    type: Math.floor(Math.random() * variety) as EntityType,
    q,
    r,
    special: null
  };
}

export function areAdjacent(a: CelestialEntity, b: CelestialEntity): boolean {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs((a.q + a.r) - (b.q + b.r));
  return dq <= 1 && dr <= 1 && ds <= 1 && (dq + dr + ds) !== 0;
}

export interface MatchResult {
  matches: string[];
  specialToSpawn?: {
    id: string;
    type: SpecialType;
    entityType: EntityType;
    q: number;
    r: number;
  };
}

export function findMatches(entities: CelestialEntity[], lastMoveId?: string): MatchResult {
  const gridMap = new Map<string, CelestialEntity>();
  entities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

  const matchedIds = new Set<string>();
  let specialToSpawn: MatchResult['specialToSpawn'] = undefined;

  const directions = [
    { dq: 1, dr: 0, name: 'h' },
    { dq: 0, dr: 1, name: 'v1' },
    { dq: -1, dr: 1, name: 'v2' },
  ];

  const matchGroups: Set<string>[] = [];

  entities.forEach(entity => {
    directions.forEach(dir => {
      const group = new Set<string>();
      group.add(entity.id);
      let checkQ = entity.q + dir.dq;
      let checkR = entity.r + dir.dr;
      
      while (true) {
        const next = gridMap.get(`${checkQ},${checkR}`);
        if (next && next.type === entity.type && !next.special) {
          group.add(next.id);
          checkQ += dir.dq;
          checkR += dir.dr;
        } else {
          break;
        }
      }

      if (group.size >= 3) {
        matchGroups.push(group);
        group.forEach(id => matchedIds.add(id));
      }
    });
  });

  // Identify special spawn if a lastMoveId is provided
  if (lastMoveId) {
    const movedEntity = entities.find(e => e.id === lastMoveId);
    if (movedEntity) {
      // Find the group containing this entity
      const relevantGroups = matchGroups.filter(g => g.has(lastMoveId));
      
      // Check for 5-match (Black Hole)
      const fiveMatch = relevantGroups.find(g => g.size >= 5);
      if (fiveMatch) {
        specialToSpawn = { id: lastMoveId, type: 'black-hole', entityType: movedEntity.type, q: movedEntity.q, r: movedEntity.r };
      } 
      // Check for 4-match (Nova Beam)
      else {
        const fourMatch = relevantGroups.find(g => g.size === 4);
        if (fourMatch) {
          specialToSpawn = { id: lastMoveId, type: 'nova-h', entityType: movedEntity.type, q: movedEntity.q, r: movedEntity.r };
        }
        // Check for T/L shape (Bomb) - if entity is in multiple groups
        else if (relevantGroups.length >= 2) {
          specialToSpawn = { id: lastMoveId, type: 'bomb', entityType: movedEntity.type, q: movedEntity.q, r: movedEntity.r };
        }
      }
    }
  }

  return { 
    matches: Array.from(matchedIds), 
    specialToSpawn 
  };
}
