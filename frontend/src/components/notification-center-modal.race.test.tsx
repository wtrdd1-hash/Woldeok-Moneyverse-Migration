import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

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
    let resolveOldCount: ((value: Response) => void) | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('unread-count')) return new Promise((resolve) => { resolveOldCount = resolve; });
      if (url.includes('unreadOnly=')) return Promise.resolve(response({ notifications: [notification('33333333-3333-4333-8333-333333333333', 'Live notification')] }));
      if (url.endsWith('/api/notifications') && init?.method === 'POST') return Promise.resolve(response({ updatedCount: 1 }));
      throw new Error(`Unexpected URL: ${url}`);
    });
    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await screen.findByText('Live notification');
    await waitFor(() => expect(resolveOldCount).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    await waitFor(() => expect(screen.getByLabelText('알림 센터 열기 (미확인 0건)')).toBeDefined());
    await act(async () => resolveOldCount!(response({ unreadCount: 1 })));
    expect(screen.getByLabelText('알림 센터 열기 (미확인 0건)')).toBeDefined();
  });

  it('does not cancel a pending feed request when the selected filter is clicked again', async () => {
    let resolveAll: ((response: Response) => void) | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('unread-count')) return Promise.resolve(response({ unreadCount: 1 }));
      if (url.includes('unreadOnly=false')) return new Promise((resolve) => { resolveAll = resolve; });
      throw new Error(`Unexpected URL: ${url}`);
    });

    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await waitFor(() => expect(resolveAll).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: '전체 알림' }));
    await act(async () => resolveAll!(response({ notifications: [notification('44444444-4444-4444-8444-444444444444', 'Pending notification')] })));
    expect(screen.getByText('Pending notification')).toBeDefined();
    expect(screen.queryByText('알림을 불러오는 중...')).toBeNull();
  });

  it('does not report a successful read when the API returns a malformed receipt', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('unread-count')) return Promise.resolve(response({ unreadCount: 1 }));
      if (url.includes('unreadOnly=')) return Promise.resolve(response({ notifications: [notification('55555555-5555-4555-8555-555555555555', 'Unread receipt')] }));
      if (url.endsWith('/api/notifications') && init?.method === 'POST') {
        return Promise.resolve(response({ success: true }));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await screen.findByText('Unread receipt');
    await waitFor(() => expect(screen.getByText(/미확인 1건/)).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('읽음 처리에 실패'));
    expect(screen.getByText(/미확인 1건/)).toBeDefined();
    expect(screen.getByRole('button', { name: '모두 읽음' }).hasAttribute('disabled')).toBe(false);
  });

  it('ignores a pre-mutation unread-feed response after mark-all succeeds', async () => {
    let finishMutation: ((value: Response) => void) | undefined;
    let finishOldFeed: ((value: Response) => void) | undefined;
    let count = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('unread-count')) {
        count += 1;
        return Promise.resolve(response({ unreadCount: count === 1 ? 1 : 0 }));
      }
      if (url.includes('unreadOnly=false')) return Promise.resolve(response({ notifications: [notification('66666666-6666-4666-8666-666666666666', 'Before mutation')] }));
      if (url.includes('unreadOnly=true')) return new Promise((resolve) => { finishOldFeed = resolve; });
      if (url.endsWith('/api/notifications') && init?.method === 'POST') {
        return new Promise((resolve) => { finishMutation = resolve; });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    render(<NotificationCenterModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Open test dialog' }));
    await screen.findByText('Before mutation');
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    await waitFor(() => expect(finishMutation).toBeDefined());
    expect(screen.getByRole('button', { name: '모두 읽음' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /^미확인 알림/ }));
    await waitFor(() => expect(finishOldFeed).toBeDefined());
    await act(async () => finishMutation!(response({ updatedCount: 1 })));
    await waitFor(() => expect(screen.getByLabelText('알림 센터 열기 (미확인 0건)')).toBeDefined());
    await act(async () => finishOldFeed!(response({ notifications: [notification('77777777-7777-4777-8777-777777777777', 'Stale unread')] })));
    expect(screen.queryByText('Stale unread')).toBeNull();
    expect(screen.queryByText('알림을 불러오는 중...')).toBeNull();
    expect(screen.getByRole('button', { name: '모두 읽음' }).className).toContain('min-h-11');
  });
});
