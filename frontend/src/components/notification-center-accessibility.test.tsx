// @vitest-environment jsdom
import type React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NotificationCenterModal } from './notification-center-modal';

vi.mock('@/components/ui/dialog', async () => {
  const React = await import('react');
  const OpenContext = React.createContext<(value: boolean) => void>(() => {});
  const VisibilityContext = React.createContext(false);
  return {
    Dialog: ({ children, open, onOpenChange }: {
      children: React.ReactNode; open: boolean; onOpenChange: (value: boolean) => void;
    }) => (
      <OpenContext.Provider value={onOpenChange}>
        <VisibilityContext.Provider value={open}>{children}</VisibilityContext.Provider>
      </OpenContext.Provider>
    ),
    DialogTrigger: ({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) => {
      const setOpen = React.useContext(OpenContext);
      return React.cloneElement(children, { onClick: () => setOpen(true) });
    },
    DialogContent: ({ children }: { children: React.ReactNode }) =>
      React.useContext(VisibilityContext) ? <section>{children}</section> : null,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  };
});

beforeEach(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
    String(input).endsWith('/unread-count')
      ? Response.json({ unreadCount: 1 })
      : Response.json({ notifications: [{
        id: 'notice-1', category: 'SECURITY_CRITICAL', title: 'Security notice',
        body: 'Please review', is_read: false, created_at: '2026-10-09T01:00:00Z',
      }] })
  ));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('exposes the selected notification filter and busy state to assistive technology', async () => {
  render(<NotificationCenterModal />);
  fireEvent.click(screen.getByRole('button', { name: /알림 센터 열기/ }));
  await screen.findByText('Security notice');

  const all = screen.getByRole('button', { name: '전체 알림' });
  const unread = screen.getByRole('button', { name: /^미확인 알림/ });
  expect(all.getAttribute('aria-pressed')).toBe('true');
  expect(unread.getAttribute('aria-pressed')).toBe('false');

  fireEvent.click(unread);
  expect(all.getAttribute('aria-pressed')).toBe('false');
  expect(unread.getAttribute('aria-pressed')).toBe('true');
  await waitFor(() => {
    const list = screen.getByText('Security notice').closest('[aria-busy]');
    expect(list?.getAttribute('aria-busy')).toBe('false');
  });
});

it('announces a failed bulk mark-read request without showing a false success', async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'POST') return Response.json({ error: 'unavailable' }, { status: 503 });
    return String(input).endsWith('/unread-count')
      ? Response.json({ unreadCount: 1 })
      : Response.json({ notifications: [{
        id: 'notice-1', category: 'SECURITY_CRITICAL', title: 'Security notice',
        body: 'Please review', is_read: false, created_at: '2026-10-09T01:00:00Z',
      }] });
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<NotificationCenterModal />);
  fireEvent.click(screen.getByRole('button', { name: /알림 센터 열기/ }));
  await screen.findByText('Security notice');
  const button = screen.getByRole('button', { name: '모두 읽음' });
  await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false));
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('표시하지 못했습니다'));
  expect(fetchMock).toHaveBeenCalledWith('/api/notifications', expect.objectContaining({ method: 'POST' }));
});

it('blocks bulk actions when the server cannot confirm unread count', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
    String(input).endsWith('/unread-count')
      ? Response.json({ error: 'unavailable' }, { status: 503 })
      : Response.json({ notifications: [{
        id: 'notice-1', category: 'SECURITY_CRITICAL', title: 'Security notice',
        body: 'Please review', is_read: false, created_at: '2026-10-09T01:00:00Z',
      }] })
  ));
  render(<NotificationCenterModal />);
  fireEvent.click(screen.getByRole('button', { name: /알림 센터 열기/ }));
  await screen.findByText('Security notice');
  await waitFor(() => expect(screen.getByRole('button', { name: /알림 센터 열기.*확인 불가/ })).toBeTruthy());
  expect(screen.getByRole('button', { name: '모두 읽음' }).hasAttribute('disabled')).toBe(true);
  expect(screen.getByRole('button', { name: '원클릭 모두 수령' }).hasAttribute('disabled')).toBe(true);
});

it('explains a failed unread-count request and recovers via manual retry', async () => {
  let countAttempts = 0;
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).endsWith('/unread-count')) {
      countAttempts += 1;
      return countAttempts === 1
        ? Response.json({ error: 'unavailable' }, { status: 503 })
        : Response.json({ unreadCount: 3 });
    }
    return Response.json({ notifications: [{
      id: 'notice-1', category: 'SECURITY_CRITICAL', title: 'Security notice',
      body: 'Please review', is_read: false, created_at: '2026-10-09T01:00:00Z',
    }] });
  }));
  render(<NotificationCenterModal />);
  fireEvent.click(screen.getByRole('button', { name: /알림 센터 열기/ }));
  await screen.findByText('Security notice');
  expect((await screen.findByRole('status')).textContent).toContain('알림 개수를 확인할 수 없습니다');
  expect(screen.getByRole('button', { name: '모두 읽음' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: '알림 개수 다시 확인' }));
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  expect(screen.getByRole('button', { name: /미확인 알림 3건/ })).toBeTruthy();
  expect(countAttempts).toBe(2);
});

it('preserves the last server-confirmed unread count when a mark-read refresh fails', async () => {
  let countRequests = 0;
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'POST') return Response.json({ success: true });
    if (String(input).endsWith('/unread-count')) {
      countRequests += 1;
      return countRequests === 1
        ? Response.json({ unreadCount: 3 })
        : Response.json({ error: 'unavailable' }, { status: 503 });
    }
    return Response.json({ notifications: [{
      id: 'notice-1', category: 'SECURITY_CRITICAL', title: 'Security notice',
      body: 'Please review', is_read: false, created_at: '2026-10-09T01:00:00Z',
    }] });
  }));
  render(<NotificationCenterModal />);
  await waitFor(() => expect(screen.getByRole('button', { name: /미확인 알림 3건/ })).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: /알림 센터 열기/ }));
  await screen.findByText('Security notice');
  fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
  await waitFor(() => expect(countRequests).toBe(2));
  await screen.findByRole('status');
  expect(screen.getByRole('button', { name: /마지막 확인 미확인 알림 3건/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: '모두 읽음' }).hasAttribute('disabled')).toBe(true);
});
