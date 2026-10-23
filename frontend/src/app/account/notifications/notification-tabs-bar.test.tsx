import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationTabsBar } from './notification-tabs-bar';

const first = {
  id: '123e4567-e89b-42d3-a456-426614174001',
  category: 'TRANSACTIONAL',
  title: 'Verified transfer receipt',
  body: 'Actual transfer confirmed by the server',
  is_read: false,
  created_at: '2026-10-23T15:00:00Z',
};
const second = {
  id: '123e4567-e89b-42d3-a456-426614174002',
  category: 'SECURITY_CRITICAL',
  title: 'Verified security event',
  body: 'A security event was recorded',
  is_read: false,
  created_at: '2026-10-23T14:00:00Z',
};
const response = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('member notification inbox backed by real receipts', () => {
  it('shows only the authenticated server feed, filters actual categories, and reads one with a receipt', async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === 'POST' ? response({ read: true }) : response({ notifications: [first, second] }),
    );
    vi.stubGlobal('fetch', fetcher);
    render(<NotificationTabsBar />);

    expect(screen.queryByText('원자재 조달 및 수급 완료')).toBeNull();
    expect(await screen.findByText('Verified transfer receipt')).toBeTruthy();
    expect(screen.getByText('Verified security event')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /보안·인증/ }));
    expect(screen.queryByText('Verified transfer receipt')).toBeNull();
    expect(screen.getByText('Verified security event')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Verified security event/ }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('/api/notifications', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-Moneyverse-Notification-Action': '1' }),
      body: JSON.stringify({ notificationId: second.id }),
    })));
    await waitFor(() => expect(screen.getByText(/미확인 1건/)).toBeTruthy());
  });

  it('fails closed on transport or malformed data, never claiming an empty inbox', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ notifications: [{ ...first, id: 'bad' }] }))
      .mockResolvedValueOnce(response({ notifications: [] }));
    vi.stubGlobal('fetch', fetcher);
    render(<NotificationTabsBar />);
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('불러오지 못했습니다'));
    expect(screen.queryByText('알림 내역이 없습니다.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('알림 내역이 없습니다.')).toBeTruthy();
  });

  it('does not mark read on failed or unverified read-all mutation', async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === 'POST' ? response({ updatedCount: '2' }) : response({ notifications: [first, second] }),
    );
    vi.stubGlobal('fetch', fetcher);
    render(<NotificationTabsBar />);
    await screen.findByText('Verified transfer receipt');
    fireEvent.click(screen.getByRole('button', { name: /모두 읽음/ }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('읽음 처리에 실패'));
    expect(screen.getByText(/미확인 2건/)).toBeTruthy();
  });

  it('marks all read only after an integer server receipt and keeps touch targets', async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === 'POST' ? response({ updatedCount: 2 }) : response({ notifications: [first, second] }),
    );
    vi.stubGlobal('fetch', fetcher);
    render(<NotificationTabsBar />);
    await screen.findByText('Verified transfer receipt');
    const button = screen.getByRole('button', { name: /모두 읽음/ });
    expect(button.className).toContain('min-h-11');
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(/미확인 0건/)).toBeTruthy());
    expect(button).toHaveProperty('disabled', true);
  });
});
