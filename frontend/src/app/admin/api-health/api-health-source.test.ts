import { describe, expect, it } from 'vitest';
import { parseApiHealthResponse } from './api-health-source';

const base = {
  status: 'UNKNOWN', serverTime: new Date().toISOString(), uptimeSeconds: 42,
  dbLatencyMs: 3, dbProbe: { status: 'OPERATIONAL', measuredAt: new Date().toISOString(), source: 'POSTGRESQL_SELECT_1' },
  isLiveTelemetry: false, totalDomains: 1, totalEndpoints: 3,
  averageLatencyMs: null, globalSuccessRate: null,
  domains: [{ id: 'wallet', name: '지갑', nameEn: 'Wallet', endpointCount: 3,
    status: 'UNKNOWN', latencyMs: null, successRate: null, measuredAt: null,
    measurementSource: 'NOT_MEASURED', sampleEndpoints: ['/api/v1/wallet/balance'] }],
};

describe('admin API health measured source contract', () => {
  it('accepts a genuine database-only probe without claiming route measurements', () => {
    const parsed = parseApiHealthResponse(base);
    expect(parsed?.dbProbe?.status).toBe('OPERATIONAL');
    expect(parsed?.globalSuccessRate).toBeNull();
    expect(parsed?.domains[0]?.measurementSource).toBe('NOT_MEASURED');
  });

  it.each([
    { domains: {} },
    { domains: [{ ...base.domains[0], sampleEndpoints: null }] },
    { domains: [{ ...base.domains[0], successRate: 100 }] },
    { domains: [{ ...base.domains[0], status: 'OPERATIONAL' }] },
    { isLiveTelemetry: true },
    { globalSuccessRate: 100 },
    { averageLatencyMs: 1 },
    { totalEndpoints: 999 },
    { totalDomains: 2 },
    { domains: [base.domains[0], base.domains[0]], totalDomains: 2, totalEndpoints: 6 },
    { systemTelemetry: { cpuLoad1m: Number.POSITIVE_INFINITY } },
    { serverTime: 'not-a-time' },
  ])('rejects fabricated or malformed status evidence %j', (override) => {
    expect(parseApiHealthResponse({ ...base, ...override })).toBeNull();
  });
});
