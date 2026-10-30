import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('./actions', () => ({
  terminateSession: vi.fn(),
  terminateOtherSessions: vi.fn(),
  terminateAllSessions: vi.fn(),
  beginSecurityReauthentication: vi.fn(),
  reauthenticateWithLocalPassword: vi.fn(),
  changeLocalPassword: vi.fn(),
  requestLocalEmailChange: vi.fn(),
}));
import Page from './page';

beforeEach(() => {
  vi.clearAllMocks();
  read.mockResolvedValue({ events: [] });
});

async function render(category?: string | string[]) {
  return renderToStaticMarkup(
    await Page({ searchParams: Promise.resolve(category === undefined ? {} : { category }) }),
  );
}

describe('member security activity category controls', () => {
  it('shows accessible category links and the latest-20 scope', async () => {
    const html = await render();
    expect(html).toContain('href="/account/security?category=login"');
    expect(html).toContain('href="/account/security?category=settings"');
    expect(html).toContain('최근 20건');
    expect(html).toContain('전체 보안 활동 CSV');
  });
  it('forwards a validated category to the owner-scoped backend read', async () => {
    const html = await render('login');
    expect(read).toHaveBeenCalledWith('/api/v1/account/security/events?category=login');
    expect(html).toContain('aria-current="page"');
  });
  it('rejects an ambiguous category instead of silently displaying all events', async () => {
    const html = await render(['login', 'settings']);
    expect(html).toContain('올바르지 않은 보안 활동 필터');
    expect(read).not.toHaveBeenCalledWith('/api/v1/account/security/events');
  });
  it('fails closed when a legacy backend ignores the selected category', async () => {
    read.mockResolvedValue({
      events: [{ type: 'local_password_changed', createdAt: '2026-10-30T03:00:00.000Z' }],
    });
    const html = await render('login');
    expect(html).toContain('보안 활동을 확인할 수 없습니다');
    expect(html).not.toContain('비밀번호 변경</span>');
  });
});
