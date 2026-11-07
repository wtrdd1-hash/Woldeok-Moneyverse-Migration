import { describe, expect, it } from 'vitest';
import { parsePhotoMonth, photoMatchesSeoulMonth } from './photo-month';

describe('published photo Seoul month contract', () => {
  it('accepts exactly one canonical month', () => {
    expect(parsePhotoMonth({ month: '2026-11' })).toBe('2026-11');
    expect(parsePhotoMonth({})).toBeNull();
  });
  it.each([
    { month: ['2026-11', '2026-10'] },
    { month: '2026-13' },
    { month: '2026-1' },
    { month: '2026-11', extra: 'ignored' },
    { month: '' },
  ])('rejects invalid or ambiguous query %#', (query) => {
    expect(() => parsePhotoMonth(query)).toThrow();
  });
  it('uses Seoul month boundary, not UTC month', () => {
    expect(photoMatchesSeoulMonth('2026-10-31T15:00:00.000Z', '2026-11')).toBe(true);
    expect(photoMatchesSeoulMonth('2026-10-31T14:59:59.999Z', '2026-11')).toBe(false);
    expect(photoMatchesSeoulMonth(null, '2026-11')).toBe(false);
  });
});
