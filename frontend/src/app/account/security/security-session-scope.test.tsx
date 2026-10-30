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
import { parseSecuritySessions } from './account-security-evidence';

const at = '2026-10-30T01:00:00.000Z';
const session = (id: string, current: boolean) => ({
  sessionId: id, createdAt: at, expiresAt: '2026-11-30T01:00:00.000Z',
  reauthenticatedAt: null, current, administratorSession: false,
  lastSeenAt: at, deviceLabel: current ? 'Current Mac' : 'Other Android',
});
const current = session('00000000-0000-4000-8000-000000000012', true);
const other = session('00000000-0000-4000-8000-000000000013', false);
beforeEach(() => {
  vi.clearAllMocks();
  read.mockImplementation(async (path: string) => path.includes('/sessions')
    ? { sessions: [current, other] } : path.includes('/identities') ? { identities: [] } : { events: [] });
});
async function render(scope?: string | string[]) {
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(scope === undefined ? {} : { scope }) }));
}
describe('member session scope', () => {
  it('allows an other-only owner list without requiring a current session in the filtered response', () => {
    expect(parseSecuritySessions({ sessions: [other] }, 'other')).toEqual([other]);
    expect(parseSecuritySessions({ sessions: [current, other] }, 'other')).toBeNull();
    expect(parseSecuritySessions({ sessions: [other] })).toBeNull();
  });
  it('renders an accessible other-device link and only the filtered owner devices', async () => {
    read.mockImplementation(async (path: string) => path.includes('/sessions')
      ? { sessions: [other] } : path.includes('/identities') ? { identities: [] } : { events: [] });
    const html = await render('other');
    expect(read).toHaveBeenCalledWith('/api/v1/account/security/sessions?scope=other');
    expect(html).toContain('href="/account/security?scope=other"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Other Android');
    expect(html).not.toContain('Current Mac');
  });
  it('fails closed when an older backend ignores the scope and returns the current session', async () => {
    const html = await render('other');
    expect(html).toContain('세션 정보를 확인할 수 없습니다');
    expect(html).not.toContain('Other Android');
  });
  it('shows an explicit empty-other-devices state without claiming all sessions are empty', async () => {
    read.mockImplementation(async (path: string) => path.includes('/sessions')
      ? { sessions: [] } : path.includes('/identities') ? { identities: [] } : { events: [] });
    const html = await render('other');
    expect(html).toContain('다른 활성 세션이 없습니다');
  });
  it('rejects duplicate scope values without silently querying all sessions', async () => {
    const html = await render(['all', 'other']);
    expect(html).toContain('올바르지 않은 기기 필터');
    expect(read).not.toHaveBeenCalledWith('/api/v1/account/security/sessions');
  });
});
