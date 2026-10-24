import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiHealthDashboard, verifiedHealth } from './api-health-dashboard';

const sample = () => ({
  status: 'HEALTHY' as const,
  serverTime: new Date().toISOString(),
  uptimeSeconds: 120,
  dbLatencyMs: 3,
  systemTelemetry: {
    cpuLoad1m: 0.7, cpuCores: 4, totalMemMb: 4096, freeMemMb: 2000,
    heapUsedMb: 100, rssMb: 150, activeDbConnections: 2, dbCacheHitRatio: 98.2,
  },
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('measured administrator health UI', () => {
  it('rejects legacy fabricated fleet metrics before rendering', () => {
    expect(verifiedHealth({ ...sample(), domains: [], globalSuccessRate: 100 })).toBeNull();
    expect(verifiedHealth({ ...sample(), dbLatencyMs: null })).toBeNull();
  });

  it('displays only measured values and invalidates a failed refresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<ApiHealthDashboard initialData={sample()} isEn={false} />);
    expect(screen.getByText('데이터베이스 응답 확인')).toBeTruthy();
    expect(screen.getByText('3ms')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /지금 새로고침/ }));
    await waitFor(() => expect(screen.getByText('측정값이 없거나 최신 상태가 아닙니다')).toBeTruthy());
    expect(screen.queryByText('3ms')).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/admin/api-health', { cache: 'no-store' });
  });

  it('reports successful manual refresh from the guarded bridge', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ...sample(), dbLatencyMs: 7 }),
    }));
    render(<ApiHealthDashboard initialData={null} isEn={false} />);
    fireEvent.click(screen.getByRole('button', { name: /지금 새로고침/ }));
    await waitFor(() => expect(screen.getByText('7ms')).toBeTruthy());
    expect(screen.getByRole('button', { name: /자동 갱신 켜짐/ }).getAttribute('aria-pressed')).toBe('true');
  });
});
