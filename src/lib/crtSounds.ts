// Lightweight WebAudio synth for retro terminal sounds.
// No external assets, no network — generated on the fly.

type SoundFlags = {
  keyboard: boolean;
  modem: boolean;
  errorBeep: boolean;
  toggleClick: boolean;
};

export type SoundLoudness = "low" | "med" | "high";

const LOUDNESS_GAIN: Record<SoundLoudness, number> = {
  low: 0.18,
  med: 0.35,
  high: 0.65,
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let loudness: SoundLoudness = "med";
let flags: SoundFlags = {
  keyboard: false,
  modem: false,
  errorBeep: false,
  toggleClick: false,
};

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = LOUDNESS_GAIN[loudness];
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundFlags(next: Partial<SoundFlags>) {
  flags = { ...flags, ...next };
}

export function getSoundFlags(): SoundFlags {
  return flags;
}

export function setSoundLoudness(next: SoundLoudness) {
  loudness = next;
  if (masterGain) masterGain.gain.value = LOUDNESS_GAIN[next];
}

export function getSoundLoudness(): SoundLoudness {
  return loudness;
}

// ---------- KEYBOARD CLACK ----------
// Short noise burst + low thud — mechanical/teletype feel.
export function playKeyClack() {
  if (!flags.keyboard) return;
  const ac = getCtx();
  if (!ac || !masterGain) return;
  const now = ac.currentTime;
  const dur = 0.045;

  // Noise click
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const nGain = ac.createGain();
  nGain.gain.value = 0.25 + Math.random() * 0.1;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1500;
  noise.connect(hp).connect(nGain).connect(masterGain);
  noise.start(now);
  noise.stop(now + dur);

  // Low thud
  const osc = ac.createOscillator();
  osc.type = "square";
  const f = 90 + Math.random() * 40;
  osc.frequency.setValueAtTime(f, now);
  osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + 0.04);
  const oGain = ac.createGain();
  oGain.gain.setValueAtTime(0.15, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(oGain).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.06);
}

// ---------- TOGGLE CLICK ----------
export function playToggleClick() {
  if (!flags.toggleClick) return;
  const ac = getCtx();
  if (!ac || !masterGain) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.18, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(g).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.06);
}

// ---------- ERROR BEEP ----------
export function playErrorBeep() {
  if (!flags.errorBeep) return;
  const ac = getCtx();
  if (!ac || !masterGain) return;
  const now = ac.currentTime;
  // two harsh square beeps
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.18;
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = 220;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(g).connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }
}

// ---------- MODEM HANDSHAKE ----------
// Stylized 56k handshake: tones, FSK warble, white-noise hiss.
let modemActive = false;
export function playModemHandshake(): () => void {
  if (!flags.modem) return () => {};
  const ac = getCtx();
  if (!ac || !masterGain) return () => {};
  if (modemActive) return () => {};
  modemActive = true;

  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = 0.25;
  out.connect(masterGain);

  const stops: Array<() => void> = [];

  // Sequence of pure tones (DTMF-ish dial then carrier squawk)
  const tones: Array<[number, number, number]> = [
    [now + 0.0, 0.18, 1209],
    [now + 0.2, 0.18, 1336],
    [now + 0.4, 0.18, 1477],
    [now + 0.65, 0.3, 2100], // answer tone
    [now + 1.0, 0.45, 1100], // calling tone
  ];
  tones.forEach(([t, dur, freq]) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    g.gain.setValueAtTime(0.5, t + dur - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    stops.push(() => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    });
  });

  // FSK warble (two oscillators alternating)
  const warbleStart = now + 1.5;
  const warbleEnd = now + 2.6;
  const o1 = ac.createOscillator();
  o1.type = "sine";
  const lfo = ac.createOscillator();
  lfo.type = "square";
  lfo.frequency.value = 18;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 400;
  lfo.connect(lfoGain).connect(o1.frequency);
  o1.frequency.value = 1700;
  const wg = ac.createGain();
  wg.gain.setValueAtTime(0.0001, warbleStart);
  wg.gain.exponentialRampToValueAtTime(0.4, warbleStart + 0.05);
  wg.gain.setValueAtTime(0.4, warbleEnd - 0.05);
  wg.gain.exponentialRampToValueAtTime(0.0001, warbleEnd);
  o1.connect(wg).connect(out);
  o1.start(warbleStart);
  lfo.start(warbleStart);
  o1.stop(warbleEnd + 0.05);
  lfo.stop(warbleEnd + 0.05);
  stops.push(() => {
    try {
      o1.stop();
      lfo.stop();
    } catch {
      /* ignore */
    }
  });

  // Hiss / carrier noise
  const hissStart = now + 2.4;
  const hissEnd = now + 3.6;
  const noiseDur = hissEnd - hissStart;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * noiseDur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.6;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.0001, hissStart);
  ng.gain.exponentialRampToValueAtTime(0.35, hissStart + 0.1);
  ng.gain.setValueAtTime(0.35, hissEnd - 0.2);
  ng.gain.exponentialRampToValueAtTime(0.0001, hissEnd);
  noise.connect(bp).connect(ng).connect(out);
  noise.start(hissStart);
  noise.stop(hissEnd + 0.05);
  stops.push(() => {
    try {
      noise.stop();
    } catch {
      /* ignore */
    }
  });

  const totalMs = (hissEnd - now + 0.1) * 1000;
  const timer = window.setTimeout(() => {
    modemActive = false;
  }, totalMs);

  return () => {
    window.clearTimeout(timer);
    stops.forEach((s) => s());
    modemActive = false;
  };
}
