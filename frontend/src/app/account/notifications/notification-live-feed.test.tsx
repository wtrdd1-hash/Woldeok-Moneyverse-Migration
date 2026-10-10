// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NotificationLiveFeed, safeNotificationLink } from './notification-live-feed';

const { markReadMock } = vi.hoisted(() => ({ markReadMock: vi.fn() }));
vi.mock('./actions', () => ({ markAccountNotificationRead: markReadMock }));

const notification = {
  id: 'fb605cd2-86b4-43d8-889a-5d92b44a7412',
  category: 'SECURITY_CRITICAL',
  title: 'Security notice',
  body: 'A sign-in was detected.',
  link: '/account/security',
  is_read: false,
  created_at: '2026-10-10T01:00:00Z',
};

beforeEach(() => {
  markReadMock.mockReset();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ notifications: [notification] }),
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('notification link and live feed UX', () => {
  it('rejects external, protocol-relative, control-character and backslash links', () => {
    expect(safeNotificationLink('https://attacker.example')).toBeNull();
    expect(safeNotificationLink('//attacker.example')).toBeNull();
    expect(safeNotificationLink('/\\attacker.example')).toBeNull();
    expect(safeNotificationLink('/account\u0000security')).toBeNull();
    expect(safeNotificationLink('/account/security?tab=1')).toBe('/account/security?tab=1');
  });

  it('shows authenticated server data, status freshness, and accessible category controls', async () => {
    render(<NotificationLiveFeed />);
    expect(await screen.findByText('Security notice')).toBeTruthy();
    expect(screen.getByRole('group', { name: '알림 분류' })).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('button', { name: '보안' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: '보안' }));
    expect(screen.getByRole('button', { name: '보안' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('shows a failure instead of an empty inbox when the server is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<NotificationLiveFeed />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText('표시할 알림이 없습니다.')).toBeNull();
    expect(markReadMock).not.toHaveBeenCalled();
  });

  it('only acknowledges read after the server action succeeds', async () => {
    markReadMock.mockResolvedValue({ ok: false });
    render(<NotificationLiveFeed />);
    expect(await screen.findByText('Security notice')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '읽음 처리' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('button', { name: '읽음 처리' })).toBeTruthy();
  });
});
