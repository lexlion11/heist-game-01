// COLD SIGNAL — guards, their patrol routes and their vision cones.
import { blockedAt, distance, roomAt, segmentBlocked, angleDelta } from './level.js';

export const GUARD_RADIUS = 14;
export const CONE_RANGE = 250;
export const CONE_HALF_ANGLE = 0.55;

/** Build the cast of guards for a new run. */
export function makeGuards() {
  return [
    { id: 'g1', name: 'PATROL-1', x: 250, y: 250, angle: 0, home: 'atrium', route: [{ x: 140, y: 250 }, { x: 520, y: 250 }, { x: 520, y: 360 }, { x: 140, y: 360 }], leg: 0, dir: 1, speed: 52, turnRate: 2.1, fov: CONE_HALF_ANGLE, range: 260, alert: 0, suspicion: 0, seen: false, color: '#ffb545' },
    { id: 'g2', name: 'PATROL-2', x: 900, y: 200, angle: Math.PI, home: 'vault', route: [{ x: 700, y: 190 }, { x: 1150, y: 190 }, { x: 1150, y: 330 }, { x: 700, y: 330 }], leg: 0, dir: 1, speed: 46, turnRate: 1.9, fov: CONE_HALF_ANGLE, range: 250, alert: 0, suspicion: 0, seen: false, color: '#ff8a3d' },
    { id: 'g3', name: 'DOCK-1', x: 400, y: 560, angle: 0, home: 'dock', route: [{ x: 140, y: 470 }, { x: 570, y: 470 }, { x: 570, y: 700 }, { x: 140, y: 700 }], leg: 0, dir: 1, speed: 44, turnRate: 1.7, fov: CONE_HALF_ANGLE, range: 240, alert: 0, suspicion: 0, seen: false, color: '#7fd4ff' },
    { id: 'g4', name: 'COLD-1', x: 1000, y: 560, angle: -Math.PI / 2, home: 'cold', route: [{ x: 800, y: 560 }, { x: 800, y: 720 }, { x: 1180, y: 720 }, { x: 1180, y: 560 }], leg: 0, dir: 1, speed: 40, turnRate: 1.6, fov: CONE_HALF_ANGLE, range: 235, alert: 0, suspicion: 0, seen: false, color: '#c4a1ff' },
  ];
}

/** Move one guard along its route and turn its cone toward where it looks. */
export function updateGuard(guard, dt) {
  const target = guard.route[guard.leg];
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) {
    guard.leg = (guard.leg + guard.dir + guard.route.length) % guard.route.length;
  } else {
    const want = Math.atan2(dy, dx);
    const delta = angleDelta(want, guard.angle);
    const maxTurn = guard.turnRate * dt;
    guard.angle += Math.max(-maxTurn, Math.min(maxTurn, delta));
    guard.x += (dx / dist) * guard.speed * dt;
    guard.y += (dy / dist) * guard.speed * dt;
  }
  if (guard.alert > 0) {
    guard.angle += Math.sin(guard.alert * 6) * dt * 1.4;
  }
}

/** True when the guard can see the thief right now. */
export function guardSeesThief(guard, state) {
  const thief = state.thief;
  if (thief.hidden) return false;
  const d = distance(guard.x, guard.y, thief.x, thief.y);
  if (d > guard.range) return false;
  const toThief = Math.atan2(thief.y - guard.y, thief.x - guard.x);
  if (Math.abs(angleDelta(toThief, guard.angle)) > guard.fov) return false;
  if (segmentBlocked(guard.x, guard.y, thief.x, thief.y)) return false;
  return true;
}

/** True when the thief is close enough for a guard to hear them. */
export function guardHearsThief(guard, state, noise) {
  if (noise <= 0) return false;
  const d = distance(guard.x, guard.y, state.thief.x, state.thief.y);
  return d < noise * 320;
}

/** Send a guard to look at a point (a thrown coin). */
export function divertGuard(guard, x, y) {
  guard.alert = 5.5;
  guard.target = { x, y };
}

/** Does the guard stand on solid ground here? */
export function guardIsStuck(guard) {
  return blockedAt(guard.x, guard.y, GUARD_RADIUS);
}

/** The room the guard is standing in, for the HUD's threat list. */
export function guardRoom(guard) {
  const room = roomAt(guard.x, guard.y);
  return room ? room.name : 'HALLWAY';
}
