import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationTabsBar } from './notification-tabs-bar';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('real member notification inbox', () => {
  it('never displays fabricated WLD events when the verified server feed is empty', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notifications: [] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    expect(await screen.findByText(/알림 내역이 없습니다/)).toBeDefined();
    expect(screen.queryByText(/1,840 WLD/)).toBeNull();
    expect(screen.queryByText(/20 WLD/)).toBeNull();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/notifications?'), expect.objectContaining({ cache: 'no-store' }));
  });
  it('shows retry on server failure and does not falsely acknowledge a read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<NotificationTabsBar />);
    expect(await screen.findByText(/알림을 불러오지 못했습니다/)).toBeDefined();
    expect(screen.getByRole('button', { name: /다시 시도/ })).toBeDefined();
    expect(screen.queryByText(/모두 읽음 \(0\)/)).toBeNull();
  });
  it('uses a server category query rather than filtering only the first page', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notifications: [] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    fireEvent.click(screen.getByRole('button', { name: '거래' }));
    await waitFor(() => expect(fetch.mock.calls.some(([url]) => String(url).includes('category=TRANSACTIONAL'))).toBe(true));
  });
  it('preserves the nonzero server unread receipt instead of claiming everything was read', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [{ id, category: 'TRANSACTIONAL', title: '확인된 거래', body: '기록', is_read: false, created_at: '2026-10-28T05:00:00Z' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ updatedCount: 1, remainingUnreadCount: 2 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /모두 읽음 처리/ }));
    expect(await screen.findByText(/남은 읽지 않은 알림: 2건/)).toBeDefined();
  });
  it('only changes read state after a verified server response', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [{ id, category: 'TRANSACTIONAL', title: '실제 송금', body: '확인됨', is_read: false, created_at: '2026-10-28T05:00:00Z' }] }) })
      .mockResolvedValueOnce({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /실제 송금/ }));
    expect(await screen.findByText(/읽음 처리에 실패/)).toBeDefined();
    expect(screen.getByRole('button', { name: /실제 송금/ }).getAttribute('aria-label')).toContain('읽지 않음');
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});
