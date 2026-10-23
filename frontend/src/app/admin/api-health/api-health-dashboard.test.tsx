import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const unverified: ApiHealthResponse = {
  status: 'DB_REACHABLE', serverTime: '2026-10-23T13:00:00.000Z', uptimeSeconds: 10,
  dbProbeState: 'ok', dbLatencyMs: 5, isLiveTelemetry: false,
  totalDomains: 1, totalEndpoints: 9, averageLatencyMs: null, globalSuccessRate: null,
  domains: [{ id: 'auth', name: '인증', nameEn: 'Auth', endpointCount: 9, status: 'UNVERIFIED', latencyMs: null, successRate: null, sampleEndpoints: ['/api/v1/auth/session'] }],
};

describe('admin health dashboard evidence display', () => {
  it('shows unavailable rather than fabricated 14 domains, 8ms or 100% when the API cannot load', () => {
    render(<ApiHealthDashboard initialData={null} isEn={false} />);
    expect(screen.getByRole('status').textContent).toContain('상태 정보를 불러오지 못했습니다');
    expect(screen.queryByText('100.0%')).toBeNull();
    expect(screen.queryByText('8ms')).toBeNull();
    expect(screen.queryByText('14개')).toBeNull();
    expect(screen.queryByText('LIVE METRICS')).toBeNull();
  });

  it('separates measured database reachability from unverified API domain health', () => {
    render(<ApiHealthDashboard initialData={unverified} isEn={false} />);
    expect(screen.getByText('미검증')).toBeDefined();
    expect(screen.getByText(/DB 핑 5ms 실측/)).toBeDefined();
    expect(screen.queryByText('100.0%')).toBeNull();
    expect(screen.queryByText('100% 정상 가동')).toBeNull();
  });

  it('stops displaying old success as current after a failed refresh', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    render(<ApiHealthDashboard initialData={unverified} isEn={false} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('상태 정보를 불러오지 못했습니다'));
    expect(screen.queryByText(/DB 핑 5ms 실측/)).toBeNull();
    vi.unstubAllGlobals();
  });
});
