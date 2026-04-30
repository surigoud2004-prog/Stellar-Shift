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
    // Silent fail if audio context is blocked or unavailable
    console.warn('Audio playback failed', e);
  }
}

/**
 * Plays a bright, melodic 3-note ascending chime for successful matches.
 * Synthesizes a glass-like twinkling star sound.
 */
export function playMatchSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const shimmer = audioCtx.createOscillator(); // Harmonic for crystalline texture
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, start); // Octave up
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      // High-pass filter to remove mud and keep it "twinkly"
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

    // Ascending melodic chime (C6, E6, G6 approximate)
    playNote(1046.50, startTime, 0.4);
    playNote(1318.51, startTime + 0.12, 0.4);
    playNote(1567.98, startTime + 0.24, 0.6);
    
  } catch (e) {
    console.warn('Match audio failed', e);
  }
}
