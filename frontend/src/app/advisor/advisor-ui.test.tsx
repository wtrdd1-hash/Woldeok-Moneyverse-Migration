import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AdvisorClient } from './advisor-client';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const diagnosis = { id: 'diagnosis-1', prIndex: 71, riskLevel: 'MODERATE', assetSummary: { cash: 123, savings: 7, stocks: 0, bonds: 0, total: 130, stockCount: 0, topStockSymbol: null, topStockRatio: 0 }, diagnosticNotes: ['server-provided note'], rebalanceSuggestions: [], createdAt: '2026-10-25T00:00:00Z' };

describe('Advisor client browser behavior', () => {
  it('shows the real diagnosis and no fabricated execution controls', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, diagnosis }), { status: 200 })));
    render(<AdvisorClient />);
    await waitFor(() => expect(screen.getByText('server-provided note')).toBeTruthy());
    expect(screen.getAllByText('130 WLD').length).toBeGreaterThan(0);
    expect(screen.queryByText(/1클릭 시장가 자동 리밸런싱/)).toBeNull();
    expect(screen.getByRole('link', { name: '가상 주식 거래소' }).getAttribute('href')).toBe('/stocks');
  });
  it('shows an explicit failure state, never demo balances', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<AdvisorClient />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('실제 포트폴리오 진단'));
    expect(screen.queryByText(/1,245만 WLD/)).toBeNull();
  });
});
