import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => {}) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/components/refresh-on-return', () => ({ RefreshOnReturn: () => null }));
vi.mock('@/app/profile/profile-avatar', () => ({
  ProfileAvatar: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock('./account-forms', () => ({
  DeleteAccountForm: () => null,
  LinkButton: () => null,
  ReauthButton: () => null,
  UnlinkButton: () => null,
}));

import { apiOrNull } from '@/lib/api';
import AccountPage from './page';

const validIdentity = {
  identityId: '00000000-0000-4000-8000-000000000001',
  provider: 'discord',
  displayName: 'Linked Discord',
  linkedAt: '2026-10-24T00:00:00.000Z',
};

async function renderAccount(
  identityResponse: unknown,
  params: { linked?: string; reauth?: string } = {},
): Promise<string> {
  vi.mocked(apiOrNull).mockImplementation(async (path) => {
    if (path === '/api/v1/account/identities') return identityResponse;
    if (path === '/api/v1/auth/providers') return { providers: [{ id: 'discord', enabled: true }] };
    if (path === '/api/v1/profile') return { displayName: 'Member' };
    return null;
  });
  return renderToStaticMarkup(await AccountPage({ searchParams: Promise.resolve(params) }));
}

describe('member account evidence rendered from the authenticated API', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders an API outage as unknown, not as zero methods or a verified account', async () => {
    const html = await renderAccount(null, { linked: 'discord', reauth: 'done' });
    expect(html).toContain('연결 수단 확인 불가');
    expect(html).toContain('현재 보호 상태를 판단할 수 없습니다.');
    expect(html).not.toContain('연결 수단 0개');
    expect(html).not.toContain('계정이 안전하게 연결되었습니다.');
    expect(html).not.toContain('보안 인증 완료');
    expect(html).not.toContain('본인 확인이 완료되었습니다.');
  });

  it('shows a confirmed empty response separately from an API failure', async () => {
    const html = await renderAccount({ identities: [] });
    expect(html).toContain('연결 수단 0개');
    expect(html).toContain('연결 정보 없음');
    expect(html).not.toContain('연결 수단 확인 불가');
  });

  it('shows linked provider success only when the API confirms that provider', async () => {
    const html = await renderAccount({ identities: [validIdentity] }, { linked: 'discord' });
    expect(html).toContain('연결 수단 1개');
    expect(html).toContain('Discord 계정이 안전하게 연결되었습니다.');
    expect(html).not.toContain('보안 완성도');
  });

  it('ignores forged success query parameters for unlinked providers', async () => {
    const html = await renderAccount({ identities: [validIdentity] }, { linked: 'google' });
    expect(html).not.toContain('Google 계정이 안전하게 연결되었습니다.');
  });

  it('preserves accessible security navigation and member-only noindex metadata', async () => {
    const html = await renderAccount({ identities: [validIdentity] });
    expect(html).toContain('aria-label="로그인 수단 확인 결과"');
    expect(html).toContain('href="/account/security"');
    expect(html).toContain('min-h-11');
  });
});
