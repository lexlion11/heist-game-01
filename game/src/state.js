// COLD SIGNAL — the whole mutable state of one run, and how to reset it.
// Every other module reads and writes this object; nothing else holds state.
import { EXIT_ZONE } from './level.js';

export const SCREEN = { TITLE: 'title', PLAY: 'play', WIN: 'win', LOSE: 'lose' };

export const PHASE = { INFILTRATE: 'infiltrate', CRACK: 'crack', ESCAPE: 'escape' };

export function createState() {
  return {
    screen: SCREEN.TITLE,
    phase: PHASE.INFILTRATE,
    time: 0,
    runTime: 0,
    best: 0,
    message: '',
    messageTimer: 0,
    shake: 0,
    flash: 0,
    paused: false,
    thief: { x: 210, y: 690, r: 13, angle: -Math.PI / 2, sneaking: false, moving: false, speed: 0, carrying: 0, hidden: false, step: 0 },
    vault: { x: 0, y: 0, progress: 0, cracked: 0, packets: 0, opening: false },
    alarm: { level: 0, seen: 0, lastSeenX: 0, lastSeenY: 0, lockdown: false, peak: 0, catchTimer: 0 },
    loot: { value: 0, packetValue: 1400, packets: 0 },
    exit: { reached: false, countdown: 0, zone: EXIT_ZONE },
    tools: { smoke: 3, pick: 2, coin: 3, selected: 'smoke', smokeBursts: [], coinThrows: [], cooldown: 0 },
    guards: [],
    cameras: [],
    effects: [],
    shots: [],
  };
}

/** Put every value back to its start, keeping the object identity. */
export function resetState(state) {
  const fresh = createState();
  fresh.best = state.best;
  for (const key of Object.keys(fresh)) {
    if (key === 'best') continue;
    state[key] = fresh[key];
  }
  return state;
}

/** Say something on screen for a while (a pickup, a warning, a win). */
export function setMessage(state, text, seconds = 2.4) {
  state.message = text;
  state.messageTimer = seconds;
}
