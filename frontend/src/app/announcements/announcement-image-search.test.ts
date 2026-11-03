import { describe, expect, it } from 'vitest';
import { parseAnnouncementImageQuery } from './announcement-image-search';

describe('published announcement image description filter', () => {
  it('normalizes a bounded literal search and distinguishes invalid from unfiltered', () => {
    expect(parseAnnouncementImageQuery('  제주 %_  ')).toEqual({ query: '제주 %_', invalid: false });
    expect(parseAnnouncementImageQuery(undefined)).toEqual({ query: null, invalid: false });
    for (const value of [' ', 'a', 'x'.repeat(81), '<img>', 'one\ntwo', ['a', 'b']]) {
      expect(parseAnnouncementImageQuery(value).invalid).toBe(true);
    }
  });
});
