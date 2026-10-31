import { describe, expect, it } from 'vitest';
import { verifiedSeasonLeaderboard } from './season-leaderboard-proof';

const valid = { entries: [{ rank: 1, points: '9007199254740993', entries: '2', display_name: 'Member' }] };

describe('Android season leaderboard source proof', () => {
  it('accepts canonical exact integer strings without Number precision loss', () => {
    expect(verifiedSeasonLeaderboard(valid, 3)).toBe(true);
    expect(verifiedSeasonLeaderboard({ entries: [] }, 10)).toBe(true);
  });
  it.each([
    { entries: [{ rank: 1, points: Number('9007199254740993'), entries: '1', display_name: 'Member' }] },
    { entries: [{ rank: 4, points: '2', entries: '1', display_name: 'Member' }] },
    { entries: [{ rank: 1, points: '-1', entries: '1', display_name: 'Member' }] },
    { entries: [{ rank: 1, points: '1', entries: '01', display_name: 'Member' }] },
    { entries: [{ rank: 1, points: '1', entries: '1', display_name: '' }] },
    { entries: Array.from({ length: 4 }, (_, i) => ({ rank: i + 1, points: '1', entries: '1', display_name: 'Member' })) },
    { entries: [{ rank: 2, points: '1', entries: '1', display_name: 'Member' }, { rank: 1, points: '1', entries: '1', display_name: 'Member' }] },
    { entries: [{ rank: 1, points: '1', entries: '1', display_name: 'Member', user_id: 'private' }] },
    { entries: [{ rank: 1, points: '9'.repeat(80), entries: '1', display_name: 'Member' }] },
    { entries: [{ rank: 1, points: '1', entries: '1', display_name: 'Member' }], internalToken: 'secret' },
    { entries: 'not-an-array' },
  ])('rejects malformed or out-of-scope 200 data', (payload) => {
    expect(verifiedSeasonLeaderboard(payload, 3)).toBe(false);
  });
});
