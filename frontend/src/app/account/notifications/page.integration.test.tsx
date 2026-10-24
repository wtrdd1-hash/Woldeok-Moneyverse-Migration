import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));

vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('./actions', () => ({ saveGoalNotifications: vi.fn() }));
vi.mock('./notification-tabs-bar', () => ({ NotificationTabsBar: () => null }));

import NotificationSettingsPage from './page';

async function html(params: Record<string, string> = {}) {
  return renderToStaticMarkup(await NotificationSettingsPage({ searchParams: Promise.resolve(params) }));
}

describe('notification preferences SSR integrity and accessibility', () => {
  beforeEach(() => { apiOrNull.mockReset(); requireMember.mockClear(); });

  it('renders a server-confirmed setting, keyboard-reachable buttons and noindex metadata', async () => {
    apiOrNull.mockResolvedValue({ notifications_enabled: true });
    const markup = await html({ requested: 'on' });
    expect(markup).toContain('role="status"');
    expect(markup).toContain('서버에서 확인한 현재 설정');
    expect(markup).toContain('알림 받는 중');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('min-h-12 w-full');
    expect(markup).toContain('sm:grid-cols-2');
    expect(requireMember).toHaveBeenCalled();
  });

  it('never displays saved success from an arbitrary saved=1 query', async () => {
    apiOrNull.mockResolvedValue({ notifications_enabled: false });
    const markup = await html({ saved: '1' });
    expect(markup).not.toContain('서버에서 확인한 현재 설정:');
    expect(markup).toContain('알림 꺼짐');
  });

  it('fails closed for malformed server state and hides mutation buttons', async () => {
    apiOrNull.mockResolvedValue({ notifications_enabled: 'false' });
    const markup = await html({ requested: 'off' });
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('결과가 불확실할 수 있으니');
    expect(markup).not.toContain('name="notificationsEnabled"');
    expect(markup).not.toContain('role="status"');
  });

  it('shows mismatch rather than false success when the read disagrees', async () => {
    apiOrNull.mockResolvedValue({ notifications_enabled: false });
    const markup = await html({ requested: 'on' });
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('요청한 설정과 서버에서 확인한 현재 상태가 다릅니다');
    expect(markup).not.toContain('role="status"');
  });
});
