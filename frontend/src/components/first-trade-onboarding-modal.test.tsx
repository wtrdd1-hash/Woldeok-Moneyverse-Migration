import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FirstTradeOnboardingModal } from './first-trade-onboarding-modal';

describe('FirstTradeOnboardingModal verified trade guidance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    localStorage.setItem('auth_user', '{}');
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([
      { ticker: '005930', stockName: '삼성전자', targetPrice: '100', reboundRate: '5', savedAt: 1 },
    ]));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('only guides the user to the server-backed exchange, never fabricates a trade or WLD grant', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response);
    render(<FirstTradeOnboardingModal />);
    act(() => vi.advanceTimersByTime(1100));

    expect(screen.getByRole('dialog', { name: /첫 주식 거래 안내/ })).toBeTruthy();
    const exchangeLink = screen.getByRole('link', { name: /주식 거래소에서 직접 확인하기/ });
    expect(exchangeLink.getAttribute('href')).toBe('/stocks');
    expect(screen.queryByText(/지급 완료|체결 완료|1초 원클릭 모의 매수 체결/)).toBeNull();

    fireEvent.click(exchangeLink);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_virtual_holdings')).toBeNull();
    expect(localStorage.getItem('wdmv_first_trade_onboarded')).toBe('true');
  });

  it('does not invent a default stock or prompt without a saved calculator scenario', () => {
    localStorage.removeItem('wdmv_saved_scenarios');
    render(<FirstTradeOnboardingModal />);
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
