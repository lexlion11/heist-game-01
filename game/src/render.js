// COLD SIGNAL — the world rendering: the building, its cover, its cones and
// its loot. The heads-up display lives in hud.js; this file draws the floor.
import { ROOMS, WALLS, COVER, DOORS, VAULT, EXIT_ZONE, WORLD } from './level.js';
import { drawVisionCone, drawGuard, drawCamera, drawCameraCones, drawCoverBlock, drawVaultDoor, drawLootCrystals, drawThief, drawEffects, drawSmoke, drawCoin } from './sprites.js';
import { alarmUrgency, scoreRun, gradeRun } from './alarm.js';

export const PALETTE = {
  void: '#050a10',
  floor: '#0a1420',
  grid: 'rgba(47, 211, 196, 0.055)',
  cyan: '#2fd3c4',
  loot: '#ffd166',
  danger: '#ff4d6d',
  text: '#cfe6f2',
};

/** Set up the canvas for a crisp 1280x800 world. */
export function prepareCanvas(canvas) {
  canvas.width = WORLD.width;
  canvas.height = WORLD.height;
  return canvas.getContext('2d');
}

/** Draw one frame of the world (no HUD). */
export function renderWorld(ctx, state) {
  ctx.save();
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  drawBackdrop(ctx, state);
  drawRooms(ctx, state);
  drawFloorGrid(ctx);
  drawWalls(ctx);
  drawCoverBlocks(ctx);
  drawDoors(ctx, state);
  drawVaultDoor(ctx, state, VAULT);
  drawLootCrystals(ctx, state);
  drawExit(ctx, state);
  for (const camera of state.cameras) drawCamera(ctx, camera, state);
  drawCameraCones(ctx, state);
  for (const guard of state.guards) drawVisionCone(ctx, guard, state);
  for (const guard of state.guards) drawGuard(ctx, guard, state);
  drawThief(ctx, state);
  drawSmoke(ctx, state);
  drawCoin(ctx, state);
  drawEffects(ctx, state);
  drawAlarmVignette(ctx, state);
  ctx.restore();
}

function drawBackdrop(ctx, state) {
  ctx.fillStyle = PALETTE.void;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const urgency = alarmUrgency(state);
  const glow = ctx.createRadialGradient(WORLD.width / 2, WORLD.height / 2, 120, WORLD.width / 2, WORLD.height / 2, 780);
  glow.addColorStop(0, `rgba(${26 + urgency * 90}, ${52 - urgency * 20}, ${86 - urgency * 30}, 1)`);
  glow.addColorStop(1, 'rgba(6, 12, 20, 1)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
}

function drawRooms(ctx, state) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  for (const room of ROOMS) {
    ctx.fillStyle = room.tint;
    ctx.fillRect(room.x, room.y, room.w, room.h);
  }
  ctx.restore();
  for (const room of ROOMS) {
    ctx.strokeStyle = 'rgba(47, 211, 196, 0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(room.x + 0.5, room.y + 0.5, room.w - 1, room.h - 1);
    ctx.font = '600 13px "Trebuchet MS", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(120, 190, 210, 0.42)';
    ctx.textAlign = 'left';
    ctx.fillText(room.name, room.x + 14, room.y + 24);
    ctx.font = '10px "Trebuchet MS", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(120, 190, 210, 0.24)';
    ctx.fillText(room.sub.toUpperCase(), room.x + 14, room.y + 38);
  }
}

function drawFloorGrid(ctx) {
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 60; x <= 1220; x += 40) {
    ctx.moveTo(x + 0.5, 80);
    ctx.lineTo(x + 0.5, 760);
  }
  for (let y = 80; y <= 760; y += 40) {
    ctx.moveTo(60, y + 0.5);
    ctx.lineTo(1220, y + 0.5);
  }
  ctx.stroke();
}

function drawWalls(ctx) {
  for (const wall of WALLS) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(wall.x + 3, wall.y + 4, wall.w, wall.h, 3);
    ctx.fill();
    ctx.fillStyle = '#2b5674';
    ctx.beginPath();
    ctx.roundRect(wall.x, wall.y, wall.w, wall.h, 3);
    ctx.fill();
    ctx.fillStyle = '#3f7ea3';
    ctx.beginPath();
    ctx.roundRect(wall.x, wall.y, wall.w, Math.min(3, wall.h), 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 200, 235, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
  }
}

function drawCoverBlocks(ctx) {
  for (const cover of COVER) drawCoverBlock(ctx, cover);
}

function drawDoors(ctx, state) {
  for (const door of DOORS) {
    const pulse = 0.35 + 0.25 * Math.sin(state.time * 2 + door.x);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 209, 102, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.strokeRect(door.x + 0.5, door.y + 0.5, door.w - 1, door.h - 1);
    ctx.setLineDash([]);
    ctx.font = '600 10px "Trebuchet MS", system-ui, sans-serif';
    ctx.fillStyle = `rgba(255, 209, 102, ${0.5 + pulse * 0.4})`;
    ctx.textAlign = 'center';
    ctx.fillText(door.label, door.x + door.w / 2, door.y + door.h / 2 + 3);
    ctx.restore();
  }
}

