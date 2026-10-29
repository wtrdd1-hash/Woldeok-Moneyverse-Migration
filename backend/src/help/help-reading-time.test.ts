import { describe, expect, it } from 'vitest';
import { estimateHelpReadingMinutes } from './help-reading-time';

describe('bounded approximate verified help reading time', () => {
  it('counts English words at approximately 200 per minute', () => {
    expect(estimateHelpReadingMinutes('word '.repeat(200), 'en')).toBe(1);
    expect(estimateHelpReadingMinutes('word '.repeat(201), 'en')).toBe(2);
  });
  it('counts Korean non-whitespace Unicode code points at approximately 500 per minute', () => {
    expect(estimateHelpReadingMinutes('가'.repeat(500), 'ko')).toBe(1);
    expect(estimateHelpReadingMinutes('가'.repeat(501), 'ko')).toBe(2);
    expect(estimateHelpReadingMinutes('가 '.repeat(501), 'ko')).toBe(2);
  });
  it('never claims zero or unlimited minutes for empty and long text', () => {
    expect(estimateHelpReadingMinutes('  \n ', 'ko')).toBe(1);
    expect(estimateHelpReadingMinutes('word '.repeat(5000), 'en')).toBe(25);
  });
});
