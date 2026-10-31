import { describe, expect, it } from 'vitest';
import { verifiedSeasonDeadlinePayload } from './season-deadline';
const now = new Date('2026-11-01T00:00:30.000Z');
const event = (ends_at: unknown, cost_wld: unknown = '900719925474099312345') => ({
  event_id: '11111111-1111-4111-8111-111111111111',
  season_id: '22222222-2222-4222-8222-222222222222',
  season_name: 'Autumn', title: 'Festival', description: '', cost_wld,
  points_per_entry: 10, ends_at,
});
const response = (events: unknown, asOfUtc = '2026-11-01T00:00:00.000Z') => ({ events, asOfUtc });
describe('verified 7-day season deadline evidence', () => {
  it('preserves exact integer-string WLD and accepts inclusive seven-day boundary', () => {
    const result = verifiedSeasonDeadlinePayload(response([event('2026-11-08T00:00:00.000Z')]), now);
    expect(result?.events[0]?.cost_wld).toBe('900719925474099312345');
    expect(verifiedSeasonDeadlinePayload(response([]), now)?.events).toEqual([]);
  });
  it.each([
    response([event('2026-10-31T23:59:59.000Z')]),
    response([event('2026-11-08T00:00:00.001Z')]),
    response([event('bad')]),
    response([event('2026-11-02T00:00:00.000Z', 100)]),
    response([event('2026-11-02T00:00:00.000Z'), event('2026-11-03T00:00:00.000Z')]),
    response([], '2026-10-31T00:00:00.000Z'),
    response([], '2026-11-01T00:05:00.000Z'),
    { events: [] },
    { events: null, asOfUtc: '2026-11-01T00:00:00.000Z' },
  ])('rejects missing, stale, malformed, duplicate or unfiltered success evidence', (payload) => {
    expect(verifiedSeasonDeadlinePayload(payload, now)).toBeNull();
  });
});
