// COLD SIGNAL — the thief: movement, sneaking, carrying loot, hiding.
import { SPAWN, blockedAt, distance, roomAt } from './level.js';

export const THIEF_SPEED = 168;
export const SNEAK_SPEED = 82;

/** Move the thief one step, sliding along whatever it bumps into. */
export function updateThief(state, input, dt) {
  const thief = state.thief;
  const sneak = input.keys.has('shift');
  const dx = (input.keys.has('d') || input.keys.has('arrowright') ? 1 : 0) - (input.keys.has('a') || input.keys.has('arrowleft') ? 1 : 0);
  const dy = (input.keys.has('s') || input.keys.has('arrowdown') ? 1 : 0) - (input.keys.has('w') || input.keys.has('arrowup') ? 1 : 0);
  const len = Math.hypot(dx, dy);
  const moving = len > 0;
  const speed = sneak ? SNEAK_SPEED : THIEF_SPEED;

  thief.sneaking = sneak;
  thief.moving = moving;
  thief.step += moving ? dt * (sneak ? 5 : 9) : 0;

  if (moving) {
    const nx = dx / len;
    const ny = dy / len;
    const stepX = nx * speed * dt;
    const stepY = ny * speed * dt;
    if (!blockedAt(thief.x + stepX, thief.y, thief.r)) thief.x += stepX;
    if (!blockedAt(thief.x, thief.y + stepY, thief.r)) thief.y += stepY;
    thief.angle = Math.atan2(ny, nx);
    thief.speed = speed;
  } else {
    thief.speed = 0;
  }

  // Facing follows the mouse when the pointer is over the canvas, so tools can be aimed.
  if (input.mouse.inside) {
    const aim = Math.atan2(input.mouse.y - thief.y, input.mouse.x - thief.x);
    if (Math.abs(aim - thief.angle) > 0.35) thief.angle = aim;
  }

  // The thief is hidden when a smoke cloud covers them or when they stand in a shadow.
  thief.hidden = isHiddenBySmoke(state) || isInShadow(state);
}

/** True when any active smoke cloud covers the thief. */
export function isHiddenBySmoke(state) {
  for (const cloud of state.tools.smokeBursts) {
    if (cloud.life <= 0) continue;
    if (distance(state.thief.x, state.thief.y, cloud.x, cloud.y) < cloud.radius) return true;
  }
  return false;
}

/** True when the thief stands behind a cover slab that breaks the line of sight. */
export function isInShadow(state) {
  const room = roomAt(state.thief.x, state.thief.y);
  if (!room) return false;
  return room.id === 'dock' && state.thief.x < 320 && state.thief.y > 560;
}

/** Put the thief back at the service door. */
export function placeThiefAtSpawn(state) {
  state.thief.x = SPAWN.x;
  state.thief.y = SPAWN.y;
  state.thief.angle = -Math.PI / 2;
  state.thief.carrying = 0;
}

/** How loud the thief is right now: sneaking is quiet, running is not. */
export function thiefNoise(state) {
  const thief = state.thief;
  if (!thief.moving) return 0;
  return thief.sneaking ? 0.12 : 0.4;
}
