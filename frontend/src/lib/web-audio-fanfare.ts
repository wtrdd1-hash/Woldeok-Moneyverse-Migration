/**
 * Web Audio API based Synth Fanfare Sound Engine
 * Generates arpeggiated triumph fanfares without downloading external audio files.
 */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // User interaction will resume later
    });
  }
  return sharedAudioContext;
}

export interface FanfareOptions {
  volume?: number; // 0.0 ~ 1.0 (default: 0.3)
  tempo?: number; // Note duration multiplier
}

/**
 * Play victory arpeggio fanfare (C5 -> E5 -> G5 -> C6)
 */
export function playVictoryFanfare(options: FanfareOptions = {}): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  const volume = Math.min(1, Math.max(0, options.volume ?? 0.3));
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Victory Notes in Hertz: C5, E5, G5, C6, G5, C6 (Triumphant Chord Fanfare)
  const notes: { freq: number; start: number; duration: number }[] = [
    { freq: 523.25, start: 0.0, duration: 0.12 }, // C5
    { freq: 659.25, start: 0.12, duration: 0.12 }, // E5
    { freq: 783.99, start: 0.24, duration: 0.14 }, // G5
    { freq: 1046.5, start: 0.38, duration: 0.45 }, // C6 (long hold)
    { freq: 783.99, start: 0.85, duration: 0.12 }, // G5
    { freq: 1046.5, start: 0.98, duration: 0.65 }, // C6 (final triumph)
  ];

  const startTime = ctx.currentTime + 0.05;

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'triangle'; // Rich and warm brass-like harmonic tone
    osc.frequency.setValueAtTime(note.freq, startTime + note.start);

    // ADSR envelope: Fast attack, gentle decay
    const noteStart = startTime + note.start;
    const noteEnd = noteStart + note.duration;

    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.8, noteStart + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.05);
  }
}

/**
 * Play quick bid confirmation chime (G5 -> C6)
 */
export function playBidChime(options: FanfareOptions = {}): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  const volume = Math.min(1, Math.max(0, options.volume ?? 0.25));
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const notes = [
    { freq: 783.99, start: 0.0, duration: 0.08 }, // G5
    { freq: 1046.5, start: 0.08, duration: 0.25 }, // C6
  ];

  const startTime = ctx.currentTime + 0.02;

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, startTime + note.start);

    const noteStart = startTime + note.start;
    const noteEnd = noteStart + note.duration;

    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.7, noteStart + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.05);
  }
}
