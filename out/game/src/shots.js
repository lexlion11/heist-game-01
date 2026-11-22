// COLD SIGNAL — the screenshot scenes. Each one places the real cast of a
// real run in a real room, so a captured frame is what the game looks like
// when it is played, not a mock-up drawn for the picture.
import { SPAWN, VAULT, EXIT_ZONE } from './level.js';
import { makeGuards } from './guards.js';
import { makeCameras } from './cameras.js';
import { resetVault } from './vault.js';
import { setMessage, PHASE, SCREEN } from './state.js';

/** Put the thief somewhere, facing somewhere. */
function placeThief(state, x, y, angle) {
  state.thief.x = x;
  state.thief.y = y;
  state.thief.angle = angle;
}

/**
 * Set up the named scene (cover, route, tool or escape; any other name is the
 * cover) and return the screen the game should show.
 */
export function stageShot(name, state) {
  state.guards = makeGuards();
  state.cameras = makeCameras();
  resetVault(state);
  state.screen = SCREEN.PLAY;
  state.time = 12.5;

  if (name === 'route') {
    // A second route: the service dock, with a patrol sweeping the crates.
    state.phase = PHASE.INFILTRATE;
    state.alarm.level = 26;
    state.alarm.peak = 26;
    placeThief(state, 330, 640, -Math.PI / 2.4);
    state.guards[2].x = 470;
    state.guards[2].y = 500;
    state.guards[2].angle = Math.PI * 0.82;
    state.guards[2].leg = 1;
    state.guards[0].x = 330;
    state.guards[0].y = 250;
    state.guards[0].angle = Math.PI / 2;
    state.guards[0].leg = 1;
    state.cameras[2].x = 78;
    state.cameras[2].y = 620;
    state.cameras[2].baseAngle = -Math.PI * 0.28;
    state.cameras[2].angle = -Math.PI * 0.1;
    state.loot.packets = 1;
    state.loot.value = state.loot.packetValue;
    setMessage(state, 'TWO ROUTES IN — READ THE CORNERS', 3);
    return SCREEN.PLAY;
  }

  if (name === 'tool') {
    // The smoke veil going up in the atrium while a camera sweeps over it.
    state.phase = PHASE.INFILTRATE;
    state.alarm.level = 58;
    state.alarm.peak = 58;
    placeThief(state, 330, 250, -Math.PI / 2);
    state.thief.hidden = true;
    state.tools.smokeBursts.push({ x: 330, y: 250, radius: 96, life: 6.2, maxLife: 7 });
    state.effects.push({ kind: 'smoke', x: 330, y: 250, life: 0.45, maxLife: 0.6 });
    state.guards[0].x = 200;
    state.guards[0].y = 250;
    state.guards[0].angle = 0;
    state.guards[0].leg = 1;
    state.guards[1].x = 900;
    state.guards[1].y = 200;
    state.guards[1].angle = Math.PI;
    state.guards[1].leg = 1;
    state.cameras[0].x = 625;
    state.cameras[0].y = 96;
    state.cameras[0].baseAngle = Math.PI * 0.72;
    state.cameras[0].angle = Math.PI * 0.52;
    state.cameras[1].x = 1190;
    state.cameras[1].y = 250;
    state.cameras[1].baseAngle = Math.PI;
    state.cameras[1].angle = Math.PI * 0.86;
    state.tools.smoke = 2;
    setMessage(state, 'SMOKE VEIL UP — YOU ARE COVERED', 3);
    return SCREEN.PLAY;
  }

  if (name === 'escape') {
    // The getaway: the vault is empty, the haul is on the thief, the van is lit.
    state.phase = PHASE.ESCAPE;
    state.alarm.level = 34;
    state.alarm.peak = 71;
    state.loot.packets = 3;
    state.loot.value = state.loot.packetValue * 3;
    state.thief.carrying = 3;
    state.vault.cracked = 3;
    state.vault.packets = 3;
    placeThief(state, 190, 620, Math.PI * 0.72);
    state.thief.carrying = 3;
    state.guards[3].x = 900;
    state.guards[3].y = 560;
    state.guards[3].angle = -Math.PI / 2;
    state.guards[2].x = 560;
    state.guards[2].y = 640;
    state.guards[2].angle = Math.PI;
    state.cameras[2].x = 78;
    state.cameras[2].y = 620;
    state.cameras[2].baseAngle = -Math.PI * 0.28;
    state.cameras[2].angle = -Math.PI * 0.5;
    setMessage(state, 'THE VAN IS LIT — RUN', 3);
    return SCREEN.PLAY;
  }

  // The cover frame: the whole annex at once — thief, guard cone, camera
  // cone, the vault, the alarm meter and every room of the building.
  state.phase = PHASE.INFILTRATE;
  state.alarm.level = 41;
  state.alarm.peak = 41;
  // The thief stands in the atrium, one pillar away from PATROL-1's cone.
  placeThief(state, 500, 250, 0);
  state.guards[0].x = 280;
  state.guards[0].y = 250;
  state.guards[0].angle = 0;
  state.guards[0].leg = 1;
  state.guards[1].x = 820;
  state.guards[1].y = 180;
  state.guards[1].angle = 0.5;
  state.guards[1].leg = 1;
  state.guards[2].x = 400;
  state.guards[2].y = 560;
  state.guards[2].angle = 0;
  state.guards[2].leg = 1;
  state.guards[3].x = 1000;
  state.guards[3].y = 560;
  state.guards[3].angle = -Math.PI / 2;
  state.guards[3].leg = 1;
  state.cameras[0].x = 620;
  state.cameras[0].y = 96;
  state.cameras[0].baseAngle = Math.PI * 0.62;
  state.cameras[0].angle = Math.PI * 0.62;
  state.cameras[1].x = 1190;
  state.cameras[1].y = 250;
  state.cameras[1].baseAngle = Math.PI;
  state.cameras[1].angle = Math.PI * 0.88;
  state.cameras[2].x = 78;
  state.cameras[2].y = 620;
  state.cameras[2].baseAngle = -Math.PI * 0.28;
  state.cameras[2].angle = -Math.PI * 0.34;
  state.cameras[3].x = 1190;
  state.cameras[3].y = 470;
  state.cameras[3].baseAngle = Math.PI * 1.28;
  state.cameras[3].angle = Math.PI * 1.35;
  setMessage(state, 'THE ANNEX IS LIT — READ EVERY CONE', 3);
  return SCREEN.PLAY;
}

export { SPAWN, VAULT, EXIT_ZONE };
