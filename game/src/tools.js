// COLD SIGNAL — the tools. Each one costs something and buys something.
// Every tool has a price the thief pays in alarm, time or noise, so the
// interesting decision is always which price the plan can afford.
export const TOOLS = {
  smoke: { name: 'SMOKE VEIL', key: '1', color: '#b9c7d6', cost: 'ALARM +18', hint: 'A cloud of cover. Makes you invisible. The pop is loud.' },
  pick: { name: 'LOCKPICK', key: '2', color: '#ffd166', cost: 'ALARM +8', hint: 'Cuts the vault work to a third. One charge each.' },
  coin: { name: 'COIN TOSS', key: '3', color: '#8ce06a', cost: 'ALARM +6', hint: 'Throws a coin. Pulls the nearest guard over to it.' },
};

export const TOOL_ORDER = ['smoke', 'pick', 'coin'];

/** The next tool in the cycle. */
export function nextTool(current) {
  const index = TOOL_ORDER.indexOf(current);
  return TOOL_ORDER[(index + 1) % TOOL_ORDER.length];
}

/** Fire a smoke veil at the mouse. Returns true when it went off. */
export function deploySmoke(state, x, y) {
  if (state.tools.smoke <= 0) return false;
  state.tools.smoke -= 1;
  state.tools.smokeBursts.push({ x, y, radius: 96, life: 7, maxLife: 7 });
  state.alarm.level = Math.min(100, state.alarm.level + 18);
  state.effects.push({ kind: 'smoke', x, y, life: 0.6, maxLife: 0.6 });
  return true;
}

/** Spend a lockpick charge: the next vault work is three times faster. */
export function spendPick(state) {
  if (state.tools.pick <= 0) return false;
  state.tools.pick -= 1;
  state.vault.pickReady = true;
  state.alarm.level = Math.min(100, state.alarm.level + 8);
  state.effects.push({ kind: 'spark', x: state.vault.x, y: state.vault.y, life: 0.5, maxLife: 0.5 });
  return true;
}

/** Throw a coin; the nearest guard walks over to look at it. */
export function throwCoin(state, x, y) {
  if (state.tools.coin <= 0) return false;
  state.tools.coin -= 1;
  state.tools.coinThrows.push({ x, y, life: 4, landing: 0 });
  state.alarm.level = Math.min(100, state.alarm.level + 6);
  return true;
}

/** The tool the thief has selected, for the HUD. */
export function currentTool(state) {
  return TOOLS[state.tools.selected] ?? TOOLS.smoke;
}

/** How many of each tool is left. */
export function toolStock(state) {
  return { smoke: state.tools.smoke, pick: state.tools.pick, coin: state.tools.coin };
}

/**
 * Cut a camera. Cutting takes a moment and is loud: the alarm climbs while
 * the thief works on the junction box, so it is a decision, not a freebie.
 */
export function cutCamera(state, camera) {
  if (!camera.online) return false;
  camera.online = false;
  camera.cutByThief = true;
  state.alarm.level = Math.min(100, state.alarm.level + 10);
  state.effects.push({ kind: 'spark', x: camera.x, y: camera.y, life: 0.6, maxLife: 0.6 });
  return true;
}

/** The camera nearest to the thief, for the interact key. */
export function nearestCamera(state) {
  let best = null;
  let bestDist = 70;
  for (const camera of state.cameras) {
    if (!camera.online) continue;
    const d = Math.hypot(camera.x - state.thief.x, camera.y - state.thief.y);
    if (d < bestDist) {
      bestDist = d;
      best = camera;
    }
  }
  return best;
}
