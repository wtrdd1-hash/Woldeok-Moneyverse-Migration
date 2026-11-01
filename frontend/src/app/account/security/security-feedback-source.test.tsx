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

const current = {
  sessionId: 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  createdAt: '2026-10-01T01:00:00.000Z', expiresAt: '2027-01-01T00:00:00.000Z',
  reauthenticatedAt: null, current: true, administratorSession: false,
  lastSeenAt: '2026-10-28T01:00:00.000Z', deviceLabel: 'Desktop browser',
};
const other = { ...current, sessionId: 'b9745c4f-20b1-45b8-a8e0-4c7cc19ce01e', current: false };

beforeEach(() => vi.clearAllMocks());

async function page(params: Record<string, string>, sessions: unknown = { sessions: [current, other] }) {
  read.mockResolvedValueOnce(sessions).mockResolvedValueOnce({ identities: [] })
    .mockResolvedValueOnce({ events: [] });
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));
}

describe('account security notices require server evidence', () => {
  it('does not claim forged revoke counts or a successful revocation while another session remains active', async () => {
    const html = await page({ revoked: '999999', session: 'revoked' });
    expect(html).not.toContain('다른 활성 세션 999999개를 모두 안전하게 종료했습니다');
    expect(html).not.toContain('선택한 기기의 세션을 원격으로 종료했습니다');
    expect(html).toContain('다른 활성 세션 1개');
  });

  it('does not claim a password change, email dispatch, or recent reauthentication from URL params', async () => {
    const html = await page({ password: 'changed', email: 'verification-sent', reauth: 'done' });
    expect(html).not.toContain('비밀번호를 성공적으로 변경하였으며');
    expect(html).not.toContain('이메일 변경 확인 메일 발송 요청이 접수되었습니다');
    expect(html).not.toContain('본인 확인이 완료되었습니다');
    expect(html).toContain('최근 보안 활동');
  });

  it('shows verified session readback rather than a query-supplied revoke count', async () => {
    const html = await page({ revoked: '99' }, { sessions: [current] });
    expect(html).toContain('다른 활성 세션 0개');
    expect(html).not.toContain('99개를 모두 안전하게 종료했습니다');
  });

  it('does not invent a zero-session success when authenticated session evidence is unavailable', async () => {
    const html = await page({ revoked: '4' }, null);
    expect(html).toContain('세션 정보를 확인할 수 없습니다');
    expect(html).not.toContain('다른 활성 세션 0개');
  });
});
