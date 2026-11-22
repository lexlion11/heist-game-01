// COLD SIGNAL — bootstrap and the game loop. It wires the modules together:
// input, thief, guards, cameras, alarm, vault, tools, HUD and rendering.
import { createState, resetState, setMessage, SCREEN, PHASE } from './state.js';
import { createInput } from './input.js';
import { updateThief, thiefNoise, placeThiefAtSpawn } from './thief.js';
import { makeGuards, updateGuard, guardSeesThief, guardHearsThief, divertGuard } from './guards.js';
import { makeCameras, updateCamera, cameraSeesThief } from './cameras.js';
import { updateAlarm } from './alarm.js';
import { resetVault, thiefAtVault, workVault, thiefAtExit, vaultEmpty } from './vault.js';
import { deploySmoke, spendPick, throwCoin, nextTool } from './tools.js';
import { prepareCanvas, renderWorld, drawTitle, drawEnd } from './render.js';
import { drawHud } from './hud.js';
import { initAudio, playPickTick, playLootTaken, playSpotted, playSmoke, playCoin, playWin, playLose, playBlip } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = prepareCanvas(canvas);
const state = createState();
const input = createInput(canvas);

let lastTime = performance.now();
let picking = false;
let pickSoundTimer = 0;
let frozen = false;

// A ?shot= parameter stages a still scene for the screenshots.
const shotName = new URLSearchParams(window.location.search).get('shot');

/** Begin a fresh run. */
function startRun() {
  resetState(state);
  state.guards = makeGuards();
  state.cameras = makeCameras();
  resetVault(state);
  placeThiefAtSpawn(state);
  state.screen = SCREEN.PLAY;
  state.phase = PHASE.INFILTRATE;
  state.runTime = 0;
  setMessage(state, 'SLIP IN THROUGH THE SERVICE DOCK', 3);
}

/** Stage a still frame for a screenshot. */
function startShot() {
  resetState(state);
  stageShot(shotName, state);
  frozen = true;
}

/** One simulation step. */
function step(dt) {
  state.time += dt;

  if (state.screen === SCREEN.PLAY && !frozen) {
    state.runTime += dt;
    updateThief(state, input, dt);
    updateGuardsAndCameras(dt);
    updateVaultWork(dt);
    updateTools(dt);
    const lost = updateAlarm(state, dt);
    if (lost) {
      state.screen = SCREEN.LOSE;
      playLose();
    } else if (checkWin()) {
      state.screen = SCREEN.WIN;
      playWin();
    }
  }

  if (state.messageTimer > 0) state.messageTimer = Math.max(0, state.messageTimer - dt);
  if (frozen) return;
  for (const effect of state.effects) effect.life -= dt;
  state.effects = state.effects.filter((effect) => effect.life > 0);
  for (const cloud of state.tools.smokeBursts) cloud.life -= dt;
  state.tools.smokeBursts = state.tools.smokeBursts.filter((cloud) => cloud.life > 0);
  for (const coin of state.tools.coinThrows) coin.life -= dt;
  state.tools.coinThrows = state.tools.coinThrows.filter((coin) => coin.life > 0);
}

/** Move the guards and the cameras, and mark who can see the thief. */
function updateGuardsAndCameras(dt) {
  const noise = thiefNoise(state);
  for (const guard of state.guards) {
    updateGuard(guard, dt);
    if (guard.alert > 0) {
      guard.alert -= dt;
      if (guard.target) {
        const dx = guard.target.x - guard.x;
        const dy = guard.target.y - guard.y;
        const d = Math.hypot(dx, dy);
        if (d > 8) {
          const want = Math.atan2(dy, dx);
          guard.angle = want;
          guard.x += (dx / d) * guard.speed * 1.35 * dt;
          guard.y += (dy / d) * guard.speed * 1.35 * dt;
        }
      }
    }
    guard.seen = guardSeesThief(guard, state);
    guard.hears = guardHearsThief(guard, state, noise);
    if (guard.seen) guard.suspicion = 1;
    else guard.suspicion = Math.max(0, guard.suspicion - dt * 0.5);
    if (guard.seen && !state.alarm.lockdown) playSpotted();
  }
  for (const camera of state.cameras) {
    updateCamera(camera, state.time);
    camera.seen = cameraSeesThief(camera, state);
    if (camera.seen && !state.alarm.lockdown) playSpotted();
  }
}

