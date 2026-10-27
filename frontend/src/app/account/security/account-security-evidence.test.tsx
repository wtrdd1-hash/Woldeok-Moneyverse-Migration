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

import Page, { metadata } from './page';

const sessionId = 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e';
const otherId = 'b9745c4f-20b1-45b8-a8e0-4c7cc19ce01e';
const validSession = {
  sessionId, createdAt: '2026-10-01T01:00:00.000Z', expiresAt: '2027-01-01T00:00:00.000Z',
  reauthenticatedAt: null, current: true, administratorSession: false,
  lastSeenAt: '2026-10-28T01:00:00.000Z', deviceLabel: 'Desktop browser',
};
const otherSession = { ...validSession, sessionId: otherId, current: false, deviceLabel: 'Android phone' };
const localIdentity = { identityId: 'c9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  provider: 'local_email', displayName: 'Local member', linkedAt: '2026-10-01T01:00:00.000Z' };
const validEvents = { events: [{ type: 'local_login_succeeded', createdAt: '2026-10-28T01:00:00.000Z' }] };

beforeEach(() => { vi.clearAllMocks(); });

async function html(sessions: unknown, identities: unknown, events: unknown): Promise<string> {
  read.mockResolvedValueOnce(sessions).mockResolvedValueOnce(identities).mockResolvedValueOnce(events);
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
}

describe('account security API evidence', () => {
  it('fails closed on malformed or ambiguous session lists, without offering revoke controls', async () => {
    const page = await html({ sessions: [{ ...validSession, current: false }, otherSession] },
      { identities: [localIdentity] }, validEvents);
    expect(gate).toHaveBeenCalled();
    expect(page).toContain('세션 정보를 확인할 수 없습니다');
    expect(page).not.toContain('이 세션 종료');
    expect(page).not.toContain('다른 세션 1개 종료');
    expect(page).toContain('모든 기기에서 로그아웃');
  });

  it('rejects duplicate session IDs instead of displaying duplicate revoke targets', async () => {
    const page = await html({ sessions: [validSession, { ...otherSession, sessionId }] },
      { identities: [localIdentity] }, validEvents);
    expect(page).toContain('세션 정보를 확인할 수 없습니다');
    expect(page).not.toContain('이 세션 종료');
  });

  it('does not infer absent identity evidence as an unlinked email account', async () => {
    const page = await html({ sessions: [validSession] }, { identities: [{ provider: 'local_email' }] }, validEvents);
    expect(page).toContain('로그인 수단을 확인할 수 없습니다');
    expect(page).not.toContain('새 비밀번호 확인');
    expect(page).not.toContain('확인 이메일 보내기');
  });

  it('distinguishes invalid security events from a verified empty history', async () => {
    const page = await html({ sessions: [validSession] }, { identities: [localIdentity] },
      { events: [{ type: 'local_login_succeeded', createdAt: 'yesterday' }] });
    expect(page).toContain('보안 활동을 확인할 수 없습니다');
    expect(page).not.toContain('최근 보안 활동이 없습니다');
  });

  it('renders valid owner-scoped sessions, identities and activity with noindex', async () => {
    const page = await html({ sessions: [validSession, otherSession] },
      { identities: [localIdentity] }, validEvents);
    expect(page).toContain('Android phone');
    expect(page).toContain('이 세션 종료');
    expect(page).toContain('다른 세션 1개 종료');
    expect(page).toContain('새 비밀번호 확인');
    expect(page).toContain('이메일 계정 로그인');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
