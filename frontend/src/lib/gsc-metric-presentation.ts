/** 
 * Search Console presentation at the provider-evidence boundary.
 * A missing/failed provider is UNKNOWN, not observed zero.
 */
export interface GscMetricsInput {
  readonly source: 'unconfigured' | 'search-console' | 'error';
  readonly syncError: string | null;
  readonly totalClicks30d: number;
  readonly totalImpressions30d: number;
  readonly avgCtr30d: number;
  readonly avgPosition30d: number;
}

export interface GscMetricPresentation {
  readonly observed: boolean;
  readonly clicks: string;
  readonly impressions: string;
  readonly ctr: string;
  readonly position: string;
}

export function presentGscMetrics(
  data: GscMetricsInput,
  loadError: string | null,
): GscMetricPresentation {
  const observed = data.source === 'search-console'
    && !data.syncError
    && !loadError
    && Number.isFinite(data.totalClicks30d)
    && Number.isFinite(data.totalImpressions30d)
    && data.totalClicks30d >= 0
    && data.totalImpressions30d >= 0;

  if (!observed) {
    return {
      observed: false, clicks: '미측정', impressions: '미측정',
      ctr: '미측정', position: '미측정',
    };
  }

  const hasSearchImpressions = data.totalImpressions30d > 0;
  return {
    observed: true,
    clicks: data.totalClicks30d.toLocaleString('en-US'),
    impressions: data.totalImpressions30d.toLocaleString('en-US'),
    ctr: hasSearchImpressions && Number.isFinite(data.avgCtr30d)
      ? `${data.avgCtr30d}%`
      : '산출 불가',
    position: hasSearchImpressions
      && Number.isFinite(data.avgPosition30d)
      && data.avgPosition30d > 0
      ? `${data.avgPosition30d}위`
      : '산출 불가',
  };
}
