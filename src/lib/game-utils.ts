
export type EntityType = 0 | 1 | 2 | 3 | 4 | 5;

export interface CelestialEntity {
  id: string;
  type: EntityType;
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  isMatched?: boolean;
  special?: 'supernova' | 'blackhole' | null;
}

export const GRID_SIZE = 8;
export const HEX_WIDTH = 64;

// Pointy Top Hex Math
export function axialToPixel(q: number, r: number) {
  const size = HEX_WIDTH / 1.7; // Adjusting size for better fit
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
}

// Convert column/row to axial for a rectangular layout
export function offsetToAxial(col: number, row: number) {
  const q = col - Math.floor(row / 2);
  const r = row;
  return { q, r };
}

export function generateRandomEntity(q: number, r: number): CelestialEntity {
  return {
    id: Math.random().toString(36).substring(7),
    type: Math.floor(Math.random() * 6) as EntityType,
    q,
    r,
    special: null
  };
}

export function areAdjacent(a: CelestialEntity, b: CelestialEntity): boolean {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs((a.q + a.r) - (b.q + b.r));
  // In axial, neighbors are exactly 1 unit away in distance
  return dq <= 1 && dr <= 1 && ds <= 1 && (dq + dr + ds) !== 0;
}

export function findMatches(entities: CelestialEntity[]): { matches: string[], supernovas: string[], blackholes: string[] } {
  const gridMap = new Map<string, CelestialEntity>();
  entities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

  const matchedIds = new Set<string>();
  const supernovas: string[] = [];
  const blackholes: string[] = [];

  // Directions for pointy top matching: horizontal, and two diagonals
  const directions = [
    { dq: 1, dr: 0 },   // East
    { dq: 0, dr: 1 },   // South-East
    { dq: -1, dr: 1 },  // South-West
  ];

  entities.forEach(entity => {
    directions.forEach(dir => {
      const line = [entity.id];
      let current = entity;
      
      while (true) {
        const nextQ = current.q + dir.dq;
        const nextR = current.r + dir.dr;
        const next = gridMap.get(`${nextQ},${nextR}`);
        if (next && next.type === entity.type) {
          line.push(next.id);
          current = next;
        } else {
          break;
        }
      }

      if (line.length >= 3) {
        line.forEach(id => matchedIds.add(id));
        if (line.length === 4) supernovas.push(entity.id);
        if (line.length >= 5) blackholes.push(entity.id);
      }
    });
  });

  return { 
    matches: Array.from(matchedIds), 
    supernovas, 
    blackholes 
  };
}
