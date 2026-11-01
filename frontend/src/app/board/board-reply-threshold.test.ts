import { describe, expect, it } from 'vitest';
import { parseBoardReplyThreshold } from './board-reply-threshold';

describe('public board reply threshold', () => {
  it.each(['2', '5', '10'])('accepts a canonical threshold %s', (value) => {
    expect(parseBoardReplyThreshold(value)).toEqual({ minimum: Number(value), invalid: false });
  });
  it('allows the unfiltered list', () => {
    expect(parseBoardReplyThreshold(undefined)).toEqual({ minimum: null, invalid: false });
  });
  it.each(['0', '1', '02', '11', '', ['2', '5'], null])('rejects ambiguous threshold %j', (value) => {
    expect(parseBoardReplyThreshold(value).invalid).toBe(true);
  });
});