/** Work the vault lock while the thief stands at it and holds E. */
function updateVaultWork(dt) {
  const atVault = thiefAtVault(state);
  const holding = input.keys.has('e');
  if (atVault && holding && !vaultEmpty(state)) {
    picking = true;
    // A lockpick charge makes the whole lock go three times faster.
    if (!state.vault.pickReady && state.tools.pick > 0) {
      state.tools.pick -= 1;
      state.vault.pickReady = true;
      state.effects.push({ kind: 'spark', x: state.vault.x, y: state.vault.y, life: 0.5, maxLife: 0.5 });
      playBlip();
    }
    pickSoundTimer -= dt;
    if (pickSoundTimer <= 0) {
      playPickTick();
      pickSoundTimer = 0.12;
    }
    const before = state.vault.cracked;
    workVault(state, dt, state.vault.pickReady);
    if (state.vault.cracked > before) {
      playLootTaken();
      setMessage(state, `PACKET SECURED  ·  $${state.loot.value.toLocaleString('en-US')}`, 2);
    }
  } else {
    picking = false;
    if (!atVault) state.vault.pickReady = false;
  }
}

/** Fire the selected tool, cycle tools, and handle the coin landing. */
function updateTools(dt) {
  if (input.consume('q')) {
    state.tools.selected = nextTool(state.tools.selected);
    playBlip();
  }
  if (input.consume('1')) { state.tools.selected = 'smoke'; playBlip(); }
  if (input.consume('2')) { state.tools.selected = 'pick'; playBlip(); }
  if (input.consume('3')) { state.tools.selected = 'coin'; playBlip(); }

  if (input.consume(' ')) {
    const mx = input.mouse.inside ? input.mouse.x : state.thief.x + Math.cos(state.thief.angle) * 90;
    const my = input.mouse.inside ? input.mouse.y : state.thief.y + Math.sin(state.thief.angle) * 90;
    if (state.tools.selected === 'smoke') {
      if (deploySmoke(state, mx, my)) {
        playSmoke();
        setMessage(state, 'SMOKE VEIL UP — YOU ARE COVERED', 1.8);
      }
    } else if (state.tools.selected === 'pick') {
      if (spendPick(state)) {
        playBlip();
        setMessage(state, 'LOCKPICK READY — THE VAULT OPENS FAST', 2);
      }
    } else if (state.tools.selected === 'coin') {
      if (throwCoin(state, mx, my)) {
        playCoin();
        setMessage(state, 'COIN AWAY — SOMEBODY IS GOING TO LOOK', 1.8);
      }
    }
  }

  for (const coin of state.tools.coinThrows) {
    if (coin.landing <= 0) {
      coin.landing = 1;
      const near = nearestGuard(coin.x, coin.y);
      if (near) divertGuard(near, coin.x, coin.y);
    }
  }
}

/** The guard closest to a point. */
function nearestGuard(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const guard of state.guards) {
    const d = Math.hypot(guard.x - x, guard.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = guard;
    }
  }
  return best;
}

/** The win check: the loot is home. */
function checkWin() {
  if (state.phase !== PHASE.ESCAPE) return false;
  return thiefAtExit(state);
}

/** Switch to the escape phase once the vault is empty. */
function checkPhase() {
  if (state.phase === PHASE.INFILTRATE && vaultEmpty(state)) {
    state.phase = PHASE.ESCAPE;
    setMessage(state, 'THE VAULT IS EMPTY — GET TO THE VAN', 3);
  }
}

/** Handle a key press that starts or restarts the game. */
function handleGlobalKeys() {
  if (frozen) return;
  if (state.screen === SCREEN.TITLE) {
    if (input.pressed.size > 0) {
      input.pressed.clear();
      initAudio();
      startRun();
    }
    return;
  }
  if ((state.screen === SCREEN.WIN || state.screen === SCREEN.LOSE) && input.consume('r')) {
    startRun();
  }
}

/** The frame. */
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  handleGlobalKeys();
  step(dt);
  checkPhase();

  if (state.screen === SCREEN.TITLE) {
    drawTitle(ctx, state);
  } else {
    renderWorld(ctx, state);
    drawHud(ctx, state);
    if (state.screen === SCREEN.WIN) drawEnd(ctx, state, true);
    if (state.screen === SCREEN.LOSE) drawEnd(ctx, state, false);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

if (shotName) startShot();
