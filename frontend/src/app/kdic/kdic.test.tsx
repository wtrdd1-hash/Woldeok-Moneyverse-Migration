import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import KdicPortalPage from './page';

const sample = {
  success: true,
  data: {
    fund: { fundName: '월덕 가상 보호기금', totalFundWld: 1500, protectionLimitPerUser: 500000,
      totalInsuredDepositsWld: 900, isEmergencyMode: false, updatedAt: '2026-10-26T00:00:00.000Z' },
    institutions: [{ id: 'bank-a', institutionName: '월덕 가상은행', institutionType: 'BANK',
      bisRatioPct: 12.5, soundnessGrade: 'GRADE_1', totalDepositsWld: 900,
      premiumRatePct: 0.08, status: 'HEALTHY' }],
    summary: { totalInsuredInstitutions: 1, totalDepositsWld: 900,
      averageBisRatioPct: 12.5, reserveCoverageRatioPct: 166.7 },
  },
};

describe('KDIC portal — truthful virtual-only protection snapshot', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => vi.unstubAllGlobals());
  it('shows an unavailable state rather than fabricated reserves or legal guarantees', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    render(<KdicPortalPage />);
    expect(screen.queryByText(/10,000,000 WLD/)).toBeNull();
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/조회할 수 없/));
    expect(screen.queryByText(/대한민국 예금자보호법 제31조 공식 적용/)).toBeNull();
    expect(screen.queryByText(/법적으로 전액 보호/)).toBeNull();
  });
  it('shows only server-provided reserves and institutions with an explicit virtual-only notice', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => sample } as Response);
    render(<KdicPortalPage />);
    await waitFor(() => expect(screen.getByText(/1,500 WLD/)).toBeDefined());
    expect(screen.getByText(/현실의 예금보험이나 법적 보장과 무관/)).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: /금융기관/ }));
    expect(screen.getByText('월덕 가상은행')).toBeDefined();
    expect(screen.queryByText(/월덕투자증권 \(Investment Securities\)/)).toBeNull();
  });
  it('provides keyboard-accessible tabs and an illustrative-only calculator', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => sample } as Response);
    render(<KdicPortalPage />);
    await waitFor(() => expect(screen.getByText(/1,500 WLD/)).toBeDefined());
    const calculator = screen.getByRole('button', { name: /시뮬레이션 계산/ });
    fireEvent.click(calculator);
    expect(screen.getByRole('status').textContent).toMatch(/예시 계산/);
    expect(screen.queryByText(/법적 보호 금액/)).toBeNull();
    expect(screen.getByRole('tab', { name: /금융기관/ }).getAttribute('class')).toMatch(/min-h-11/);
  });
});
