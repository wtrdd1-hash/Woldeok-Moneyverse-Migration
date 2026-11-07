import { describe, expect, it } from 'vitest';
import { parseTrafficEvidence } from './traffic-evidence';

const request = { granularity: 'day' as const, periods: 30 };
const valid = {
  granularity: 'day', periods: 30,
  rangeStart: '2026-10-02T15:00:00.000Z',
  generatedAt: '2026-11-01T19:00:00.000Z',
  summary: { pageViews: 4, uniqueSessions: 3, authenticatedUsers: 2, anonymousSessions: 1 },
  series: [{ bucket: '2026-11-01', pageViews: 4, uniqueSessions: 3, authenticatedUsers: 2 }],
  landingPages: [{ path: '/stocks', entries: 3, anonymousEntries: 1 }],
  sources: [{ source: '(direct)', entries: 3 }],
  countries: [{ country: 'KR', entries: 3 }],
};

describe('admin traffic source evidence', () => {
  it('accepts real SQL-shaped evidence and a verified empty sample', () => {
    expect(parseTrafficEvidence(valid, request)).toMatchObject(valid);
    expect(parseTrafficEvidence({
      ...valid, summary: { pageViews: 0, uniqueSessions: 0, authenticatedUsers: 0, anonymousSessions: 0 },
      series: [], landingPages: [], sources: [], countries: [],
    }, request)?.summary.pageViews).toBe(0);
  });

  it('accepts PostgreSQL month/year buckets without inventing missing periods', () => {
    for (const [granularity, periods, bucket] of [
      ['month', 24, '2026-11-01'], ['year', 10, '2026-01-01'],
    ] as const) {
      expect(parseTrafficEvidence({
        ...valid, granularity, periods, series: [{ ...valid.series[0], bucket }],
      }, { granularity, periods })).not.toBeNull();
    }
  });

  it.each([
    null, {}, { ...valid, granularity: 'month' }, { ...valid, periods: 31 },
    { ...valid, summary: { ...valid.summary, pageViews: '4' } },
    { ...valid, summary: { ...valid.summary, pageViews: -1 } },
    { ...valid, summary: { ...valid.summary, pageViews: Number.MAX_SAFE_INTEGER + 1 } },
    { ...valid, summary: { ...valid.summary, uniqueSessions: 5 } },
    { ...valid, summary: { ...valid.summary, anonymousSessions: 4 } },
    { ...valid, series: 'not-an-array' },
    { ...valid, series: [{ ...valid.series[0], pageViews: 3 }] },
    { ...valid, series: [valid.series[0], valid.series[0]] },
    { ...valid, series: [{ ...valid.series[0], bucket: '2026-11-02' }, { ...valid.series[0], bucket: '2026-11-01' }] },
    { ...valid, series: [{ ...valid.series[0], bucket: '2026-11-32' }] },
    { ...valid, series: [{ ...valid.series[0], uniqueSessions: 5 }] },
    { ...valid, landingPages: [{ ...valid.landingPages[0], anonymousEntries: 4 }] },
    { ...valid, landingPages: [{ ...valid.landingPages[0], entries: -1 }] },
    { ...valid, sources: Array.from({ length: 21 }, () => valid.sources[0]) },
    { ...valid, countries: [{ country: '', entries: 3 }] },
    { ...valid, generatedAt: 'not-a-time' },
  ])('rejects unverified or inconsistent analytics (%#)', (payload) => {
    expect(parseTrafficEvidence(payload, request)).toBeNull();
  });
});
