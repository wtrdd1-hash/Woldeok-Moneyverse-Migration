import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StockAlertPushEngine } from './stock-alert-push-engine';

const scenarios = [{ ticker: '005930', stockName: '가상 삼성전자', savedAt: 1761270000000 }];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function showBanner() {
  render(<StockAlertPushEngine />);
  act(() => { vi.advanceTimersByTime(3100); });
}

describe('stock alert handoff to authenticated server rules', () => {
  it('offers the real stock-alert rule form without requiring browser notification permission', () => {
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(scenarios));
    showBanner();
    const link = screen.getByRole('link', { name: /조건부 알림 설정/ });
    expect(link.getAttribute('href')).toBe('/stocks/alerts?stock=005930');
    expect(screen.getByText(/서버에서 직접 조건을 설정/)).toBeTruthy();
    expect(screen.queryByText(/알림 켜기/)).toBeNull();
    expect(localStorage.getItem('wdmv_push_active')).toBeNull();
  });

  it('never invents a market-close or dividend notification from local calculator history', () => {
    const notify = vi.fn();
    const requestPermission = vi.fn();
    Object.assign(notify, { permission: 'granted', requestPermission });
    vi.stubGlobal('Notification', notify);
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(scenarios));
    localStorage.setItem('wdmv_push_active', 'true');
    showBanner();
    act(() => { vi.advanceTimersByTime(12000); });
    expect(notify).not.toHaveBeenCalled();
    expect(requestPermission).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_last_market_push')).toBeNull();
    expect(localStorage.getItem('wdmv_push_active')).toBeNull();
  });

  it('dismisses with an accessible button and remembers the dismissal', () => {
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(scenarios));
    showBanner();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('link', { name: /조건부 알림 설정/ })).toBeNull();
    expect(localStorage.getItem('wdmv_push_banner_dismissed')).toBe('true');
  });

  it('does not put arbitrary local ticker strings into the server route', () => {
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([{ ticker: '../bad?x=1', stockName: '테스트', savedAt: 1 }]));
    showBanner();
    expect(screen.getByRole('link', { name: /조건부 알림 설정/ }).getAttribute('href')).toBe('/stocks/alerts');
  });
});
