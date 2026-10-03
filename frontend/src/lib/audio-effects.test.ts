// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isAudioMuted,
  setAudioMuted,
  toggleAudioMute,
  playBetChipSound,
  playReelTickSound,
  playCardFlipSound,
  playWinSound,
  playJackpotSound,
  playCoinCollectSound,
} from './audio-effects';

describe('Web Audio Procedural Sound Effects Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to unmuted and saves mute preference in localStorage', () => {
    expect(isAudioMuted()).toBe(false);

    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);
    expect(localStorage.getItem('wdmv_audio_muted')).toBe('true');

    const next = toggleAudioMute();
    expect(next).toBe(false);
    expect(isAudioMuted()).toBe(false);
  });

  it('executes sound triggers safely without throwing errors in mock/browser environment', () => {
    expect(() => playBetChipSound()).not.toThrow();
    expect(() => playReelTickSound()).not.toThrow();
    expect(() => playCardFlipSound()).not.toThrow();
    expect(() => playWinSound()).not.toThrow();
    expect(() => playJackpotSound()).not.toThrow();
    expect(() => playCoinCollectSound()).not.toThrow();
  });

  it('bypasses sound generation when muted', () => {
    setAudioMuted(true);
    expect(() => {
      playBetChipSound();
      playJackpotSound();
    }).not.toThrow();
  });
});
