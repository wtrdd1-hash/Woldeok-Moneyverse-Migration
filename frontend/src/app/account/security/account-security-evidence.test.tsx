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

describe('complete recent security activity view', () => {
  it('renders all 20 verified events and an accessible private CSV download, not just five', async () => {
    const events = Array.from({ length: 20 }, (_, index) => ({
      type: 'local_login_succeeded',
      createdAt: `2026-10-30T00:${String(index).padStart(2, '0')}:00.000Z`,
    }));
    const page = await html({ sessions: [validSession] }, { identities: [localIdentity] }, { events });
    expect(page.match(/이메일 계정 로그인/g)).toHaveLength(20);
    expect(page).toContain('/account/security/events.csv');
    expect(page).toContain('최근 최대 20건');
  });
  it('does not offer a misleading CSV download when security evidence is invalid', async () => {
    const page = await html({ sessions: [validSession] }, { identities: [localIdentity] }, { events: [{ type: '=malicious', createdAt: '2026-10-30T00:00:00.000Z' }] });
    expect(page).not.toContain('/account/security/events.csv');
  });
});


describe('security action feedback must be bound to authenticated evidence', () => {
  async function flagged(params: Record<string, string>, events: unknown = { events: [] }, session = validSession) {
    read.mockImplementation(async (path: string) => {
      if (path === '/api/v1/account/security/sessions') return { sessions: [session] };
      if (path === '/api/v1/account/identities') return { identities: [localIdentity] };
      if (path.startsWith('/api/v1/account/security/events')) return events;
      return null;
    });
    return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));
  }

  it('does not report password change success from a forged query string', async () => {
    const page = await flagged({ password: 'changed' });
    expect(page).not.toContain('비밀번호를 성공적으로 변경');
    expect(page).toContain('비밀번호 변경 기록을 확인할 수 없습니다');
  });

  it('reports a recent password event as an event, not as proof of remote logout', async () => {
    const page = await flagged({ password: 'changed' }, { events: [
      { type: 'local_password_changed', createdAt: new Date().toISOString() },
    ] });
    expect(page).toContain('최근 비밀번호 변경 기록이 확인되었습니다');
    expect(page).not.toContain('다른 로그인 세션을 모두 안전하게 종료했습니다');
  });

  it('does not promise email-change acceptance without a server event', async () => {
    const page = await flagged({ email: 'verification-sent' });
    expect(page).not.toContain('이메일 변경 확인 메일 발송 요청이 접수되었습니다');
    expect(page).toContain('이메일 변경 요청 기록을 확인할 수 없습니다');
  });

  it('shows verified recent email request but never promises mail delivery', async () => {
    const page = await flagged({ email: 'verification-sent' }, { events: [
      { type: 'local_email_change_requested', createdAt: new Date().toISOString() },
    ] });
    expect(page).toContain('이메일 변경 확인 메일 발송 요청이 접수되었습니다');
    expect(page).toContain('메일 발송·도착은 별도 확인이 필요합니다');
  });

  it('rejects forged reauthentication and recognizes current session evidence only', async () => {
    const spoof = await flagged({ reauth: 'done' });
    expect(spoof).not.toContain('본인 확인이 완료되었습니다');
    const verified = await flagged({ reauth: 'done' }, { events: [] },
      { ...validSession, reauthenticatedAt: new Date().toISOString() });
    expect(verified).toContain('현재 세션의 최근 본인 확인 기록이 확인되었습니다');
  });

  it('never echoes attacker-controlled revoked counts or claims a specific session was revoked', async () => {
    const bulk = await flagged({ revoked: '999999' });
    expect(bulk).not.toContain('999999개');
    expect(bulk).toContain('현재 다른 활성 세션이 없습니다');
    const single = await flagged({ session: 'revoked' });
    expect(single).not.toContain('선택한 기기의 세션을 원격으로 종료했습니다');
    expect(single).toContain('종료 여부는 기기 목록에서 확인');
  });

  it('checks the unfiltered authenticated event endpoint even when UI activity is filtered', async () => {
    await flagged({ password: 'changed', category: 'login' }, { events: [
      { type: 'local_password_changed', createdAt: new Date().toISOString() },
    ] });
    expect(read).toHaveBeenCalledWith('/api/v1/account/security/events');
  });
});
