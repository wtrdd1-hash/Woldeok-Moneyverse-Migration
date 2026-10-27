import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

const unknownResponse = {
  status: 'UNKNOWN', serverTime: '2026-10-27T02:40:00.000Z', uptimeSeconds: 500,
  dbLatencyMs: 3, dbProbe: { status: 'OPERATIONAL', measuredAt: '2026-10-27T02:40:00.000Z', source: 'POSTGRESQL_SELECT_1' },
  isLiveTelemetry: false, totalDomains: 1, totalEndpoints: 3,
  averageLatencyMs: null, globalSuccessRate: null,
  domains: [{ id: 'wallet', name: '지갑', nameEn: 'Wallet', endpointCount: 3,
    status: 'UNKNOWN', latencyMs: null, successRate: null, measuredAt: null,
    measurementSource: 'NOT_MEASURED', sampleEndpoints: ['/api/v1/wallet/balance'] }],
} as unknown as ApiHealthResponse;

describe('API health dashboard evidence', () => {
  it('shows unmeasured domains without 100% healthy or fabricated latency', () => {
    const html = renderToStaticMarkup(<ApiHealthDashboard initialData={unknownResponse} isEn={false} />);
    expect(html).toContain('UNKNOWN');
    expect(html).toContain('측정되지 않음');
    expect(html).not.toContain('100% 정상 가동');
    expect(html).not.toContain('100.0%');
    expect(html).not.toContain('초고속 최적화');
  });

  it('does not show live metrics or success rates when no response exists', () => {
    const html = renderToStaticMarkup(<ApiHealthDashboard initialData={null} isEn={true} />);
    expect(html).not.toContain('LIVE METRICS');
    expect(html).not.toContain('100%');
    expect(html).toContain('Not measured');
  });
});
