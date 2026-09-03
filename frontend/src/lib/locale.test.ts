import { describe, expect, it } from 'vitest';
import { detectLocale, isLocale } from './locale';

describe('locale detection', () => {
  it('keeps Korean as the default and for Korean traffic', () => {
    expect(detectLocale('KR', 'en-US,en;q=0.9')).toBe('ko');
    expect(detectLocale(null, null)).toBe('ko');
  });

  it('uses English for visitors outside Korea', () => {
    expect(detectLocale('US', 'ko-KR,ko;q=0.9')).toBe('en');
    expect(detectLocale('GB', null)).toBe('en');
  });

  it('uses browser English when country data is unavailable', () => {
    expect(detectLocale('XX', 'en-GB,en;q=0.8')).toBe('en');
    expect(detectLocale(null, 'ko-KR,ko;q=0.8')).toBe('ko');
  });

  it('only accepts supported explicit choices', () => {
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ja')).toBe(false);
  });
});
