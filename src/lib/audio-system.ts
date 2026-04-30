'use client';

/**
 * @fileOverview A synthesized audio system for Stellar Shift.
 * Uses Web Audio API to create cosmic sound effects without external assets.
 */

export function playSwapSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const duration = 0.5;
    const startTime = audioCtx.currentTime;

    // Primary whoosh layer
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(1800, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Shimmering crystalline layer
    const shimmer = audioCtx.createOscillator();
    const shimmerGain = audioCtx.createGain();

    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2500, startTime);
    shimmer.frequency.exponentialRampToValueAtTime(4500, startTime + duration);

    shimmerGain.gain.setValueAtTime(0, startTime);
    shimmerGain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Filter to smooth the sound
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(8000, startTime);
    filter.frequency.exponentialRampToValueAtTime(2000, startTime + duration);

    oscillator.connect(gainNode);
    shimmer.connect(shimmerGain);
    gainNode.connect(filter);
    shimmerGain.connect(filter);
    filter.connect(audioCtx.destination);

    oscillator.start();
    shimmer.start();
    oscillator.stop(startTime + duration);
    shimmer.stop(startTime + duration);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
}

export function playMatchSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const shimmer = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, start);
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, start);
      
      osc.connect(gainNode);
      shimmer.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(audioCtx.destination);
      
      osc.start(start);
      shimmer.start(start);
      osc.stop(start + duration);
      shimmer.stop(start + duration);
    };

    playNote(1046.50, startTime, 0.4);
    playNote(1318.51, startTime + 0.12, 0.4);
    playNote(1567.98, startTime + 0.24, 0.6);
    
  } catch (e) {
    console.warn('Match audio failed', e);
  }
}

/**
 * Plays an energetic cosmic burst sound for special items.
 * A blend of a deep synth 'om' and bright sparkling glitter. 1.5 seconds.
 */
export function playSpecialActivationSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;
    const duration = 1.5;

    // 1. Deep 'Om' Synth Layer
    const omOsc = audioCtx.createOscillator();
    const omGain = audioCtx.createGain();
    omOsc.type = 'sawtooth';
    omOsc.frequency.setValueAtTime(120, startTime);
    omOsc.frequency.exponentialRampToValueAtTime(40, startTime + duration);

    omGain.gain.setValueAtTime(0, startTime);
    omGain.gain.linearRampToValueAtTime(0.1, startTime + 0.2);
    omGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    const omFilter = audioCtx.createBiquadFilter();
    omFilter.type = 'lowpass';
    omFilter.frequency.setValueAtTime(400, startTime);
    omFilter.Q.setValueAtTime(10, startTime);

    omOsc.connect(omGain);
    omGain.connect(omFilter);
    omFilter.connect(audioCtx.destination);

    // 2. Sparkling Glitter Layer (Multiple high-pitched pings)
    for (let i = 0; i < 8; i++) {
      const pingOsc = audioCtx.createOscillator();
      const pingGain = audioCtx.createGain();
      const pingFreq = 2000 + Math.random() * 3000;
      const pingStart = startTime + Math.random() * 0.5;
      const pingDur = 0.5 + Math.random() * 0.5;

      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(pingFreq, pingStart);
      pingOsc.frequency.exponentialRampToValueAtTime(pingFreq * 1.5, pingStart + pingDur);

      pingGain.gain.setValueAtTime(0, pingStart);
      pingGain.gain.linearRampToValueAtTime(0.05, pingStart + 0.05);
      pingGain.gain.exponentialRampToValueAtTime(0.001, pingStart + pingDur);

      pingOsc.connect(pingGain);
      pingGain.connect(audioCtx.destination);
      pingOsc.start(pingStart);
      pingOsc.stop(pingStart + pingDur);
    }

    omOsc.start(startTime);
    omOsc.stop(startTime + duration);

  } catch (e) {
    console.warn('Special activation audio failed', e);
  }
}
