import { describe, expect, it } from 'vitest';
import { parseSeasonRankWindow, seasonRankHref } from './rank-window';

it.each([[undefined, 20], ['3', 3], ['10', 10], ['20', 20]] as const)(
  'accepts the season rank window %s', (input, expected) => {
    expect(parseSeasonRankWindow(input)).toEqual({ limit: expected, invalid: false });
  },
);

it.each(['', '03', '50', '3.0', ['3', '10'], ['3'], 'all', '0'])(
  'rejects invalid season rank window %s', (input) => {
    expect(parseSeasonRankWindow(input).invalid).toBe(true);
  },
);

it('keeps the selected event while changing leaderboard rank window', () => {
  expect(seasonRankHref('11111111-1111-4111-8111-111111111111', 3))
    .toBe('/seasons?event=11111111-1111-4111-8111-111111111111&limit=3');
});
