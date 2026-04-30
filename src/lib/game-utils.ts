
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
export const HEX_HEIGHT = Math.sqrt(3)/2 * HEX_WIDTH;

export function axialToPixel(q: number, r: number) {
  const x = HEX_WIDTH * (3/2 * q);
  const y = HEX_WIDTH * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
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
  return dq <= 1 && dr <= 1 && ds <= 1 && (dq + dr + ds) !== 0;
}

export function getNeighbors(q: number, r: number) {
  return [
    { q: q + 1, r: r }, { q: q + 1, r: r - 1 }, { q: q, r: r - 1 },
    { q: q - 1, r: r }, { q: q - 1, r: r + 1 }, { q: q, r: r + 1 }
  ];
}

// Check for matches of 3+ in rows
export function findMatches(entities: CelestialEntity[]): { matches: string[], supernovas: string[], blackholes: string[] } {
  const gridMap = new Map<string, CelestialEntity>();
  entities.forEach(e => gridMap.set(`${e.q},${e.r}`, e));

  const matchedIds = new Set<string>();
  const supernovas: string[] = [];
  const blackholes: string[] = [];

  // Directions for hexagonal matching: horizontal, top-left diagonal, top-right diagonal
  const directions = [
    { dq: 1, dr: 0 },   // horizontal
    { dq: 0, dr: 1 },   // top-right diagonal
    { dq: 1, dr: -1 },  // top-left diagonal
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
