import { create } from 'zustand';

// WebAudio sound effects — tiny synthetic sounds, no file deps
let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

const playTone = (freq, type, duration, gain = 0.15) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gn  = ctx.createGain();
    osc.connect(gn); gn.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gn.gain.setValueAtTime(gain, ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch { /* AudioContext blocked — silent */ }
};

const sounds = {
  click:   () => playTone(440, 'square', 0.05, 0.08),
  correct: () => { playTone(523, 'sine', 0.15, 0.15); setTimeout(() => playTone(659, 'sine', 0.15, 0.12), 120); },
  wrong:   () => playTone(220, 'sawtooth', 0.25, 0.12),
  levelup: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.18), i * 100));
  },
};

export const useSoundStore = create((set, get) => ({
  muted: localStorage.getItem('noesis_muted') === 'true',

  toggle: () => {
    const next = !get().muted;
    localStorage.setItem('noesis_muted', String(next));
    set({ muted: next });
  },

  play: (name) => {
    if (get().muted) return;
    sounds[name]?.();
  },
}));
