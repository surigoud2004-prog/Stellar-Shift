export type EntityType = 0 | 1 | 2 | 3 | 4 | 5;
export type SpecialType = 'nova-h' | 'bomb' | null;

export interface CelestialEntity {
  id: string;
  type: EntityType;
  q: number; // column
  r: number; // row
  special: SpecialType;
  isMatched?: boolean;
  isExploding?: boolean;
}

/**
 * High-Density 9x7 Sector Grid
 */
export const GRID_COLS = 9;
export const GRID_ROWS = 7;
export const HEX_WIDTH = 70;

function generateStableId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `shard-${crypto.randomUUID()}`;
  }
  return `shard-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
}

/**
 * Generates a random entity. 
 * 'variety' determines how many different types can spawn.
 */
export function generateRandomEntity(q: number, r: number, variety: number = 6): CelestialEntity {
  return {
    id: generateStableId(),
    type: Math.floor(Math.random() * variety) as EntityType,
    q,
    r,
    special: null
  };
}

export function areAdjacent(a: CelestialEntity, b: CelestialEntity): boolean {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  return (dq === 1 && dr === 0) || (dq === 0 && dr === 1);
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
  const grid: (CelestialEntity | null)[][] = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
  entities.forEach(e => {
    if (e.q >= 0 && e.q < GRID_COLS && e.r >= 0 && e.r < GRID_ROWS) {
      grid[e.r][e.q] = e;
    }
  });

  const matchedIds = new Set<string>();
  const horizontalGroups: { ids: string[], length: number, type: EntityType, q: number, r: number }[] = [];
  const verticalGroups: { ids: string[], length: number, type: EntityType, q: number, r: number }[] = [];

  // Horizontal detection
  for (let r = 0; r < GRID_ROWS; r++) {
    let count = 1;
    for (let q = 1; q < GRID_COLS; q++) {
      if (grid[r][q] && grid[r][q-1] && grid[r][q].type === grid[r][q-1].type) {
        count++;
      } else {
        if (count >= 3) {
          const ids = [];
          for (let i = 0; i < count; i++) ids.push(grid[r][q - 1 - i]!.id);
          horizontalGroups.push({ ids, length: count, type: grid[r][q-1]!.type, q: grid[r][q-count]!.q, r: r });
        }
        count = 1;
      }
    }
    if (count >= 3) {
      const ids = [];
      for (let i = 0; i < count; i++) ids.push(grid[r][GRID_COLS - 1 - i]!.id);
      horizontalGroups.push({ ids, length: count, type: grid[r][GRID_COLS-1]!.type, q: grid[r][GRID_COLS-count]!.q, r: r });
    }
  }

  // Vertical detection
  for (let q = 0; q < GRID_COLS; q++) {
    let count = 1;
    for (let r = 1; r < GRID_ROWS; r++) {
      if (grid[r][q] && grid[r-1][q] && grid[r][q].type === grid[r-1][q].type) {
        count++;
      } else {
        if (count >= 3) {
          const ids = [];
          for (let i = 0; i < count; i++) ids.push(grid[r - 1 - i][q]!.id);
          verticalGroups.push({ ids, length: count, type: grid[r-1][q]!.type, q: q, r: grid[r-count][q]!.r });
        }
        count = 1;
      }
    }
    if (count >= 3) {
      const ids = [];
      for (let i = 0; i < count; i++) ids.push(grid[GRID_ROWS - 1 - i][q]!.id);
      verticalGroups.push({ ids, length: count, type: grid[GRID_ROWS-1][q]!.type, q: q, r: grid[GRID_ROWS-count][q]!.r });
    }
  }

  horizontalGroups.forEach(g => g.ids.forEach(id => matchedIds.add(id)));
  verticalGroups.forEach(g => g.ids.forEach(id => matchedIds.add(id)));

  let specialToSpawn: MatchResult['specialToSpawn'] = undefined;

  // Decide special spawn based on last move
  if (lastMoveId) {
    const hGroup = horizontalGroups.find(g => g.ids.includes(lastMoveId));
    const vGroup = verticalGroups.find(g => g.ids.includes(lastMoveId));
    const moved = entities.find(e => e.id === lastMoveId);

    if (moved) {
      if ((hGroup && hGroup.length >= 5) || (vGroup && vGroup.length >= 5)) {
        specialToSpawn = { id: generateStableId(), type: 'bomb', entityType: moved.type, q: moved.q, r: moved.r };
      } else if ((hGroup && hGroup.length === 4) || (vGroup && vGroup.length === 4)) {
        specialToSpawn = { id: generateStableId(), type: 'nova-h', entityType: moved.type, q: moved.q, r: moved.r };
      }
    }
  }

  return { matches: Array.from(matchedIds), specialToSpawn };
}
