import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  member: vi.fn(), engagement: vi.fn(), cookie: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ requireMember: mocks.member }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.engagement }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock('./notification-tabs-bar', () => ({ NotificationTabsBar: () => <div>Inbox</div> }));
vi.mock('./notification-search-panel', () => ({ NotificationSearchPanel: () => <div>Search</div> }));
vi.mock('./actions', () => ({ saveGoalNotifications: vi.fn() }));

import NotificationSettingsPage from './page';

const nonce = 'abcdef0123456789abcdef0123456789';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.engagement.mockResolvedValue({ notifications_enabled: true });
});

describe('member notification preference confirmation SSR', () => {
  it('does not accept forged saved=1 from a direct URL', async () => {
    mocks.cookie.mockReturnValue(undefined);
    render(await NotificationSettingsPage({ searchParams: Promise.resolve({ saved: '1' }) }));
    expect(screen.queryByText(/알림 설정을 저장했습니다/)).toBeNull();
    expect(screen.getByText('알림 받는 중')).toBeDefined();
    expect(screen.getByRole('button', { name: '알림 받기' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('announces save only for server-issued proof matching fresh preference', async () => {
    mocks.cookie.mockReturnValue({ value: `${nonce}:1` });
    render(await NotificationSettingsPage({ searchParams: Promise.resolve({ saved: nonce }) }));
    expect(screen.getByText(/알림 설정을 저장했습니다/)).toBeDefined();
  });
  it('does not announce save after preference changes or readback fails', async () => {
    mocks.cookie.mockReturnValue({ value: `${nonce}:1` });
    mocks.engagement.mockResolvedValue({ notifications_enabled: false });
    render(await NotificationSettingsPage({ searchParams: Promise.resolve({ saved: nonce }) }));
    expect(screen.queryByText(/알림 설정을 저장했습니다/)).toBeNull();
  });
});
