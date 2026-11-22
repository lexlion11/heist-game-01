// COLD SIGNAL — the sprites: the thief, the guards, the cameras, the cones,
// the cover, the vault and the little pieces of feedback.
import { COVER, VAULT, LOOT_CRYSTALS } from './level.js';
import { alarmUrgency } from './alarm.js';

/** A guard's translucent wedge of vision. It reddens when it holds the thief. */
export function drawVisionCone(ctx, guard, state) {
  const half = guard.fov;
  const range = guard.range;
  const grad = ctx.createRadialGradient(guard.x, guard.y, 8, guard.x, guard.y, range);
  const hot = guard.seen;
  if (hot) {
    grad.addColorStop(0, 'rgba(255, 90, 120, 0.75)');
    grad.addColorStop(0.55, 'rgba(255, 90, 120, 0.38)');
    grad.addColorStop(1, 'rgba(255, 90, 120, 0.05)');
  } else {
    grad.addColorStop(0, 'rgba(255, 200, 80, 0.62)');
    grad.addColorStop(0.55, 'rgba(255, 170, 50, 0.30)');
    grad.addColorStop(1, 'rgba(255, 170, 50, 0.04)');
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.angle);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, -half, half);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(255, 130, 155, 0.9)' : 'rgba(255, 214, 130, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // the guard's shoulders
  ctx.fillStyle = hot ? 'rgba(255, 77, 109, 0.9)' : 'rgba(255, 209, 102, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, -2.6);
  ctx.lineTo(range * 0.55, -1.2);
  ctx.lineTo(range * 0.55, 1.2);
  ctx.lineTo(0, 2.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A guard: a shoulder bar, a head and an alert lamp. */
export function drawGuard(ctx, guard, state) {
  const bob = Math.sin(state.time * 4 + guard.x * 0.05) * 1.2;
  ctx.save();
  ctx.translate(guard.x, guard.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = guard.color;
  ctx.beginPath();
  ctx.roundRect(-9, -8, 18, 18, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(10, 16, 24, 0.85)';
  ctx.beginPath();
  ctx.roundRect(-6, -5, 12, 6, 3);
  ctx.fill();

  // the lamp that lights when the guard has the thief
  ctx.fillStyle = guard.seen ? '#ff2d55' : guard.suspicion > 0 ? '#ffd166' : 'rgba(120, 200, 180, 0.55)';
  ctx.beginPath();
  ctx.arc(0, -12, 3.4, 0, Math.PI * 2);
  ctx.fill();
  if (guard.seen) {
    ctx.strokeStyle = 'rgba(255, 45, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -12, 7 + Math.sin(state.time * 12) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // the guard's name, so a shrunk frame still says who is watching
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 10px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = guard.seen ? '#ff8fa3' : 'rgba(255, 214, 140, 0.85)';
  ctx.fillText(guard.name, guard.x, guard.y - 22);
  ctx.restore();
}

/** A wall camera: a body, a lens and the edge of its cone. */
export function drawCamera(ctx, camera, state) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = camera.online ? '#4a6b80' : '#3a3f45';
  ctx.beginPath();
  ctx.roundRect(-11, -8, 20, 14, 4);
  ctx.fill();
  ctx.fillStyle = camera.online ? (camera.seen ? '#ff2d55' : '#5aa9ff') : '#2a2f35';
  ctx.beginPath();
  ctx.arc(6, -3, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(camera.angle);
  ctx.fillStyle = camera.online ? 'rgba(90, 169, 255, 0.85)' : 'rgba(90, 100, 110, 0.6)';
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(18, -4);
  ctx.lineTo(18, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 9px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = camera.online ? 'rgba(120, 185, 255, 0.9)' : 'rgba(120, 130, 140, 0.6)';
  ctx.fillText(camera.online ? camera.name : `${camera.name} CUT`, camera.x, camera.y - 14);
  ctx.restore();
}

/** A camera's own wedge of vision. */
export function drawCameraCone(ctx, camera, state) {
  if (!camera.online) return;
  const half = camera.fov;
  const range = camera.range;
  const grad = ctx.createRadialGradient(camera.x, camera.y, 6, camera.x, camera.y, range);
  if (camera.seen) {
    grad.addColorStop(0, 'rgba(255, 90, 120, 0.7)');
    grad.addColorStop(1, 'rgba(255, 90, 120, 0.04)');
  } else {
    grad.addColorStop(0, 'rgba(70, 150, 255, 0.6)');
    grad.addColorStop(0.6, 'rgba(70, 150, 255, 0.24)');
    grad.addColorStop(1, 'rgba(70, 150, 255, 0.04)');
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(camera.x, camera.y);
  ctx.rotate(camera.angle);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, -half, half);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = camera.seen ? 'rgba(255, 130, 155, 0.9)' : 'rgba(120, 185, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Cover: pillars, crates, desks, shelving, the van. */
export function drawCoverBlock(ctx, cover) {
  ctx.save();
  const shade = cover.kind === 'pillar' ? '#25445c' : '#173043';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(cover.x + 3, cover.y + 5, cover.w, cover.h, 5);
  ctx.fill();
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.roundRect(cover.x, cover.y, cover.w, cover.h, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(47, 211, 196, 0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (cover.kind === 'crate') {
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.28)';
    ctx.beginPath();
    ctx.moveTo(cover.x + 6, cover.y + 6);
    ctx.lineTo(cover.x + cover.w - 6, cover.y + cover.h - 6);
    ctx.moveTo(cover.x + cover.w - 6, cover.y + 6);
    ctx.lineTo(cover.x + 6, cover.y + cover.h - 6);
    ctx.stroke();
  } else if (cover.kind === 'shelf') {
    ctx.strokeStyle = 'rgba(90, 169, 255, 0.3)';
    for (let i = 1; i < 4; i += 1) {
      const y = cover.y + (cover.h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(cover.x, y);
      ctx.lineTo(cover.x + cover.w, y);
      ctx.stroke();
    }
  } else if (cover.kind === 'van') {
    ctx.fillStyle = 'rgba(140, 224, 106, 0.14)';
    ctx.beginPath();
    ctx.roundRect(cover.x + 6, cover.y + 8, cover.w - 12, cover.h - 20, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(201, 245, 168, 0.75)';
    ctx.font = '700 11px "Trebuchet MS", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VAN', cover.x + cover.w / 2, cover.y + cover.h - 12);
  } else if (cover.kind === 'desk' || cover.kind === 'bench' || cover.kind === 'pedestal') {
    ctx.fillStyle = 'rgba(90, 169, 255, 0.16)';
    ctx.fillRect(cover.x + 6, cover.y + 6, cover.w - 12, cover.h - 12);
  }
  ctx.restore();
}

/** The signal vault: a heavy door with a dial and the loot behind it. */
export function drawVaultDoor(ctx, state, vault) {
  const open = state.vault.cracked > 0;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(vault.x - vault.w / 2 + 4, vault.y - vault.h / 2 + 6, vault.w, vault.h, 8);
  ctx.fill();
  ctx.fillStyle = '#2a1b3d';
  ctx.beginPath();
  ctx.roundRect(vault.x - vault.w / 2, vault.y - vault.h / 2, vault.w, vault.h, 8);
  ctx.fill();
  ctx.strokeStyle = open ? 'rgba(255, 94, 219, 0.85)' : 'rgba(255, 209, 102, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // the dial
  ctx.strokeStyle = open ? '#ff5edb' : '#ffd166';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(vault.x, vault.y, 17, 0, Math.PI * 2);
  ctx.stroke();
  const spin = state.vault.progress * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(vault.x, vault.y);
  ctx.lineTo(vault.x + Math.cos(spin) * 17, vault.y + Math.sin(spin) * 17);
  ctx.stroke();

  if (open) {
    ctx.fillStyle = 'rgba(255, 209, 102, 0.18)';
    ctx.beginPath();
    ctx.roundRect(vault.x - vault.w / 2 + 8, vault.y - vault.h / 2 + 8, vault.w - 16, vault.h - 16, 5);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.font = '700 10px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 209, 102, 0.9)';
  ctx.fillText('SIGNAL VAULT', vault.x, vault.y - vault.h / 2 - 8);
  ctx.fillStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.font = '9px "Trebuchet MS", system-ui, sans-serif';
  ctx.fillText('LOOT $1,400 × 3', vault.x, vault.y + vault.h / 2 + 14);
  ctx.restore();
}

/** The loot: glowing signal crystals on the pedestals. */
export function drawLootCrystals(ctx, state) {
  for (const crystal of LOOT_CRYSTALS) {
    const taken = state.vault.packets >= LOOT_CRYSTALS.length;
    const pulse = 0.6 + 0.4 * Math.sin(state.time * 3 + crystal.x);
    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 26);
    grad.addColorStop(0, `rgba(255, 226, 140, ${0.55 * pulse})`);
    grad.addColorStop(1, 'rgba(255, 190, 60, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = taken ? 'rgba(120, 130, 140, 0.35)' : '#ffe08c';
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = taken ? 'rgba(120, 130, 140, 0.5)' : 'rgba(255, 255, 220, 0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

/** The thief: a hooded figure with a cyan visor and a sack. */
export function drawThief(ctx, state) {
  const thief = state.thief;
  const sway = Math.sin(thief.step) * 1.4;
  ctx.save();
  ctx.translate(thief.x, thief.y);

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(thief.angle + Math.PI / 2);
  // the sack of loot on the back
  if (thief.carrying > 0) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.roundRect(-9, -20, 18, 12, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 90, 0, 0.5)';
    ctx.font = '700 9px "Trebuchet MS", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`×${thief.carrying}`, 0, -11);
  }
  // the body
  ctx.fillStyle = thief.hidden ? 'rgba(70, 105, 125, 0.4)' : '#1d5470';
  ctx.beginPath();
  ctx.roundRect(-9, -12, 18, 24, 8);
  ctx.fill();
  ctx.strokeStyle = thief.hidden ? 'rgba(160, 215, 235, 0.45)' : '#5ffbe8';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // the visor
  ctx.fillStyle = thief.hidden ? 'rgba(95, 251, 232, 0.5)' : '#e8fffb';
  ctx.beginPath();
  ctx.roundRect(-6, -10, 12, 4, 2);
  ctx.fill();
  ctx.restore();

  // the feet, moving
  ctx.fillStyle = 'rgba(47, 211, 196, 0.5)';
  const step = Math.sin(thief.step) * 4;
  ctx.beginPath();
  ctx.ellipse(-5 + step, 13, 3.4, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(5 - step, 13, 3.4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // a bright marker so the thief reads at a glance, even in a shrunk frame
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
  halo.addColorStop(0, 'rgba(95, 251, 232, 0.45)');
  halo.addColorStop(1, 'rgba(95, 251, 232, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(95, 251, 232, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Smoke clouds: soft grey rings that hide the thief. */
export function drawSmoke(ctx, state) {
  for (const cloud of state.tools.smokeBursts) {
    if (cloud.life <= 0) continue;
    const fade = Math.min(1, cloud.life / 1.4);
    const grad = ctx.createRadialGradient(cloud.x, cloud.y, 4, cloud.x, cloud.y, cloud.radius);
    grad.addColorStop(0, `rgba(185, 199, 214, ${0.5 * fade})`);
    grad.addColorStop(0.7, `rgba(150, 165, 185, ${0.22 * fade})`);
    grad.addColorStop(1, 'rgba(120, 135, 155, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(210, 225, 240, ${0.22 * fade})`;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/** The thrown coin, spinning on the floor where it landed. */
export function drawCoin(ctx, state) {
  for (const coin of state.tools.coinThrows) {
    if (coin.life <= 0) continue;
    const squash = Math.abs(Math.cos(state.time * 7));
    ctx.save();
    ctx.translate(coin.x, coin.y);
    ctx.fillStyle = '#8ce06a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5 * squash, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 224, 106, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 10 + Math.sin(state.time * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** Short-lived feedback: sparks when the lock turns, the flash of a smoke pop. */
export function drawEffects(ctx, state) {
  for (const effect of state.effects) {
    const t = 1 - effect.life / effect.maxLife;
    if (effect.kind === 'spark') {
      ctx.strokeStyle = `rgba(255, 209, 102, ${1 - t})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI * 2 * i) / 6 + t;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x + Math.cos(a) * (8 + t * 18), effect.y + Math.sin(a) * (8 + t * 18));
        ctx.stroke();
      }
    } else if (effect.kind === 'smoke') {
      ctx.fillStyle = `rgba(220, 230, 240, ${(1 - t) * 0.5})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 10 + t * 46, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Draw the camera cones after the world, under the HUD. */
export function drawCameraCones(ctx, state) {
  for (const camera of state.cameras) drawCameraCone(ctx, camera, state);
}

export { COVER };
