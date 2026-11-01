import { describe, expect, it } from 'vitest';
import { isVerifiedBoardDisclosure, parseBoardDisclosure } from './board-disclosure';

describe('public board self-reported position disclosure', () => {
  it.each(['holder', 'no_position', 'operator_related', 'undisclosed'])(
    'accepts only the declared disclosure %s', (value) => {
      expect(parseBoardDisclosure(value)).toEqual({ value, invalid: false });
    },
  );
  it('preserves unfiltered default', () => {
    expect(parseBoardDisclosure(undefined)).toEqual({ value: null, invalid: false });
  });
  it.each(['verified_holder', '', ['holder', 'no_position'], '<script>'])(
    'rejects malformed or duplicate values', (value) => {
      expect(parseBoardDisclosure(value).invalid).toBe(true);
    },
  );
});


describe('verified public disclosure rows', () => {
  it('refuses a missing filter marker even for empty posts', () => {
    expect(isVerifiedBoardDisclosure({ posts: [] }, 'holder')).toBe(false);
  });
  it('accepts an explicitly verified empty snapshot', () => {
    expect(isVerifiedBoardDisclosure({ posts: [], appliedFilters: { positionDisclosure: 'holder' } }, 'holder')).toBe(true);
  });
});
