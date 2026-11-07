// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { AdvisorClient } from './advisor-client';

const diagnosis = {
  prIndex: 70, riskLevel: 'MODERATE', createdAt: '2026-11-01T00:00:00.000Z',
  assetSummary: { cash: 100, savings: 200, stocks: 300, bonds: 400, total: 1000,
    stockCount: 2, topStockSymbol: 'CHIPS', topStockRatio: 60 },
};

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('advisor member view', () => {
  it('does not show invented metrics when the owner source is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));
    render(<AdvisorClient />);
    await screen.findByText(/검증된 자산 분석 자료가 없어/);
    expect(screen.queryByText(/1,245만|1\.84|14\.2%/)).toBeNull();
    const retry = screen.getByRole('button', { name: '다시 확인' });
    fireEvent.click(retry);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it('shows only validated source values with an as-of receipt and no trading button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true,
      json: async () => ({ sourceStatus: 'VERIFIED', diagnosis }) }));
    render(<AdvisorClient />);
    expect(await screen.findByRole('region', { name: '검증된 가상 자산 진단' })).toBeTruthy();
    expect(screen.getByText('1,000 WLD')).toBeTruthy();
    expect(screen.getByText('70 / 100')).toBeTruthy();
    expect(screen.getByText(/현재 시세나 실시간 잔액을 보장하지 않습니다/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /체결|주문/ })).toBeNull();
  });

  it('distinguishes missing consent or authentication from source failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }));
    render(<AdvisorClient />);
    expect(await screen.findByText(/본인 인증 및 동의/)).toBeTruthy();
    expect(screen.getByRole('link', { name: '로그인하기' })).toBeTruthy();
  });
});
