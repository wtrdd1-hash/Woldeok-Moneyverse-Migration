import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StockAlertPushEngine } from './stock-alert-push-engine';

const event = {
  eventId: 'e1159a2d-5d54-4dc9-96a7-b96d963b5079',
  symbol: 'WLDX',
  name: 'Woldeok X',
  conditionKind: 'price_at_or_above',
  triggerPrice: '1250',
  triggeredAt: '2026-10-25T00:10:00.000Z',
};
const response = (events: unknown[] = []) => ({
  ok: true, status: 200, json: async () => ({ activeAlertCount: 1, events }),
});

describe('global verified browser stock alerts', () => {
  const notify = vi.fn();
  class BrowserNotification {
    static permission: NotificationPermission = 'default';
    static requestPermission = vi.fn(async () => {
      BrowserNotification.permission = 'granted';
      return 'granted' as NotificationPermission;
    });
    constructor(title: string, options: NotificationOptions) { notify(title, options); }
  }

  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    BrowserNotification.permission = 'default';
    vi.stubGlobal('Notification', BrowserNotification);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('offers a keyboard-accessible consent prompt only after a verified active server rule', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));
    render(<StockAlertPushEngine />);
    expect(await screen.findByRole('complementary', { name: '가상 주식 브라우저 알림 안내' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '서버 알림 내역' }).getAttribute('href')).toBe('/stocks/alerts');
    expect(screen.getByRole('button', { name: '주식 알림 안내 닫기' }).className).toContain('size-11');
    fireEvent.click(screen.getByRole('button', { name: '브라우저 알림 허용' }));
    await waitFor(() => expect(BrowserNotification.requestPermission).toHaveBeenCalledOnce());
    expect(notify).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_push_active')).toBeNull();
  });

  it('never broadcasts historical receipts and only notifies after a new server event', async () => {
    BrowserNotification.permission = 'granted';
    const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-25T00:09:00Z'));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([event]));
    vi.stubGlobal('fetch', fetchMock);
    render(<StockAlertPushEngine />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(notify).not.toHaveBeenCalled();
    clock.mockReturnValue(Date.parse('2026-10-25T00:11:00Z'));
    await act(async () => { fireEvent(document, new Event('visibilitychange')); });
    await waitFor(() => expect(notify).toHaveBeenCalledOnce());
    expect(notify.mock.calls[0]?.[0]).toContain('WLDX');
  });

  it('does not display consent or fabricated notifications for guests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    render(<StockAlertPushEngine />);
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByRole('button', { name: '브라우저 알림 허용' })).toBeNull();
    expect(notify).not.toHaveBeenCalled();
  });
});
