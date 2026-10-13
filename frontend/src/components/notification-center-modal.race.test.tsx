import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationCenterModal } from './notification-center-modal';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange: (open: boolean) => void }) => (
    <div><button type="button" onClick={() => onOpenChange(true)}>Open test dialog</button>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const notification = (id: string, title: string) => ({
  id, title, body: 'Notification body', category: 'SYSTEM', is_read: false,
  created_at: '2026-10-13T07:00:00.000Z',
});
const response = (payload: unknown) => ({ ok: true, json: async () => payload }) as Response;

afterEach(() => vi.restoreAllMocks());

describe('notification response ordering', () => {
  it('does not let an older all-feed response overwrite the selected unread feed', async () => {
    let resolveAll: ((response: Response) => void) | undefined;
    let resolveUnread: ((response: Response) => void) | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('unread-count')) return Promise.resolve(response({ unreadCount: 2 }));
      if (url.includes('unreadOnly=false')) return new Promise((resolve) => { resolveAll = resolve; });
      if (url.includes('unreadOnly=true')) return new Promise((resolve) => { resolveUnread = resolve; });
      throw new Error(`Unexpected URL: ${url}`);
    });

    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await waitFor(() => expect(resolveAll).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /^미확인 알림/ }));
    await waitFor(() => expect(resolveUnread).toBeDefined());
    await act(async () => resolveUnread!(response({ notifications: [notification('11111111-1111-4111-8111-111111111111', 'Newest notification')] })));
    expect(screen.getByText('Newest notification')).toBeDefined();
    await act(async () => resolveAll!(response({ notifications: [notification('22222222-2222-4222-8222-222222222222', 'Stale notification')] })));
    expect(screen.getByText('Newest notification')).toBeDefined();
    expect(screen.queryByText('Stale notification')).toBeNull();
    expect(screen.getByRole('button', { name: /^미확인 알림/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /^미확인 알림/ }).className).toContain('min-h-11');
  });

  it('does not restore an old unread count after a successful mark-all-read mutation', async () => {
    let refreshCount: (() => void) | undefined;
    let resolveOldCount: ((response: Response) => void) | undefined;
    let countCalls = 0;
    vi.spyOn(globalThis, 'setInterval').mockImplementation((callback) => {
      refreshCount = callback as () => void;
      return 1 as unknown as ReturnType<typeof setInterval>;
    });
    vi.spyOn(globalThis, 'clearInterval').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('unread-count')) {
        countCalls += 1;
        if (countCalls === 1) return Promise.resolve(response({ unreadCount: 1 }));
        return new Promise((resolve) => { resolveOldCount = resolve; });
      }
      if (url.includes('unreadOnly=')) return Promise.resolve(response({ notifications: [notification('33333333-3333-4333-8333-333333333333', 'Live notification')] }));
      if (url.endsWith('/api/notifications') && init?.method === 'POST') return Promise.resolve(response({ success: true }));
      throw new Error(`Unexpected URL: ${url}`);
    });

    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await screen.findByText('Live notification');
    await waitFor(() => expect(refreshCount).toBeDefined());
    act(() => refreshCount!());
    await waitFor(() => expect(resolveOldCount).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    await waitFor(() => expect(screen.getByText(/미확인 0건/)).toBeDefined());
    await act(async () => resolveOldCount!(response({ unreadCount: 1 })));
    expect(screen.getByText(/미확인 0건/)).toBeDefined();
  });
});
