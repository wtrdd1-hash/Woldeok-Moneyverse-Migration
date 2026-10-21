import type { ApiHealthResponse, DomainHealthData } from './api-health-dashboard';

const statuses = new Set(['OPERATIONAL', 'DEGRADED', 'MAINTENANCE', 'UNKNOWN']);
const finiteMetric = (value: unknown, max = Number.POSITIVE_INFINITY): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max);

function validDomain(value: unknown): value is DomainHealthData {
  if (!value || typeof value !== 'object') return false;
  const domain = value as Partial<DomainHealthData>;
  return typeof domain.id === 'string'
    && typeof domain.name === 'string'
    && typeof domain.nameEn === 'string'
    && Number.isSafeInteger(domain.endpointCount)
    && (domain.endpointCount ?? -1) >= 0
    && typeof domain.status === 'string'
    && statuses.has(domain.status)
    && finiteMetric(domain.latencyMs)
    && finiteMetric(domain.successRate, 100)
    && (domain.status !== 'OPERATIONAL' || domain.latencyMs !== null || domain.successRate !== null)
    && Array.isArray(domain.sampleEndpoints)
    && domain.sampleEndpoints.every(endpoint => typeof endpoint === 'string');
}

/** Fail closed: HTTP 200 alone is not evidence that an API health snapshot is current. */
export function isFreshApiHealthResponse(value: unknown, nowMs = Date.now()): value is ApiHealthResponse {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<ApiHealthResponse>;
  if (typeof data.serverTime !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(data.serverTime)) return false;
  const observedAt = Date.parse(data.serverTime);
  if (!Number.isFinite(observedAt) || observedAt < nowMs - 120_000 || observedAt > nowMs + 30_000) return false;
  if (!['HEALTHY', 'DEGRADED', 'UNKNOWN'].includes(data.status ?? '')) return false;
  if (data.dbStatus !== undefined && !['OPERATIONAL', 'DEGRADED', 'UNKNOWN'].includes(data.dbStatus)) return false;
  if (!Number.isSafeInteger(data.totalDomains) || !Number.isSafeInteger(data.totalEndpoints)) return false;
  if ((data.totalDomains ?? -1) < 0 || (data.totalEndpoints ?? -1) < 0) return false;
  if (!finiteMetric(data.averageLatencyMs) || !finiteMetric(data.globalSuccessRate, 100)) return false;
  if (!Array.isArray(data.domains) || data.domains.length !== data.totalDomains) return false;
  return data.domains.every(validDomain)
    && data.domains.reduce((sum, domain) => sum + domain.endpointCount, 0) === data.totalEndpoints;
}
