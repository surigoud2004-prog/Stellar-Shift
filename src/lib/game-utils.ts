export type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SpecialType = 'nova-h' | 'black-hole' | 'bomb' | 'comet' | null;

export interface CelestialEntity {
  id: string;
  type: EntityType;
  q: number; // column
  r: number; // row
  special: SpecialType;
  isMatched?: boolean;
  isExploding?: boolean;
}

// Recalibrated for 7x5 Sector Grid
export const GRID_COLS = 7;
export const GRID_ROWS = 5;
export const HEX_WIDTH = 64;

function generateStableId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `shard-${crypto.randomUUID()}`;
  }
  return `shard-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
}

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
  const horizontalGroups: Set<string>[] = [];
  const verticalGroups: Set<string>[] = [];

  // Horizontal matches (Across Columns)
  for (let r = 0; r < GRID_ROWS; r++) {
    let count = 1;
    for (let q = 1; q < GRID_COLS; q++) {
      if (grid[r][q] && grid[r][q-1] && grid[r][q].type === grid[r][q-1].type) {
        count++;
      } else {
        if (count >= 3) {
          const group = new Set<string>();
          for (let i = 0; i < count; i++) group.add(grid[r][q - 1 - i]!.id);
          horizontalGroups.push(group);
        }
        count = 1;
      }
    }
    if (count >= 3) {
      const group = new Set<string>();
      for (let i = 0; i < count; i++) group.add(grid[r][GRID_COLS - 1 - i]!.id);
      horizontalGroups.push(group);
    }
  }

  // Vertical matches (Across Rows)
  for (let q = 0; q < GRID_COLS; q++) {
    let count = 1;
    for (let r = 1; r < GRID_ROWS; r++) {
      if (grid[r][q] && grid[r-1][q] && grid[r][q].type === grid[r-1][q].type) {
        count++;
      } else {
        if (count >= 3) {
          const group = new Set<string>();
          for (let i = 0; i < count; i++) group.add(grid[r - 1 - i][q]!.id);
          verticalGroups.push(group);
        }
        count = 1;
      }
    }
    if (count >= 3) {
      const group = new Set<string>();
      for (let i = 0; i < count; i++) group.add(grid[GRID_ROWS - 1 - i][q]!.id);
      verticalGroups.push(group);
    }
  }

  horizontalGroups.forEach(g => g.forEach(id => matchedIds.add(id)));
  verticalGroups.forEach(g => g.forEach(id => matchedIds.add(id)));

  let specialToSpawn: MatchResult['specialToSpawn'] = undefined;
  if (lastMoveId) {
    const moved = entities.find(e => e.id === lastMoveId);
    if (moved) {
      const hGroup = horizontalGroups.find(g => g.has(lastMoveId));
      const vGroup = verticalGroups.find(g => g.has(lastMoveId));
      if (hGroup && vGroup) {
        specialToSpawn = { id: generateStableId(), type: 'bomb', entityType: moved.type, q: moved.q, r: moved.r };
      } else if ((hGroup && hGroup.size >= 5) || (vGroup && vGroup.size >= 5)) {
        specialToSpawn = { id: generateStableId(), type: 'black-hole', entityType: moved.type, q: moved.q, r: moved.r };
      } else if ((hGroup && hGroup.size === 4) || (vGroup && vGroup.size === 4)) {
        specialToSpawn = { id: generateStableId(), type: 'nova-h', entityType: moved.type, q: moved.q, r: moved.r };
      }
    }
  }

  return { matches: Array.from(matchedIds), specialToSpawn };
}
