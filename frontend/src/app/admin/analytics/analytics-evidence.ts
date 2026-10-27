import type { SeoInitialData } from '../seo/seo-client-view';
import { parseSeoObservation } from '../seo/seo-observation';

export interface AnalyticsDomainEvidence {
  readonly id: string;
  readonly name: string;
  readonly endpointCount: number;
  readonly status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'UNKNOWN';
  readonly latencyMs: number | null;
  readonly successRate: number | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonnegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function fresh(value: unknown, nowMs: number): boolean {
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= nowMs + 60_000 && nowMs - timestamp <= 5 * 60_000;
}

/** API health route metrics are not inferred from the database SELECT 1 probe. */
export function parseAnalyticsApiHealth(value: unknown, nowMs = Date.now()): readonly AnalyticsDomainEvidence[] | null {
  if (!record(value) || !fresh(value.serverTime, nowMs) || !Array.isArray(value.domains)) return null;
  if (!nonnegativeInteger(value.totalDomains) || value.totalDomains !== value.domains.length || value.domains.length > 50) return null;
  if (!nonnegativeInteger(value.totalEndpoints)) return null;
  const seen = new Set<string>();
  let endpoints = 0;
  const domains: AnalyticsDomainEvidence[] = [];
  for (const domain of value.domains) {
    if (!record(domain) || typeof domain.id !== 'string' || !/^[a-z][a-z0-9_-]{0,39}$/.test(domain.id)
      || seen.has(domain.id) || typeof domain.name !== 'string' || !domain.name.trim()
      || !nonnegativeInteger(domain.endpointCount) || domain.endpointCount > 10_000) return null;
    seen.add(domain.id);
    endpoints += domain.endpointCount;
    const status = domain.status;
    if (!['OPERATIONAL', 'DEGRADED', 'MAINTENANCE', 'UNKNOWN'].includes(String(status))) return null;
    if (domain.measurementSource === 'NOT_MEASURED') {
      if (domain.latencyMs !== null || domain.successRate !== null || domain.measuredAt !== null || status !== 'UNKNOWN') return null;
      domains.push({ id: domain.id, name: domain.name, endpointCount: domain.endpointCount, status: 'UNKNOWN', latencyMs: null, successRate: null });
    } else if (domain.measurementSource === 'ROUTE_METRICS') {
      if (!fresh(domain.measuredAt, nowMs)
        || typeof domain.latencyMs !== 'number' || !Number.isFinite(domain.latencyMs) || domain.latencyMs < 0
        || typeof domain.successRate !== 'number' || !Number.isFinite(domain.successRate)
        || domain.successRate < 0 || domain.successRate > 100) return null;
      domains.push({ id: domain.id, name: domain.name, endpointCount: domain.endpointCount,
        status: status as AnalyticsDomainEvidence['status'], latencyMs: domain.latencyMs, successRate: domain.successRate });
    } else return null;
  }
  return endpoints === value.totalEndpoints ? domains : null;
}

/** Reuse the administrator SEO parser and do not send the IndexNow credential to a client chart. */
export function parseAnalyticsSeo(value: unknown, observedAt = new Date().toISOString()): SeoInitialData | null {
  const parsed = parseSeoObservation(value, observedAt);
  return parsed ? { ...parsed, indexNowKey: '' } : null;
}
