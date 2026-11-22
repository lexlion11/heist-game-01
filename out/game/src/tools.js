// COLD SIGNAL — the tools. Each one costs something and buys something.
export const TOOLS = {
  smoke: { name: 'SMOKE VEIL', key: '1', color: '#b9c7d6', cost: 'NOISE +18', hint: 'Cloud of cover. Makes you invisible. Raises the alarm.' },
  pick: { name: 'LOCKPICK', key: '2', color: '#ffd166', cost: 'TIME 3x', hint: 'Cuts vault work to a third. Spends one charge.' },
  coin: { name: 'COIN TOSS', key: '3', color: '#8ce06a', cost: 'TIME 2s', hint: 'Throws a coin. Pulls the nearest guard to it.' },
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
  state.effects.push({ kind: 'spark', x: state.vault.x, y: state.vault.y, life: 0.5, maxLife: 0.5 });
  return true;
}

/** Throw a coin; the nearest guard walks over to look at it. */
export function throwCoin(state, x, y) {
  if (state.tools.coin <= 0) return false;
  state.tools.coin -= 1;
  state.tools.coinThrows.push({ x, y, life: 4, landing: 0 });
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
