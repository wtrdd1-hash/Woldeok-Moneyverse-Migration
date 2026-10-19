import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('v922 real provider evidence in operator Search Console card', () => {
  it('uses state-aware metric labels instead of reporting unavailable as zero', () => {
    const source = readFileSync(join(__dirname, 'gsc-analytics-card.tsx'), 'utf8');
    expect(source).toContain('presentGscMetrics(data, loadError)');
    expect(source).toContain('{metricLabels.clicks}');
    expect(source).toContain('{metricLabels.impressions}');
    expect(source).toContain('{metricLabels.ctr}');
    expect(source).toContain('{metricLabels.position}');
    expect(source).not.toContain('{(data?.totalClicks30d ?? 0).toLocaleString()}');
    expect(source).not.toContain('{(data?.totalImpressions30d ?? 0).toLocaleString()}');
    expect(source).not.toContain('{data?.avgCtr30d ?? 0}%');
    expect(source).not.toContain('{data?.avgPosition30d ?? 0}위');
    expect(source).not.toContain('Googlebot 실제 검색 노출수');
  });
});
