// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import FxPortalPage from './page';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('FX public member journey', () => {
  it('shows a transaction hold and no synthetic exchange rate when the server fails', async () => {
    const request = vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 }));
    vi.stubGlobal('fetch', request);
    render(<FxPortalPage />);
    expect(screen.getByText('환전·선물환 거래 중단')).toBeDefined();
    expect(await screen.findByText(/검증된 시장 정보를 가져오지 못했습니다/)).toBeDefined();
    expect(screen.queryByText(/1 가상 USD =/)).toBeNull();
    expect(request).toHaveBeenCalledWith('/api/fx/portal', expect.objectContaining({ cache: 'no-store' }));
  });

  it('renders only the server-verified rate and dated history, with no trading CTA', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: {
        reserves: { currency: 'USD', currentRate: 1477.25, totalReservesUsd: 50, isHalted: false, updatedAt: '2026-10-25T12:00:00.000Z' },
        history: [{ id: 'point-1', rate: 1477.25, changePct: -0.5, volumeUsd: 0, interventionType: 'NONE', createdAt: '2026-10-25T12:00:00.000Z' }],
      },
    }), { status: 200 })));
    render(<FxPortalPage />);
    expect(await screen.findByText(/1 가상 USD = 1,477.25 WLD/)).toBeDefined();
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.queryByRole('button', { name: /환전 실행|계약 체결/ })).toBeNull();
    expect(screen.getByRole('link', { name: '실제 WLD 지갑 거래 내역 확인' }).getAttribute('href')).toBe('/wallet');
  });
});
