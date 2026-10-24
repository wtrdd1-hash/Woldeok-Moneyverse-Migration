import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveIdentityEvidence } from './account-security-evidence';

const identity = (identityId: string, provider: string) => ({
  identityId,
  provider,
  displayName: provider,
  linkedAt: '2026-10-24T00:00:00.000Z',
});

describe('authoritative account sign-in evidence', () => {
  it('does not turn an unavailable API response into zero linked methods', () => {
    expect(resolveIdentityEvidence(null)).toEqual({
      status: 'unavailable',
      identities: [],
      methodCount: null,
      providerCount: null,
    });
  });

  it('distinguishes a confirmed empty list from a failed request', () => {
    expect(resolveIdentityEvidence({ identities: [] })).toEqual({
      status: 'empty',
      identities: [],
      methodCount: 0,
      providerCount: 0,
    });
  });

  it('reports only the actual server-supplied login methods', () => {
    const identities = [identity('id-1', 'discord'), identity('id-2', 'local_email')];
    expect(resolveIdentityEvidence({ identities })).toEqual({
      status: 'available',
      identities,
      methodCount: 2,
      providerCount: 2,
    });
  });

  it('does not inflate the number of distinct providers for duplicates', () => {
    const result = resolveIdentityEvidence({
      identities: [identity('id-1', 'discord'), identity('id-2', 'discord')],
    });
    expect(result.methodCount).toBe(2);
    expect(result.providerCount).toBe(1);
  });

  it('fails closed for malformed identity payloads instead of claiming protection', () => {
    for (const response of [{}, { identities: 'discord' }, { identities: [{ provider: 'discord' }] }]) {
      expect(resolveIdentityEvidence(response).status).toBe('unavailable');
    }
  });

  it('keeps private SEO and server authorization while removing invented security assurances', () => {
    const source = readFileSync('src/app/account/page.tsx', 'utf8');
    expect(source).toContain('await requireMember();');
    expect(source).toContain('robots: { index: false, follow: false }');
    expect(source).toContain("'/api/v1/account/identities'");
    expect(source).toContain('resolveIdentityEvidence(identityData)');
    expect(source).not.toContain('securityScore');
    expect(source).not.toContain('계정 보안 완성도');
    expect(source).not.toContain('보안 인증 완료');
    expect(source).not.toContain('최고 등급 보안 보호 상태');
    expect(source).not.toContain('언제든 안전하게 복구');
    expect(source).not.toContain('본인 확인이 완료되었습니다.');
    expect(source).toContain('linkedProviders.has(linked)');
    expect(source).toContain('href="/account/security"');
  });
});
