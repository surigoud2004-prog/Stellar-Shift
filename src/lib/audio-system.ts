
'use client';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

function getNoiseBuffer(ctx: AudioContext) {
  if (!noiseBuffer) {
    const bufferSize = ctx.sampleRate * 1.0; // 1 second of noise
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

export function playSwapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playMatchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playRejectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playUIClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playLevelUpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  [440, 554.37, 659.25, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
  });
}

export function playBombSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const shuck = ctx.createOscillator();
  const shuckGain = ctx.createGain();
  shuck.type = 'sine';
  shuck.frequency.setValueAtTime(800, ctx.currentTime);
  shuck.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
  shuckGain.gain.setValueAtTime(0, ctx.currentTime);
  shuckGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
  shuckGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  shuck.connect(shuckGain);
  shuckGain.connect(ctx.destination);
  shuck.start();
  shuck.stop(ctx.currentTime + 0.1);

  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(60, ctx.currentTime + 0.1);
  boom.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.0);
  boomGain.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
  boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
  boom.connect(boomGain);
  boomGain.connect(ctx.destination);
  boom.start(ctx.currentTime + 0.1);
  boom.stop(ctx.currentTime + 1.0);
}

export function playCoinClinkSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * A triumphant celestial fanfare with pitch shifting every 5 levels.
 */
export function playVictoryFanfare(level: number = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const pitchShift = 1 + (Math.floor((level - 1) / 5) * 0.1);

  // 1. Ascending Crystalline Twinkles
  const twinkleFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].map(f => f * pitchShift);
  twinkleFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.2);
  });

  // 2. Warm Resonant Swell
  const swellStart = ctx.currentTime + 0.3;
  [261.63, 329.63, 392.00].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * pitchShift, swellStart);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, swellStart);
    filter.frequency.exponentialRampToValueAtTime(2200, swellStart + 1.2);

    gain.gain.setValueAtTime(0, swellStart);
    gain.gain.linearRampToValueAtTime(0.15, swellStart + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.01, swellStart + 2.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(swellStart);
    osc.stop(swellStart + 2.5);
  });

  // 3. Deep Orchestral Thud (Synced with Swell Peak and Coin Fountain)
  const thudTime = ctx.currentTime + 0.6;
  const thudOsc = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thudOsc.type = 'sine';
  thudOsc.frequency.setValueAtTime(55 * pitchShift, thudTime);
  thudOsc.frequency.exponentialRampToValueAtTime(20, thudTime + 0.8);
  thudGain.gain.setValueAtTime(0, thudTime);
  thudGain.gain.linearRampToValueAtTime(0.4, thudTime + 0.05);
  thudGain.gain.exponentialRampToValueAtTime(0.01, thudTime + 1.2);
  thudOsc.connect(thudGain);
  thudGain.connect(ctx.destination);
  thudOsc.start(thudTime);
  thudOsc.stop(thudTime + 1.2);
}

/**
 * A short, high-tech 'vacuum' whoosh sound followed by a soft digital chime for level transitions.
 */
export function playWarpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime;

  // 1. Vacuum Whoosh (Filtered Noise)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, startTime);
  filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(startTime);
  noiseSource.stop(startTime + 0.6);

  // 2. Soft Digital Chime
  const chimeTime = startTime + 0.5;
  const chimeOsc = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chimeOsc.type = 'triangle';
  chimeOsc.frequency.setValueAtTime(1200, chimeTime);
  chimeGain.gain.setValueAtTime(0, chimeTime);
  chimeGain.gain.linearRampToValueAtTime(0.1, chimeTime + 0.05);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.4);
  
  chimeOsc.connect(chimeGain);
  chimeGain.connect(ctx.destination);
  chimeOsc.start(chimeTime);
  chimeOsc.stop(chimeTime + 0.4);
}
