'use client';

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function playSwapSound() {
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
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
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
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
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
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
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
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
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
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
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
  
  // Implosion (vacuum shuck)
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

  // Deep resonant BOOM
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

  // Metallic shimmer/tinkle
  const tinkle = ctx.createOscillator();
  const tinkleGain = ctx.createGain();
  tinkle.type = 'sawtooth';
  tinkle.frequency.setValueAtTime(2000, ctx.currentTime + 0.5);
  tinkleGain.gain.setValueAtTime(0.05, ctx.currentTime + 0.5);
  tinkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
  tinkle.connect(tinkleGain);
  tinkleGain.connect(ctx.destination);
  tinkle.start(ctx.currentTime + 0.5);
  tinkle.stop(ctx.currentTime + 1.5);
}
