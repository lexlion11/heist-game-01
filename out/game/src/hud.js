// COLD SIGNAL — the on-screen heads-up display: alarm meter, loot, objective,
// tool bar, message line and the threat readout.
import { alarmLabel, alarmUrgency } from './alarm.js';
import { TOOLS, TOOL_ORDER } from './tools.js';
import { WORLD } from './level.js';

const FONT = '"Trebuchet MS", system-ui, sans-serif';

/** Draw the whole HUD on top of the world. */
export function drawHud(ctx, state) {
  drawAlarmMeter(ctx, state);
  drawLootReadout(ctx, state);
  drawObjectiveBand(ctx, state);
  drawToolBar(ctx, state);
  drawMessageLine(ctx, state);
  drawThreatReadout(ctx, state);
  drawPhaseHint(ctx, state);
}

function drawAlarmMeter(ctx, state) {
  const x = 24;
  const y = 40;
  const w = 300;
  const h = 18;
  const level = state.alarm.level / 100;
  ctx.save();
  ctx.fillStyle = 'rgba(6, 14, 22, 0.84)';
  ctx.strokeStyle = 'rgba(47, 211, 196, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 8, y - 22, w + 16, h + 32, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7f9db0';
  ctx.font = `700 11px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', x, y - 8);
  ctx.textAlign = 'right';
  ctx.fillStyle = alarmUrgency(state) > 0.6 ? '#ff8fa3' : '#cfe6f2';
  ctx.fillText(alarmLabel(state), x + w, y - 8);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  const grad = ctx.createLinearGradient(x, 0, x + w, 0);
  grad.addColorStop(0, '#ffd166');
  grad.addColorStop(0.55, '#ff8a3d');
  grad.addColorStop(1, '#ff2d55');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(2, w * level), h, 4);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = 'rgba(255,255,255,0.26)';
  for (let i = 1; i < 10; i += 1) ctx.fillRect(x + (w / 10) * i, y, 1, h);

  if (state.alarm.seen > 0) {
    ctx.fillStyle = 'rgba(255, 77, 109, 0.9)';
    ctx.fillRect(x, y + h + 3, w * state.alarm.seen, 3);
  }
  ctx.restore();
}

function drawLootReadout(ctx, state) {
  const x = WORLD.width - 24;
  ctx.save();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#7f9db0';
  ctx.font = `700 11px ${FONT}`;
  ctx.fillText('SIGNAL HAUL', x, 26);
  ctx.fillStyle = '#ffd166';
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(`$${state.loot.value.toLocaleString('en-US')}`, x, 58);
  ctx.fillStyle = 'rgba(207, 230, 242, 0.55)';
  ctx.font = `11px ${FONT}`;
  ctx.fillText(`${state.loot.packets} packet${state.loot.packets === 1 ? '' : 's'} · ${state.thief.carrying} carried`, x, 74);
  ctx.restore();
}

function drawObjectiveBand(ctx, state) {
  const text = state.phase === 'escape' ? 'OBJECTIVE   GET BACK TO THE VAN' : 'OBJECTIVE   CRACK THE SIGNAL VAULT';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `700 13px ${FONT}`;
  const w = ctx.measureText(text).width + 30;
  ctx.fillStyle = 'rgba(6, 14, 22, 0.75)';
  ctx.beginPath();
  ctx.roundRect(WORLD.width / 2 - w / 2, 20, w, 26, 13);
  ctx.fill();
  ctx.strokeStyle = 'rgba(47, 211, 196, 0.32)';
  ctx.stroke();
  ctx.fillStyle = '#2fd3c4';
  ctx.fillText(text, WORLD.width / 2, 37);
  ctx.restore();
}

function drawToolBar(ctx, state) {
  const x = 24;
  const y = WORLD.height - 62;
  ctx.save();
  ctx.fillStyle = 'rgba(6, 14, 22, 0.82)';
  ctx.strokeStyle = 'rgba(47, 211, 196, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 8, y - 22, 446, 66, 8);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = `700 11px ${FONT}`;
  ctx.fillStyle = '#7f9db0';
  ctx.fillText('TOOLS   ·   SPACE USES   ·   Q CYCLES', x, y - 8);

  const selected = state.tools.selected;
  TOOL_ORDER.forEach((key, i) => {
    const tool = TOOLS[key];
    const count = state.tools[key];
    const ex = x + i * 142;
    const active = key === selected;
    ctx.fillStyle = active ? 'rgba(47, 211, 196, 0.16)' : 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = active ? '#2fd3c4' : 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.roundRect(ex, y, 130, 30, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = active ? '#2fd3c4' : tool.color;
    ctx.font = `700 12px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${tool.key}  ${tool.name.split(' ')[0]}`, ex + 9, y + 19);
    ctx.textAlign = 'right';
    ctx.fillStyle = count > 0 ? '#cfe6f2' : '#7a5a5a';
    ctx.fillText(`×${count}`, ex + 121, y + 19);
  });
  ctx.restore();
}

function drawMessageLine(ctx, state) {
  if (state.messageTimer <= 0 || !state.message) return;
  const alpha = Math.min(1, state.messageTimer / 0.6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.font = `700 19px ${FONT}`;
  const w = ctx.measureText(state.message).width + 36;
  ctx.fillStyle = 'rgba(6, 14, 22, 0.88)';
  ctx.beginPath();
  ctx.roundRect(WORLD.width / 2 - w / 2, WORLD.height - 138, w, 36, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.fillText(state.message, WORLD.width / 2, WORLD.height - 114);
  ctx.restore();
}

function drawThreatReadout(ctx, state) {
  const watchers = state.guards.filter((g) => g.seen).length + state.cameras.filter((c) => c.seen).length;
  const label = watchers > 0 ? `${watchers} EYES ON YOU` : 'UNSEEN';
  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = `700 13px ${FONT}`;
  ctx.fillStyle = watchers > 0 ? '#ff8fa3' : 'rgba(140, 224, 106, 0.85)';
  ctx.fillText(label, WORLD.width - 24, WORLD.height - 92);
  ctx.fillStyle = 'rgba(111, 146, 166, 0.8)';
  ctx.font = `11px ${FONT}`;
  ctx.fillText(`sneaking: ${state.thief.sneaking ? 'YES' : 'NO'}   ·   noise ${Math.round(state.thief.moving ? (state.thief.sneaking ? 12 : 40) : 0)}`, WORLD.width - 24, WORLD.height - 74);
  ctx.restore();
}

function drawPhaseHint(ctx, state) {
  let hint = '';
  if (state.phase === 'infiltrate') hint = 'E at the vault to work the lock';
  else if (state.phase === 'escape') hint = 'The van is lit — run south-west';
  if (!hint) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `400 14px ${FONT}`;
  ctx.fillStyle = 'rgba(207, 230, 242, 0.7)';
  ctx.fillText(hint, WORLD.width / 2, 66);
  ctx.restore();
}

export { WORLD };
