import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminSeoAuditView } from './admin-seo-audit-view';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const snapshot = {
  timestamp: new Date().toISOString(), candidateUrlCount: 2,
  telemetry: { totalHits24h: 12, totalHits7d: 30, avgDurationMs: 87, botDistribution: { Googlebot: 7 } },
  telemetryStatus: 'observed', indexingStatus: 'not_measured', schemaValidationStatus: 'not_measured',
};

const response = (body: unknown) => ({ ok: true, json: async () => body });

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('admin SEO audit UI evidence and accessibility', () => {
  it('does not show forged crawler totals or enable IndexNow on malformed GET evidence', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...snapshot,
      telemetry: { ...snapshot.telemetry, totalHits24h: '12' },
    })));
    render(<AdminSeoAuditView />);
    expect(await screen.findByText('수집 감사 응답을 검증할 수 없습니다.')).toBeTruthy();
    expect(screen.queryByText('12')).toBeNull();
    expect((screen.getByRole('button', { name: /IndexNow URL 제출/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: '다시 시도' }).className).toContain('min-h-11');
  });

  it('does not claim IndexNow accepted when the BFF receipt is incomplete', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response(snapshot))
      .mockResolvedValueOnce(response({ ok: true, submittedCount: '2', status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminSeoAuditView />);
    const submit = await screen.findByRole('button', { name: /IndexNow URL 제출/ });
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByText(/응답 시각:/)).toBeTruthy();
    fireEvent.click(submit);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByText(/검색 결과 색인 여부는 확인되지 않았습니다/)).toBeNull();
  });

  it('keeps the submit control disabled when no real candidate URL exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...snapshot, candidateUrlCount: 0 })));
    render(<AdminSeoAuditView />);
    await screen.findByText('0개');
    expect((screen.getByRole('button', { name: /IndexNow URL 제출/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
