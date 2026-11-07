import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationTabsBar } from './notification-tabs-bar';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('member inbox pagination and read receipts', () => {
  it('keeps the verified read-all receipt visible after the refreshed feed finishes', async () => {
    const row = { id: '11111111-1111-4111-8111-111111111111', category: 'TRANSACTIONAL', title: 'Verified transfer', body: 'Receipt', is_read: false, created_at: '2026-11-01T00:00:00Z' };
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [row] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ updatedCount: 1, remainingUnreadCount: 2 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /모두 읽음 처리/ }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(await screen.findByText(/알림 내역이 없습니다/)).toBeDefined();
    expect(screen.getByText(/남은 읽지 않은 알림: 2건/)).toBeDefined();
  });
});

describe('owner inbox filter evidence', () => {
  it('rejects a server page that contradicts the selected category instead of displaying it', async () => {
    const row = { id: '11111111-1111-4111-8111-111111111111', category: 'SECURITY', title: 'Wrong category', body: 'Server mismatch', is_read: false, created_at: '2026-11-01T00:00:00Z' };
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [row] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    expect(await screen.findByText(/알림 내역이 없습니다/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: '거래' }));
    expect(await screen.findByText(/알림을 불러오지 못했습니다/)).toBeDefined();
    expect(screen.queryByText('Wrong category')).toBeNull();
  });
  it('preserves verified first-page rows when the next page replays a notification ID', async () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,
      category: 'TRANSACTIONAL', title: `Verified notice ${index}`, body: 'Receipt',
      is_read: false, created_at: '2026-11-01T00:00:00Z',
    }));
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: rows }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: [rows[0]] }) });
    vi.stubGlobal('fetch', fetch);
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /이전 알림 더 보기/ }));
    expect(await screen.findByText(/알림을 불러오지 못했습니다/)).toBeDefined();
    expect(screen.getAllByText('Verified notice 0')).toHaveLength(1);
    expect(screen.queryByText('Verified notice 20')).toBeNull();
  });

});
