import { describe, expect, it } from 'vitest';
import { canOfferStockLeagueJoin, formatStockLeagueRank } from './stock-league-rank';

describe('stock league rank evidence', () => {
  it('does not invent a position when rank aggregation is pending', () => {
    expect(formatStockLeagueRank(0)).toBe('집계 중');
    expect(formatStockLeagueRank(-1)).toBe('집계 중');
    expect(formatStockLeagueRank(Number.NaN)).toBe('집계 중');
  });
  it('renders the actual positive integer position', () => {
    expect(formatStockLeagueRank(37)).toBe('37위');
  });
});

describe('stock league join availability evidence', () => {
  it('never offers a paid join while owner status is unresolved or the season is absent', () => {
    expect(canOfferStockLeagueJoin(false, true, false)).toBe(false);
    expect(canOfferStockLeagueJoin(true, false, false)).toBe(false);
    expect(canOfferStockLeagueJoin(true, true, true)).toBe(false);
  });
  it('offers join only after a verified unjoined active season response', () => {
    expect(canOfferStockLeagueJoin(true, true, false)).toBe(true);
  });
});
