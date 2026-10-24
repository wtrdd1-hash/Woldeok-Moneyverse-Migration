import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TreasuryBroadcastToast } from './treasury-broadcast-toast';

const localeState = vi.hoisted(() => ({ value: 'ko' }));
vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: localeState.value }),
}));

const receipt = {
  id: '11111111-1111-4111-8111-111111111111',
  category: 'TRANSACTIONAL',
  title: '국고 배당 관련 회원 알림',
  body: '서버에서 생성된 알림입니다.',
  is_read: false,
  created_at: new Date().toISOString(),
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localeState.value = 'ko';
});

describe('TreasuryBroadcastToast — verified server notices only', () => {
  it('never fetches or invents a dividend for a signed-out visitor', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<TreasuryBroadcastToast signedIn={false} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/1,704,000 WLD/)).toBeNull();
  });

  it('shows a recent unread treasury notice from the authenticated backend feed and can dismiss it', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [{ ...receipt, created_at: new Date().toISOString() }] }),
    } as Response);
    render(<TreasuryBroadcastToast signedIn />);
    expect(await screen.findByText('국고 배당 관련 회원 알림')).toBeTruthy();
    expect(screen.getByRole('link', { name: '알림함 확인' }).getAttribute('href')).toBe('/account/notifications');
    expect(fetchSpy).toHaveBeenCalledWith('/api/notifications?limit=20&unreadOnly=true', { cache: 'no-store' });
    expect(screen.queryByText(/1,704,000 WLD/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    expect(screen.queryByText('국고 배당 관련 회원 알림')).toBeNull();
  });

  it('fails closed on server error, malformed feed, unrelated and stale notices', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notifications: [{ ...receipt, id: 'invalid' }] }),
    } as Response).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notifications: [
        { ...receipt, title: '송금 안내', id: '22222222-2222-4222-8222-222222222222' },
        { ...receipt, created_at: new Date(Date.now() - 86400000).toISOString() },
      ] }),
    } as Response);
    const { rerender } = render(<TreasuryBroadcastToast signedIn />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    rerender(<TreasuryBroadcastToast signedIn={false} />);
    rerender(<TreasuryBroadcastToast signedIn />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    rerender(<TreasuryBroadcastToast signedIn={false} />);
    rerender(<TreasuryBroadcastToast signedIn />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(3));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('supports Vietnamese member notice labels after the main 5-locale expansion', async () => {
    localeState.value = 'vi';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [{ ...receipt, created_at: new Date().toISOString() }] }),
    } as Response);
    render(<TreasuryBroadcastToast signedIn />);
    expect(await screen.findByRole('link', { name: 'Mở thông báo' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Đóng thông báo' })).toBeTruthy();
  });

  it('does not reveal a late response after sign-out', async () => {
    let resolveResponse!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise((resolve) => { resolveResponse = resolve; }));
    const { rerender } = render(<TreasuryBroadcastToast signedIn />);
    rerender(<TreasuryBroadcastToast signedIn={false} />);
    await act(async () => {
      resolveResponse({ ok: true, json: async () => ({ notifications: [receipt] }) } as Response);
    });
    expect(screen.queryByText(receipt.title)).toBeNull();
  });
});
