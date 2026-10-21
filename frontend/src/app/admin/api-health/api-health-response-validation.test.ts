import { describe, expect, it } from 'vitest';
import { isFreshApiHealthResponse } from './api-health-response-validation';

const now = Date.parse('2026-10-21T02:45:00.000Z');
const sample = {
  status: 'UNKNOWN',
  dbStatus: 'OPERATIONAL',
  serverTime: new Date(now - 1000).toISOString(),
  uptimeSeconds: 120,
  totalDomains: 1,
  totalEndpoints: 2,
  averageLatencyMs: null,
  globalSuccessRate: null,
  domains: [{
    id: 'auth', name: '인증', nameEn: 'Auth', endpointCount: 2,
    status: 'UNKNOWN', latencyMs: null, successRate: null,
    sampleEndpoints: ['/api/v1/auth/session'],
  }],
};

describe('admin API health response freshness', () => {
  it('accepts a current, unmeasured API inventory response', () => {
    expect(isFreshApiHealthResponse(sample, now)).toBe(true);
  });

  it('rejects a stale or future-dated 200 response', () => {
    expect(isFreshApiHealthResponse({ ...sample, serverTime: new Date(now - 180_000).toISOString() }, now)).toBe(false);
    expect(isFreshApiHealthResponse({ ...sample, serverTime: new Date(now + 60_000).toISOString() }, now)).toBe(false);
  });

  it('rejects missing, malformed, or fabricated metrics', () => {
    expect(isFreshApiHealthResponse({ ...sample, serverTime: 'invalid' }, now)).toBe(false);
    expect(isFreshApiHealthResponse({ ...sample, globalSuccessRate: 110 }, now)).toBe(false);
    expect(isFreshApiHealthResponse({ ...sample, domains: 'broken' }, now)).toBe(false);
    expect(isFreshApiHealthResponse(null, now)).toBe(false);
  });

  it('rejects contradictory inventory counts and invalid domain values', () => {
    expect(isFreshApiHealthResponse({ ...sample, totalDomains: 2 }, now)).toBe(false);
    expect(isFreshApiHealthResponse({ ...sample, domains: [{ ...sample.domains[0], successRate: -1 }] }, now)).toBe(false);
    expect(isFreshApiHealthResponse({ ...sample, domains: [{ ...sample.domains[0], status: 'OPERATIONAL', latencyMs: null, successRate: null }] }, now)).toBe(false);
  });
});
