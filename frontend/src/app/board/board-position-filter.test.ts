import { describe, expect, it } from 'vitest';
import { parseBoardPositionFilter } from './board-position-filter';

describe('public board self-declared position filter', () => {
  it.each(['holder', 'no_position', 'operator_related', 'undisclosed'])('accepts %s', (value) => {
    expect(parseBoardPositionFilter(value)).toEqual({ position: value, invalid: false });
  });
  it('allows no filter', () => {
    expect(parseBoardPositionFilter(undefined)).toEqual({ position: null, invalid: false });
  });
  it.each(['', 'other', ['holder', 'undisclosed'], null])('rejects ambiguous position %j', (value) => {
    expect(parseBoardPositionFilter(value).invalid).toBe(true);
  });
});
