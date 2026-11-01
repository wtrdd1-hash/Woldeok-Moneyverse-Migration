import type { TrafficAnalyticsDashboard } from './traffic-dashboard';

type Granularity = TrafficAnalyticsDashboard['granularity'];
type RequestWindow = { readonly granularity: Granularity; readonly periods: number };

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 64 &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function bucket(value: unknown, granularity: Granularity): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = new Date(value);
  if (!Number.isFinite(time.getTime()) || time.toISOString().slice(0, 10) !== value) return false;
  return granularity === 'day' || value.endsWith('-01');
}

function ranked(
  value: unknown,
  label: 'path' | 'source' | 'country',
  maxEntries: number,
): value is readonly Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > 20) return false;
  const seen = new Set<string>();
  let total = 0;
  for (const row of value) {
    if (!object(row) || typeof row[label] !== 'string' || row[label].length < 1 ||
        row[label].length > (label === 'path' ? 500 : 255) ||
        seen.has(row[label]) || !count(row.entries)) return false;
    seen.add(row[label]);
    total += row.entries;
    if (!Number.isSafeInteger(total) || total > maxEntries) return false;
    if (label === 'path' && (!count(row.anonymousEntries) || row.anonymousEntries > row.entries)) return false;
  }
  return true;
}

/** Do not render untrusted analytics as authoritative admin metrics. */
export function parseTrafficEvidence(value: unknown, request: RequestWindow): TrafficAnalyticsDashboard | null {
  if (!object(value) || value.granularity !== request.granularity || value.periods !== request.periods ||
      !timestamp(value.rangeStart) || !timestamp(value.generatedAt) ||
      Date.parse(value.generatedAt) < Date.parse(value.rangeStart) || !object(value.summary)) return null;

  const summary = value.summary;
  if (!count(summary.pageViews) || !count(summary.uniqueSessions) ||
      !count(summary.authenticatedUsers) || !count(summary.anonymousSessions) ||
      summary.uniqueSessions > summary.pageViews ||
      summary.authenticatedUsers > summary.uniqueSessions ||
      summary.anonymousSessions > summary.uniqueSessions) return null;

  if (!Array.isArray(value.series) || value.series.length > request.periods) return null;
  let totalViews = 0;
  let previous = '';
  for (const row of value.series) {
    if (!object(row) || !bucket(row.bucket, request.granularity) || row.bucket <= previous ||
        !count(row.pageViews) || !count(row.uniqueSessions) || !count(row.authenticatedUsers) ||
        row.uniqueSessions > row.pageViews || row.authenticatedUsers > row.uniqueSessions) return null;
    previous = row.bucket;
    totalViews += row.pageViews;
    if (!Number.isSafeInteger(totalViews)) return null;
  }
  if (totalViews !== summary.pageViews ||
      !ranked(value.landingPages, 'path', summary.uniqueSessions) ||
      !ranked(value.sources, 'source', summary.uniqueSessions) ||
      !ranked(value.countries, 'country', summary.uniqueSessions)) return null;
  if (value.landingPages.reduce((sum: number, row: Record<string, unknown>) =>
    sum + (row.anonymousEntries as number), 0) > summary.anonymousSessions) return null;

  return value as unknown as TrafficAnalyticsDashboard;
}
