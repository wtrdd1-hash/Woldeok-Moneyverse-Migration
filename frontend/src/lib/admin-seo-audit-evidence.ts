/** A private admin audit still needs to treat upstream JSON as untrusted evidence. */
export interface SeoAuditTelemetry {
  readonly totalHits24h: number;
  readonly totalHits7d: number;
  readonly avgDurationMs: number;
  readonly botDistribution: Readonly<Record<string, number>>;
}

export interface SeoAuditSnapshot {
  readonly timestamp: string;
  readonly candidateUrlCount: number;
  readonly telemetry: SeoAuditTelemetry | null;
  readonly telemetryStatus: 'observed' | 'unavailable';
  readonly indexingStatus: 'not_measured';
  readonly schemaValidationStatus: 'not_measured';
}

export interface IndexNowReceipt {
  readonly ok: true;
  readonly submittedCount: number;
  readonly status: 200 | 202;
  readonly indexingConfirmed: false;
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_RESPONSE_AGE_MS = 10 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 2 * 60 * 1000;

const BOT_LABELS = new Set([
  'Googlebot', 'Bingbot', 'DuckDuckBot', 'Baiduspider', 'Applebot',
  'YandexBot', 'Yeti', 'Naver', 'Other',
]);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseSeoTelemetry(value: unknown): SeoAuditTelemetry | null {
  if (!record(value) || !count(value.totalHits24h) || !count(value.totalHits7d) ||
      value.totalHits24h > value.totalHits7d ||
      typeof value.avgDurationMs !== 'number' || !Number.isFinite(value.avgDurationMs) ||
      value.avgDurationMs < 0 || !record(value.botDistribution)) return null;

  const entries = Object.entries(value.botDistribution);
  if (entries.length > BOT_LABELS.size) return null;
  let observed = 0;
  const distribution: Record<string, number> = Object.create(null);
  for (const [name, hits] of entries) {
    if (!BOT_LABELS.has(name) || !count(hits)) return null;
    observed += hits;
    if (!Number.isSafeInteger(observed) || observed > value.totalHits24h) return null;
    distribution[name] = hits;
  }
  return { totalHits24h: value.totalHits24h, totalHits7d: value.totalHits7d,
    avgDurationMs: value.avgDurationMs, botDistribution: distribution };
}

export function parseSeoAuditSnapshot(value: unknown): SeoAuditSnapshot | null {
  if (!record(value) || typeof value.timestamp !== 'string' || !ISO_UTC.test(value.timestamp) ||
      !Number.isFinite(Date.parse(value.timestamp)) ||
      new Date(value.timestamp).toISOString() !== value.timestamp ||
      Date.now() - Date.parse(value.timestamp) > MAX_RESPONSE_AGE_MS ||
      Date.parse(value.timestamp) - Date.now() > MAX_CLOCK_SKEW_MS ||
      !count(value.candidateUrlCount) ||
      value.indexingStatus !== 'not_measured' || value.schemaValidationStatus !== 'not_measured') return null;
  if (value.telemetryStatus === 'unavailable' && value.telemetry === null) {
    return { timestamp: value.timestamp, candidateUrlCount: value.candidateUrlCount,
      telemetry: null, telemetryStatus: 'unavailable', indexingStatus: 'not_measured', schemaValidationStatus: 'not_measured' };
  }
  if (value.telemetryStatus !== 'observed') return null;
  const telemetry = parseSeoTelemetry(value.telemetry);
  return telemetry ? { timestamp: value.timestamp, candidateUrlCount: value.candidateUrlCount,
    telemetry, telemetryStatus: 'observed', indexingStatus: 'not_measured', schemaValidationStatus: 'not_measured' } : null;
}

export function parseIndexNowReceipt(value: unknown): IndexNowReceipt | null {
  if (!record(value) || value.ok !== true || !count(value.submittedCount) ||
      value.submittedCount === 0 || (value.status !== 200 && value.status !== 202) ||
      value.indexingConfirmed !== false) return null;
  return { ok: true, submittedCount: value.submittedCount, status: value.status, indexingConfirmed: false };
}
