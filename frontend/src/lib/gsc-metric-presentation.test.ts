import { describe, expect, it } from 'vitest';
import { presentGscMetrics, type GscMetricsInput } from './gsc-metric-presentation';

const observed: GscMetricsInput = {
  source: 'search-console',
  syncError: null,
  totalClicks30d: 0,
  totalImpressions30d: 0,
  avgCtr30d: 0,
  avgPosition30d: 0,
};

describe('v922 Search Console evidence truth', () => {
  it.each(['unconfigured', 'error'] as const)('does not turn %s into measured zero traffic', (source) => {
    expect(presentGscMetrics({ ...observed, source }, null)).toEqual({
      observed: false, clicks: '미측정', impressions: '미측정',
      ctr: '미측정', position: '미측정',
    });
  });

  it('handles provider requests that fail after previously valid data', () => {
    expect(presentGscMetrics({ ...observed, totalClicks30d: 12 }, 'request failed').clicks)
      .toBe('미측정');
    expect(presentGscMetrics({ ...observed, syncError: '403' }, null).impressions)
      .toBe('미측정');
  });

  it('preserves an observed genuine zero count, but does not invent CTR or rank', () => {
    expect(presentGscMetrics(observed, null)).toEqual({
      observed: true, clicks: '0', impressions: '0',
      ctr: '산출 불가', position: '산출 불가',
    });
  });

  it('presents actual provider numbers with denominators', () => {
    expect(presentGscMetrics({
      ...observed, totalClicks30d: 32, totalImpressions30d: 1000,
      avgCtr30d: 3.2, avgPosition30d: 12.4,
    }, null)).toEqual({
      observed: true, clicks: '32', impressions: '1,000',
      ctr: '3.2%', position: '12.4위',
    });
  });

  it('does not mistake non-finite metrics for Search Console evidence', () => {
    expect(presentGscMetrics({ ...observed, totalClicks30d: NaN }, null).observed).toBe(false);
  });
});
