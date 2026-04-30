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
