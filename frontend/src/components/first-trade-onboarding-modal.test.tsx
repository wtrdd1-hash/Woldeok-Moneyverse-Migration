import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FirstTradeOnboardingModal } from './first-trade-onboarding-modal';
import { LocaleProvider } from '@/components/locale-provider';

const scenario = { ticker: 'WDX-TEC', stockName: 'WDX Technology', targetPrice: '100', reboundRate: '5%', savedAt: 1 };

function mockViewer(signedIn: boolean) {
  return vi.fn().mockResolvedValue({ ok: true, json: async () => ({ signedIn, consentCurrent: true, adminRoles: [] }) });
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([scenario]));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('first trade onboarding uses actual session and real trading flow', () => {
  it('never trusts a forged browser auth token when the viewer is signed out', async () => {
    localStorage.setItem('token', 'not-a-server-session');
    const fetchMock = mockViewer(false);
    vi.stubGlobal('fetch', fetchMock);
    render(<FirstTradeOnboardingModal />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/viewer', expect.objectContaining({ cache: 'no-store' })));
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fails closed when session verification is unavailable', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    render(<FirstTradeOnboardingModal />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('offers a real exchange link without inventing a purchase or WLD grant', async () => {
    const fetchMock = mockViewer(true);
    vi.stubGlobal('fetch', fetchMock);
    render(<FirstTradeOnboardingModal />);
    const dialog = await screen.findByRole('dialog', { name: /첫 거래 안내/ }, { timeout: 1800 });
    expect(dialog.className).toContain('max-w-md');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('link', { name: /거래소에서 직접 확인/ }).getAttribute('href')).toBe('/stocks');
    expect(screen.queryByText(/10,000 WLD/)).toBeNull();
    expect(screen.queryByText(/매수 완료/)).toBeNull();
    expect(localStorage.getItem('wdmv_virtual_holdings')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const link = screen.getByRole('link', { name: /거래소에서 직접 확인/ });
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);
    expect(localStorage.getItem('wdmv_virtual_holdings')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('offers a localized and keyboard-dismissable exchange guide', async () => {
    vi.stubGlobal('fetch', mockViewer(true));
    render(<LocaleProvider initialLocale="en"><FirstTradeOnboardingModal /></LocaleProvider>);
    const dialog = await screen.findByRole('dialog', { name: 'First trade guide' }, { timeout: 1800 });
    expect(dialog.getAttribute('aria-describedby')).toBe('first-trade-description');
    expect(screen.getByRole('link', { name: /Review on the exchange/ }).getAttribute('href')).toBe('/en/stocks');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close dialog' }));
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Maybe later' }));
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close dialog' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not crash or open a trade prompt when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage disabled'); });
    vi.stubGlobal('fetch', mockViewer(true));
    expect(() => render(<FirstTradeOnboardingModal />)).not.toThrow();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not invent a default Samsung stock without a saved scenario', async () => {
    localStorage.removeItem('wdmv_saved_scenarios');
    const fetchMock = mockViewer(true);
    vi.stubGlobal('fetch', fetchMock);
    render(<FirstTradeOnboardingModal />);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
