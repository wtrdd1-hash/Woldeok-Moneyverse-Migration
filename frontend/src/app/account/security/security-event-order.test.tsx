import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('./actions', () => ({
  terminateSession: vi.fn(), terminateOtherSessions: vi.fn(), terminateAllSessions: vi.fn(),
  beginSecurityReauthentication: vi.fn(), reauthenticateWithLocalPassword: vi.fn(),
  changeLocalPassword: vi.fn(), requestLocalEmailChange: vi.fn(),
}));
import Page from './page';

beforeEach(() => { vi.clearAllMocks(); read.mockResolvedValue({ events: [] }); });
async function render(params: Record<string, string | string[]> = {}) {
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));
}
describe('member security event chronology', () => {
  it('offers accessible oldest/recent controls and preserves category in links', async () => {
    const html = await render({ category: 'login', sort: 'oldest' });
    expect(html).toContain('sort=recent');
    expect(html).toContain('sort=oldest');
    expect(html).toContain('category=login');
    expect(html).toContain('최근 20건');
    expect(read).toHaveBeenCalledWith('/api/v1/account/security/events?category=login&sort=oldest');
  });
  it('does not query events for invalid or duplicate sort', async () => {
    const html = await render({ sort: ['recent', 'oldest'] });
    expect(html).toContain('올바르지 않은 보안 활동 정렬');
    expect(read.mock.calls.filter(([path]) => String(path).includes('/events'))).toHaveLength(0);
  });
  it('rejects a successful upstream response with wrong oldest-first chronology', async () => {
    read.mockResolvedValue({ events: [
      { type: 'local_login_succeeded', createdAt: '2026-10-31T10:00:00.000Z' },
      { type: 'local_login_succeeded', createdAt: '2026-10-31T09:00:00.000Z' },
    ] });
    const html = await render({ sort: 'oldest' });
    expect(html).toContain('보안 활동을 확인할 수 없습니다');
    expect(html).not.toContain('2026-10-31T10:00:00.000Z');
  });
});
