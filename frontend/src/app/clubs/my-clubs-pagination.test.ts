import { describe, expect, it } from 'vitest';
import { clubMembershipPageHref, formatClubExperience, parseMembershipOffset } from './my-clubs-pagination';

describe('club membership pagination', () => {
  it('rejects malformed, negative and excessive offsets without throwing', () => {
    for (const raw of ['-1', '1.5', '1e3', '1000001', 'abc']) {
      expect(parseMembershipOffset(raw)).toBe(0);
    }
    expect(parseMembershipOffset('50')).toBe(50);
  });

  it('does not round virtual EXP values larger than JavaScript safe integers', () => {
    expect(formatClubExperience('9007199254740993')).toBe('9,007,199,254,740,993');
    expect(formatClubExperience('not-a-number')).toBe('—');
  });

  it('preserves the public club search while advancing owner membership pages', () => {
    expect(clubMembershipPageHref(25, 'A&B')).toBe('/clubs?myOffset=25&search=A%26B');
    expect(clubMembershipPageHref(0, '')).toBe('/clubs?myOffset=0');
  });
});
