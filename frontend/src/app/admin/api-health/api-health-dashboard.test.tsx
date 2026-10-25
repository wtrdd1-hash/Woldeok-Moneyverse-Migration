import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

describe('admin API health dashboard', () => {
  it('does not invent healthy metrics or backup configuration when telemetry is absent', () => {
    const html = renderToStaticMarkup(createElement(ApiHealthDashboard, { initialData: null, isEn: true }));
    expect(html).toContain('Unavailable');
    expect(html).not.toContain('100.0%');
    expect(html).not.toContain('99.9%');
    expect(html).not.toContain('moneyverse-backup');
    expect(html).not.toContain('100% 정상 가동');
  });
  it('shows an unmeasured domain as unknown even when a DB ping is available', () => {
    const sample: ApiHealthResponse = {
      status: 'UNKNOWN', serverTime: '2026-10-25T14:50:00Z', uptimeSeconds: 120,
      dbLatencyMs: 4, isLiveTelemetry: true, totalDomains: 1, totalEndpoints: 2,
      averageLatencyMs: null, globalSuccessRate: null,
      domains: [{ id: 'auth', name: '인증', nameEn: 'Auth', endpointCount: 2, status: 'UNKNOWN', latencyMs: null, successRate: null, sampleEndpoints: ['/api/v1/auth/session'] }],
    };
    const html = renderToStaticMarkup(createElement(ApiHealthDashboard, { initialData: sample, isEn: true }));
    expect(html).toContain('Not measured');
    expect(html).toContain('UNKNOWN');
    expect(html).toContain('DB ping 4ms');
    expect(html).not.toContain('100.0%');
  });

});
