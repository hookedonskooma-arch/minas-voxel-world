'use client';

import { useCallback } from 'react';

// Simple synthesized sound effects using Web Audio API
// No external files needed — works offline and is tiny

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playChord(freqs: number[], duration: number) {
  freqs.forEach((f, i) => {
    setTimeout(() => playTone(f, duration, 'sine', 0.1), i * 50);
  });
}

export function useSounds() {
  const pop = useCallback(() => {
    playTone(600, 0.12, 'sine', 0.12);
    setTimeout(() => playTone(800, 0.08, 'sine', 0.08), 60);
  }, []);

  const step = useCallback(() => {
    playTone(200, 0.05, 'triangle', 0.04);
  }, []);

  const questComplete = useCallback(() => {
    playChord([523, 659, 784, 1047], 0.4);
  }, []);

  const sticker = useCallback(() => {
    playTone(880, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.2, 'sine', 0.08), 100);
  }, []);

  const coin = useCallback(() => {
    playTone(1200, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1600, 0.15, 'sine', 0.08), 60);
  }, []);

  const error = useCallback(() => {
    playTone(300, 0.2, 'sawtooth', 0.06);
  }, []);

  return { pop, step, questComplete, sticker, coin, error };
}

export default function SoundEffects() {
  return null;
}
