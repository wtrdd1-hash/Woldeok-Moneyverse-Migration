import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StockAlertPushEngine } from './stock-alert-push-engine';

vi.mock('@/lib/use-viewer', () => ({ useViewer: () => ({ signedIn: true, consentCurrent: true, adminRoles: [] }) }));
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([{ ticker: 'CHIPS', stockName: 'CHIPS', type: 'stock', savedAt: 1 }])); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('StockAlertPushEngine', () => {
  it('links to actual server alert registration without pretending browser permission is a subscription', () => {
    render(<StockAlertPushEngine />);
    act(() => { vi.advanceTimersByTime(3500); });
    expect(screen.getByRole('link', { name: /서버 조건부 알림 설정/ }).getAttribute('href')).toBe('/stocks/alerts?stock=CHIPS');
    expect(screen.queryByRole('button', { name: /알림 켜기/ })).toBeNull();
  });

  it('does not generate fabricated market-close browser notifications', () => {
    const send = vi.fn();
    Object.assign(send, { permission: 'granted', requestPermission: vi.fn() });
    vi.stubGlobal('Notification', send);
    render(<StockAlertPushEngine />);
    act(() => { vi.advanceTimersByTime(11000); });
    expect(send).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_push_active')).toBeNull();
  });
});