function drawExit(ctx, state) {
  const ready = state.phase === 'escape';
  ctx.save();
  ctx.translate(EXIT_ZONE.x + EXIT_ZONE.w / 2, EXIT_ZONE.y + EXIT_ZONE.h / 2);
  ctx.strokeStyle = ready ? 'rgba(140, 224, 106, 0.85)' : 'rgba(140, 224, 106, 0.32)';
  ctx.fillStyle = ready ? 'rgba(140, 224, 106, 0.16)' : 'rgba(140, 224, 106, 0.05)';
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 5]);
  ctx.beginPath();
  ctx.roundRect(-EXIT_ZONE.w / 2, -EXIT_ZONE.h / 2, EXIT_ZONE.w, EXIT_ZONE.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'center';
  ctx.font = '700 12px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = ready ? '#c9f5a8' : 'rgba(201, 245, 168, 0.45)';
  ctx.fillText('GETAWAY', 0, 5);
  ctx.restore();
}

function drawAlarmVignette(ctx, state) {
  const urgency = alarmUrgency(state);
  if (urgency < 0.03) return;
  const grad = ctx.createRadialGradient(WORLD.width / 2, WORLD.height / 2, 260, WORLD.width / 2, WORLD.height / 2, 760);
  grad.addColorStop(0, 'rgba(255, 60, 90, 0)');
  grad.addColorStop(1, `rgba(255, 40, 80, ${0.18 + urgency * 0.42})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
}

/** The title card. */
export function drawTitle(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(4, 9, 15, 0.84)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.textAlign = 'center';

  ctx.font = '700 74px "Trebuchet MS", system-ui, sans-serif';
  const grad = ctx.createLinearGradient(0, 190, 0, 270);
  grad.addColorStop(0, '#eafcff');
  grad.addColorStop(0.5, '#2fd3c4');
  grad.addColorStop(1, '#ff5edb');
  ctx.fillStyle = grad;
  ctx.fillText('COLD SIGNAL', WORLD.width / 2, 250);

  ctx.font = '400 17px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(207, 230, 242, 0.72)';
  ctx.fillText('Read the cones. Crack the vault. Take the loot and get back to the van.', WORLD.width / 2, 296);

  const lines = [
    'WASD / ARROWS   move',
    'SHIFT   sneak (quiet, slow)',
    'E   work the vault lock',
    'SPACE   use the selected tool   ·   Q   cycle tool',
    'MOUSE   aim',
  ];
  ctx.font = '400 15px "Trebuchet MS", system-ui, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(47, 211, 196, 0.9)' : 'rgba(207, 230, 242, 0.6)';
    ctx.fillText(line, WORLD.width / 2, 380 + i * 30);
  });

  ctx.font = '700 22px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(state.message || 'PRESS ANY KEY TO BEGIN', WORLD.width / 2, 600);
  ctx.restore();
}

/** The end card, shared by the win and the loss. */
export function drawEnd(ctx, state, won) {
  const score = scoreRun(state, won);
  ctx.save();
  ctx.fillStyle = won ? 'rgba(4, 12, 10, 0.9)' : 'rgba(14, 4, 8, 0.9)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.textAlign = 'center';
  ctx.font = '700 66px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = won ? '#8ce06a' : '#ff4d6d';
  ctx.fillText(won ? 'CLEAN GETAWAY' : 'CAUGHT IN THE SIGNAL', WORLD.width / 2, 270);

  ctx.font = '400 20px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(`HAUL  $${state.loot.value.toLocaleString('en-US')}`, WORLD.width / 2, 330);
  ctx.fillStyle = 'rgba(207, 230, 242, 0.75)';
  ctx.font = '400 16px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillText(`time ${state.runTime.toFixed(1)}s   ·   alarm peak ${Math.round(state.alarm.peak)}%   ·   packets ${state.loot.packets}`, WORLD.width / 2, 362);

  if (won) {
    ctx.font = '700 44px "Trebuchet MS", system-ui, sans-serif';
    ctx.fillStyle = '#2fd3c4';
    ctx.fillText(`SCORE ${score.toLocaleString('en-US')}   GRADE ${gradeRun(score)}`, WORLD.width / 2, 424);
    ctx.font = '400 14px "Trebuchet MS", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(207, 230, 242, 0.6)';
    ctx.fillText(`best ${Math.max(state.best, score).toLocaleString('en-US')}`, WORLD.width / 2, 450);
  }

  ctx.font = '700 20px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = '#cfe6f2';
  ctx.fillText('PRESS R TO RUN IT AGAIN', WORLD.width / 2, 510);
  ctx.restore();
}
