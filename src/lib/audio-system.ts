'use client';

/**
 * @fileOverview A synthesized audio system for Stellar Shift.
 * Uses Web Audio API to create cosmic sound effects without external assets.
 * Background music has been decommissioned to ensure a focused tactical environment.
 */

let sfxEnabled = true;
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function toggleSFX(enabled: boolean) {
  sfxEnabled = enabled;
}

export function toggleMusic(enabled: boolean) {
  // Decommissioned: Background music is no longer supported
}

export function startBackgroundMusic() {
  // Decommissioned: Background music is no longer supported
}

export function playSwapSound() {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const duration = 0.3;
    const startTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
}

export function playMatchSound() {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.06, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(1046.50, startTime, 0.3);
    playNote(1318.51, startTime + 0.1, 0.3);
    playNote(1567.98, startTime + 0.2, 0.5);
  } catch (e) {
    console.warn('Match audio failed', e);
  }
}

export function playSpecialActivationSound() {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;
    const duration = 1.0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, startTime);
    osc.frequency.exponentialRampToValueAtTime(2400, startTime + duration);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {
    console.warn('Special activation audio failed', e);
  }
}

export function playRejectSound() {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const duration = 0.2;
    const startTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, startTime);
    oscillator.frequency.linearRampToValueAtTime(150, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.04, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.warn('Reject audio failed', e);
  }
}

export function playComboSound(comboLevel: number) {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;

    const notes = [0, 2, 4, 7, 9, 12];
    const noteIdx = comboLevel % notes.length;
    const octave = Math.floor(comboLevel / notes.length);
    const baseFreq = 523.25 * Math.pow(2, octave) * Math.pow(1.05946, notes[noteIdx]);

    const playShimmerBell = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    };

    for (let i = 0; i < 3; i++) {
      playShimmerBell(baseFreq * (1 + i * 0.02), startTime + i * 0.06);
    }
  } catch (e) {
    console.warn('Combo audio failed', e);
  }
}

export function playUIClickSound() {
  if (typeof window === 'undefined' || !sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;

    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1600, startTime);
    clickGain.gain.setValueAtTime(0, startTime);
    clickGain.gain.linearRampToValueAtTime(0.03, startTime + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.03);
  } catch (e) {
    console.warn('UI Click audio failed', e);
  }
}
