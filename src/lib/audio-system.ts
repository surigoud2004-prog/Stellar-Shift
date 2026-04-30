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
 */
export function playSpecialActivationSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;
    const duration = 1.5;

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

/**
 * Plays a soft, low-pass filtered 'zip' sound for rejected alignments.
 */
export function playRejectSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const duration = 0.3;
    const startTime = audioCtx.currentTime;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, startTime);
    filter.Q.setValueAtTime(1, startTime);

    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.warn('Reject audio failed', e);
  }
}

/**
 * Plays a rapid-fire succession of shimmering bell sounds, 
 * each one slightly higher in pitch than the last based on comboLevel.
 */
export function playComboSound(comboLevel: number) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;

    const notes = [0, 2, 4, 7, 9, 12]; // Pentatonic scale steps
    const noteIdx = comboLevel % notes.length;
    const octave = Math.floor(comboLevel / notes.length);
    const baseFreq = 523.25 * Math.pow(2, octave) * Math.pow(1.05946, notes[noteIdx]); // Starting from C5

    const playShimmerBell = (freq: number, start: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, start + 0.4);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(start);
      osc.stop(start + 0.5);
    };

    // Rapid fire succession for this combo level
    for (let i = 0; i < 4; i++) {
      playShimmerBell(baseFreq * (1 + i * 0.05), startTime + i * 0.08);
    }
  } catch (e) {
    console.warn('Combo audio failed', e);
  }
}

/**
 * Plays a clean mechanical click with a soft digital hum.
 */
export function playUIClickSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const startTime = audioCtx.currentTime;

    // The "Click" part (High frequency transient)
    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, startTime);
    clickGain.gain.setValueAtTime(0, startTime);
    clickGain.gain.linearRampToValueAtTime(0.04, startTime + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    const clickFilter = audioCtx.createBiquadFilter();
    clickFilter.type = 'lowpass';
    clickFilter.frequency.setValueAtTime(2500, startTime);

    // The "Hum" part (Low frequency body)
    const humOsc = audioCtx.createOscillator();
    const humGain = audioCtx.createGain();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(220, startTime);
    humGain.gain.setValueAtTime(0, startTime);
    humGain.gain.linearRampToValueAtTime(0.02, startTime + 0.02);
    humGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    clickOsc.connect(clickGain);
    clickGain.connect(clickFilter);
    clickFilter.connect(audioCtx.destination);

    humOsc.connect(humGain);
    humGain.connect(audioCtx.destination);

    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.05);
    humOsc.start(startTime);
    humOsc.stop(startTime + 0.15);
  } catch (e) {
    console.warn('UI Click audio failed', e);
  }
}
