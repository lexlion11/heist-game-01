// COLD SIGNAL — the building. Walls, doors, cover, the vault and the getaway.
// Everything the thief can walk into or hide behind lives here, so the other
// modules only ever ask this one where a thing is.

export const WORLD = { width: 1280, height: 800 };

// The four rooms of the Meridian Signal Annex, laid out as a 2x2 block.
export const ROOMS = [
  { id: 'atrium', name: 'ATRIUM', sub: 'north-west', x: 60, y: 80, w: 580, h: 340, tint: '#12293a', accent: '#2fd3c4' },
  { id: 'vault', name: 'SIGNAL VAULT', sub: 'north-east', x: 640, y: 80, w: 580, h: 340, tint: '#261a3a', accent: '#ff5edb' },
  { id: 'dock', name: 'SERVICE DOCK', sub: 'south-west', x: 60, y: 420, w: 580, h: 340, tint: '#16301f', accent: '#8ce06a' },
  { id: 'cold', name: 'COLD STORE', sub: 'south-east', x: 640, y: 420, w: 580, h: 340, tint: '#152630', accent: '#5aa9ff' },
];

// Solid walls, drawn as slabs. Doorways are the gaps between them.
export const WALLS = [
  // outer shell
  { x: 60, y: 80, w: 1160, h: 14 },
  { x: 60, y: 746, w: 1160, h: 14 },
  { x: 60, y: 80, w: 14, h: 680 },
  { x: 1206, y: 80, w: 14, h: 680 },
  // the spine wall between west and east rooms
  { x: 640, y: 80, w: 14, h: 40 },
  { x: 640, y: 190, w: 14, h: 110 },
  { x: 640, y: 360, w: 14, h: 140 },
  { x: 640, y: 570, w: 14, h: 190 },
  // the spine wall between north and south rooms
  { x: 60, y: 420, w: 80, h: 14 },
  { x: 210, y: 420, w: 190, h: 14 },
  { x: 470, y: 420, w: 530, h: 14 },
  { x: 1070, y: 420, w: 150, h: 14 },
];

// Cover: pillars, crates, shelving, desks, the van. These break line of sight.
export const COVER = [
  // service dock
  { x: 110, y: 455, w: 70, h: 55, kind: 'crate' },
  { x: 200, y: 455, w: 70, h: 55, kind: 'crate' },
  { x: 300, y: 600, w: 140, h: 70, kind: 'van' },
  { x: 430, y: 460, w: 90, h: 45, kind: 'desk' },
  { x: 520, y: 650, w: 44, h: 44, kind: 'pillar' },
  // cold store
  { x: 680, y: 470, w: 36, h: 170, kind: 'shelf' },
  { x: 760, y: 470, w: 36, h: 170, kind: 'shelf' },
  { x: 900, y: 470, w: 80, h: 60, kind: 'crate' },
  { x: 1000, y: 620, w: 150, h: 50, kind: 'bench' },
  { x: 1120, y: 470, w: 44, h: 44, kind: 'pillar' },
  // atrium
  { x: 130, y: 120, w: 46, h: 46, kind: 'pillar' },
  { x: 280, y: 120, w: 46, h: 46, kind: 'pillar' },
  { x: 430, y: 120, w: 46, h: 46, kind: 'pillar' },
  { x: 130, y: 300, w: 46, h: 46, kind: 'pillar' },
  { x: 280, y: 300, w: 46, h: 46, kind: 'pillar' },
  { x: 430, y: 300, w: 46, h: 46, kind: 'pillar' },
  { x: 72, y: 185, w: 80, h: 50, kind: 'desk' },
  // signal vault
  { x: 672, y: 112, w: 90, h: 50, kind: 'pedestal' },
  { x: 1120, y: 112, w: 60, h: 50, kind: 'pedestal' },
  { x: 690, y: 300, w: 80, h: 55, kind: 'crate' },
  { x: 1080, y: 320, w: 80, h: 50, kind: 'crate' },
  { x: 830, y: 120, w: 44, h: 44, kind: 'pillar' },
];

// Doorways: openings between rooms, drawn as glowing thresholds.
export const DOORS = [
  { x: 626, y: 120, w: 42, h: 70, rooms: ['atrium', 'vault'], label: 'A2' },
  { x: 626, y: 300, w: 42, h: 60, rooms: ['atrium', 'vault'], label: 'A3' },
  { x: 626, y: 500, w: 42, h: 70, rooms: ['dock', 'cold'], label: 'S1' },
  { x: 140, y: 406, w: 70, h: 42, rooms: ['dock', 'atrium'], label: 'S2' },
  { x: 400, y: 406, w: 70, h: 42, rooms: ['dock', 'atrium'], label: 'S3' },
  { x: 1000, y: 406, w: 70, h: 42, rooms: ['cold', 'vault'], label: 'S4' },
];

export const VAULT = { x: 940, y: 250, w: 80, h: 80 };
export const EXIT_ZONE = { x: 88, y: 660, w: 76, h: 76 };
export const SPAWN = { x: 210, y: 690 };

// The loot itself: glowing signal crystals sitting on the pedestals around
// the vault. They are the thing the thief is here for.
export const LOOT_CRYSTALS = [
  { x: 700, y: 137 },
  { x: 1150, y: 137 },
  { x: 700, y: 328 },
  { x: 1150, y: 345 },
];

/** The room a point sits in, or null when the point is in a wall. */
export function roomAt(x, y) {
  for (const room of ROOMS) {
    if (x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h) return room;
  }
  return null;
}

/** True when a circle at (x, y) overlaps any solid rect (walls and cover). */
export function circleHitsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

/** True when a circle at (x, y) overlaps any wall or any cover. */
export function blockedAt(x, y, radius) {
  for (const wall of WALLS) if (circleHitsRect(x, y, radius, wall)) return true;
  for (const cover of COVER) if (circleHitsRect(x, y, radius, cover)) return true;
  return false;
}

/** True when the segment from (x1, y1) to (x2, y2) is cut by a wall or cover. */
export function segmentBlocked(x1, y1, x2, y2) {
  return segmentHitsAny(x1, y1, x2, y2, WALLS) || segmentHitsAny(x1, y1, x2, y2, COVER);
}

/** Liang-Barsky style segment/rect test. */
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const edges = [
    [-dx, x1 - rect.x],
    [dx, rect.x + rect.w - x1],
    [-dy, y1 - rect.y],
    [dy, rect.y + rect.h - y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return true;
}

function segmentHitsAny(x1, y1, x2, y2, rects) {
  for (const rect of rects) if (segmentHitsRect(x1, y1, x2, y2, rect)) return true;
  return false;
}

/** Distance between two points. */
export function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

/** Shortest signed difference between two angles, in radians. */
export function angleDelta(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
