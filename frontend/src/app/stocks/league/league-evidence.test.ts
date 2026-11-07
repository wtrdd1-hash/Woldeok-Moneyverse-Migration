import { describe, expect, it } from 'vitest';
import { verifyStockLeague } from './league-evidence';

const uuid = (tail: string) => `12345678-1234-4234-8234-${tail}`;
const season = { id: uuid('000000000001'), status: 'active', title: 'Autumn season', startsAt: '2026-10-01T00:00:00.000Z', endsAt: '2026-11-01T00:00:00.000Z' };
const whale = { id: uuid('000000000002'), seasonId: season.id, userId: uuid('000000000003'), userName: 'Trader', initialAsset: 100000, currentAsset: 125000, roiRate: 25, rankPosition: 1, tier: 'Gold', isWhale: true, followerCount: 5, createdAt: '2026-10-12T00:00:00.000Z' };

describe('verified league read contract', () => {
  it('accepts a real season with source-backed whale records', () => {
    expect(verifyStockLeague({ success: true, season, whales: [whale], leaderboard: [], mySubscriptions: [] })).toMatchObject({ season, whales: [whale] });
  });
  it('accepts a verified empty season but not an error-shaped empty result', () => {
    expect(verifyStockLeague({ success: true, season: null, whales: [], leaderboard: [] })).toMatchObject({ season: null, whales: [] });
    expect(verifyStockLeague({ error: 'unavailable', whales: [] })).toBeNull();
  });
  it('rejects unsafe WLD amounts, impossible ROI and duplicate traders', () => {
    expect(verifyStockLeague({ success: true, season, whales: [{ ...whale, currentAsset: Number.MAX_SAFE_INTEGER + 1 }] })).toBeNull();
    expect(verifyStockLeague({ success: true, season, whales: [{ ...whale, roiRate: Infinity }] })).toBeNull();
    expect(verifyStockLeague({ success: true, season, whales: [whale, whale] })).toBeNull();
  });
  it('rejects mismatched season, fake identity, invalid counts and malformed dates', () => {
    expect(verifyStockLeague({ success: true, season, whales: [{ ...whale, seasonId: uuid('000000000004') }] })).toBeNull();
    expect(verifyStockLeague({ success: true, season, whales: [{ ...whale, userId: 'whale-01' }] })).toBeNull();
    expect(verifyStockLeague({ success: true, season, whales: [{ ...whale, followerCount: -2 }] })).toBeNull();
    expect(verifyStockLeague({ success: true, season: { ...season, startsAt: 'n/a' }, whales: [] })).toBeNull();
  });
  it('rejects a seasonless leaderboard or missing success proof', () => {
    expect(verifyStockLeague({ success: true, season: null, whales: [whale] })).toBeNull();
    expect(verifyStockLeague({ season, whales: [whale] })).toBeNull();
  });
});
