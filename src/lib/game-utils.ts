export type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CelestialEntity {
  id: string;
  type: EntityType;
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  isMatched?: boolean;
  special?: 'meteor' | 'timewarp' | 'pulse' | null;
}

export const GRID_SIZE = 8;
export const HEX_WIDTH = 64;

export function calculateDifficulty(level: number): number {
  return Math.pow(1.05, level - 1);
}

export function getColorVariety(level: number): number {
  return Math.min(8, 4 + Math.floor(level / 20));
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

export function findMatches(entities: CelestialEntity[]): { 
  matches: string[], 
  meteorStrike: boolean, 
  timeWarp: boolean, 
  pulseWave: boolean 
} {
  const gridMap = new Map<string, CelestialEntity>();
  entities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

  const matchedIds = new Set<string>();
  let meteorStrike = false;
  let timeWarp = false;
  let pulseWave = false;

  const directions = [
    { dq: 1, dr: 0 },
    { dq: 0, dr: 1 },
    { dq: -1, dr: 1 },
  ];

  entities.forEach(entity => {
    directions.forEach(dir => {
      const line = [entity.id];
      let checkQ = entity.q + dir.dq;
      let checkR = entity.r + dir.dr;
      
      while (true) {
        const next = gridMap.get(`${checkQ},${checkR}`);
        if (next && next.type === entity.type) {
          line.push(next.id);
          checkQ += dir.dq;
          checkR += dir.dr;
        } else {
          break;
        }
      }

      if (line.length >= 3) {
        line.forEach(id => matchedIds.add(id));
        if (line.length === 5) timeWarp = true;
        if (line.length >= 4) meteorStrike = true;
      }
    });

    // Square Check (Simplified for axial hex grid)
    // In hex, we check 3 neighbors that form a tight cluster
    const q = entity.q;
    const r = entity.r;
    const cluster = [
      gridMap.get(`${q+1},${r}`),
      gridMap.get(`${q},${r+1}`),
      gridMap.get(`${q+1},${r-1}`)
    ];
    if (cluster.every(o => o && o.type === entity.type)) {
      pulseWave = true;
      [entity, ...cluster].forEach(o => o && matchedIds.add(o.id));
    }
  });

  // Loose check for complex matches
  if (matchedIds.size > 8) meteorStrike = true; 

  return { 
    matches: Array.from(matchedIds), 
    meteorStrike, 
    timeWarp, 
    pulseWave 
  };
}