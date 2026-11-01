import type { ApiHealthResponse, DomainHealthData, SystemTelemetry } from './api-health-dashboard';

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const metric = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const percentage = (value: unknown): value is number => metric(value) && value <= 100;
const timestamp = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
  Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 300_000;

function telemetry(value: unknown): value is SystemTelemetry {
  if (!record(value)) return false;
  return metric(value.cpuLoad1m) && count(value.cpuCores) && value.cpuCores > 0 &&
    count(value.totalMemMb) && value.totalMemMb > 0 && count(value.freeMemMb) &&
    value.freeMemMb <= value.totalMemMb && metric(value.heapUsedMb) &&
    metric(value.rssMb) && (value.activeDbConnections === null || count(value.activeDbConnections)) &&
    (value.dbCacheHitRatio === undefined || value.dbCacheHitRatio === null || percentage(value.dbCacheHitRatio));
}

function domain(value: unknown): value is DomainHealthData {
  if (!record(value) || typeof value.id !== 'string' || !/^[a-z][a-z0-9-]{0,49}$/.test(value.id) ||
    typeof value.name !== 'string' || value.name.length === 0 || value.name.length > 120 ||
    typeof value.nameEn !== 'string' || value.nameEn.length === 0 || value.nameEn.length > 120 ||
    !count(value.endpointCount) || value.status !== 'UNKNOWN' || value.latencyMs !== null ||
    value.successRate !== null || value.measuredAt !== null || value.measurementSource !== 'NOT_MEASURED' ||
    !Array.isArray(value.sampleEndpoints) || value.sampleEndpoints.length > 12) return false;
  return value.sampleEndpoints.every((endpoint: unknown) =>
    typeof endpoint === 'string' && endpoint.length <= 180 &&
    /^\/api\/v1\/[a-zA-Z0-9_/:.-]+$/.test(endpoint));
}

/** Current backend measures DB/host only. Reject unproven route health, not just malformed JSON. */
export function parseApiHealthResponse(value: unknown): ApiHealthResponse | null {
  if (!record(value) || !timestamp(value.serverTime) || !count(value.uptimeSeconds) ||
    !['UNKNOWN', 'DEGRADED'].includes(String(value.status)) ||
    value.isLiveTelemetry !== false || value.averageLatencyMs !== null ||
    value.globalSuccessRate !== null || !Array.isArray(value.domains) ||
    value.domains.length > 50 || !count(value.totalDomains) ||
    value.totalDomains !== value.domains.length || !count(value.totalEndpoints) ||
    !record(value.dbProbe) || !['OPERATIONAL', 'DEGRADED', 'UNKNOWN'].includes(String(value.dbProbe.status)) ||
    !(value.dbProbe.measuredAt === null || timestamp(value.dbProbe.measuredAt)) ||
    (value.dbProbe.status === 'UNKNOWN'
      ? value.dbProbe.source !== 'NOT_MEASURED' || value.dbProbe.measuredAt !== null || value.dbLatencyMs !== null
      : value.dbProbe.source !== 'POSTGRESQL_SELECT_1' || value.dbProbe.measuredAt === null) ||
    (value.dbProbe.status === 'OPERATIONAL' ? !metric(value.dbLatencyMs) : value.dbLatencyMs !== null) ||
    (value.dbProbe.status === 'DEGRADED' ? value.status !== 'DEGRADED' : value.status !== 'UNKNOWN') ||
    (value.systemTelemetry !== undefined && !telemetry(value.systemTelemetry))) return null;
  const domains: DomainHealthData[] = [];
  const seen = new Set<string>();
  let endpoints = 0;
  for (const entry of value.domains as unknown[]) {
    if (!domain(entry) || seen.has(entry.id)) return null;
    seen.add(entry.id);
    endpoints += entry.endpointCount;
    if (!Number.isSafeInteger(endpoints)) return null;
    domains.push(entry);
  }
  if (endpoints !== value.totalEndpoints) return null;
  return value as unknown as ApiHealthResponse;
}
