// COLD SIGNAL — original sound, made in the browser with WebAudio. No files.
let ctx = null;
let master = null;

export function initAudio() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
  return ctx;
}

/** One short tone with an envelope. */
function tone(freq, duration, type = 'sine', gain = 0.2, slideTo = null) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ctx.currentTime + duration);
  amp.gain.setValueAtTime(0.0001, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(amp);
  amp.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

/** A filtered burst of noise. */
function noise(duration, gain = 0.15, freq = 900) {
  if (!ctx) return;
  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const amp = ctx.createGain();
  amp.gain.value = gain;
  source.connect(filter);
  filter.connect(amp);
  amp.connect(master);
  source.start();
}

/** The vault's lock turning over. */
export function playPickTick() {
  tone(880, 0.05, 'square', 0.08);
}

/** A data packet leaving the vault. */
export function playLootTaken() {
  tone(520, 0.12, 'triangle', 0.18, 1180);
  window.setTimeout(() => tone(1180, 0.14, 'triangle', 0.14, 1560), 90);
}

/** A guard spotting the thief. */
export function playSpotted() {
  tone(220, 0.3, 'sawtooth', 0.16, 660);
  window.setTimeout(() => tone(660, 0.22, 'sawtooth', 0.13, 880), 130);
}

/** The smoke veil going up. */
export function playSmoke() {
  noise(0.55, 0.16, 520);
}

/** A coin landing somewhere else. */
export function playCoin() {
  tone(1320, 0.09, 'sine', 0.13, 1760);
}

/** The getaway. */
export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => window.setTimeout(() => tone(f, 0.35, 'triangle', 0.16), i * 130));
}

/** Caught. */
export function playLose() {
  tone(300, 0.6, 'sawtooth', 0.2, 70);
  noise(0.5, 0.12, 260);
}

/** A soft click for the interface. */
export function playBlip() {
  tone(1046, 0.05, 'sine', 0.07);
}
