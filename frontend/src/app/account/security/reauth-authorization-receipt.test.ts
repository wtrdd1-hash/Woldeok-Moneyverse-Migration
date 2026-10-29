import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiWithCookie: vi.fn() }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));

import { beginSecurityReauthentication } from './actions';

function form(provider: string): FormData {
  const data = new FormData();
  data.set('provider', provider);
  return data;
}

function validAuthorizationUrl(provider: 'discord' | 'google'): string {
  const url = new URL(provider === 'discord'
    ? 'https://discord.com/oauth2/authorize'
    : 'https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', 'synthetic-client');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', `https://test.example/auth/${provider}/callback`);
  url.searchParams.set('state', 'synthetic-state-0123456789abcdef');
  url.searchParams.set('code_challenge', 'a'.repeat(43));
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('scope', provider === 'discord' ? 'identify' : 'openid profile');
  if (provider === 'google') url.searchParams.set('nonce', 'synthetic-nonce-0123456789abcdef');
  return url.toString();
}

beforeEach(() => mutate.mockReset());

describe('step-up OAuth authorization receipts', () => {
  it('does not navigate when HTTP 200 omits the provider authorization URL', async () => {
    mutate.mockResolvedValue({});
    await expect(beginSecurityReauthentication(form('discord')))
      .rejects.toThrow('redirect:/account/security?error=reauth-start');
  });

  it.each([
    'javascript:alert(1)',
    'http://discord.com/oauth2/authorize',
    'https://discord.com.evil.example/oauth2/authorize',
    'https://discord.com@evil.example/oauth2/authorize',
  ])('rejects an unsafe external redirect %s', async (authorizationUrl) => {
    mutate.mockResolvedValue({ authorizationUrl });
    await expect(beginSecurityReauthentication(form('discord')))
      .rejects.toThrow('redirect:/account/security?error=reauth-start');
  });

  it('rejects a valid Google URL for a Discord reauthentication request', async () => {
    mutate.mockResolvedValue({ authorizationUrl: validAuthorizationUrl('google') });
    await expect(beginSecurityReauthentication(form('discord')))
      .rejects.toThrow('redirect:/account/security?error=reauth-start');
  });

  it.each(['state', 'code_challenge', 'client_id', 'redirect_uri'])('rejects missing OAuth challenge evidence: %s', async (field) => {
      const url = new URL(validAuthorizationUrl('discord'));
      url.searchParams.delete(field);
      mutate.mockResolvedValue({ authorizationUrl: url.toString() });
      await expect(beginSecurityReauthentication(form('discord')))
        .rejects.toThrow('redirect:/account/security?error=reauth-start');
    });

  it('rejects a redirect URI outside the provider callback route', async () => {
    const url = new URL(validAuthorizationUrl('discord'));
    url.searchParams.set('redirect_uri', 'https://evil.example/collect');
    mutate.mockResolvedValue({ authorizationUrl: url.toString() });
    await expect(beginSecurityReauthentication(form('discord')))
      .rejects.toThrow('redirect:/account/security?error=reauth-start');
  });

  it('rejects a non-PKCE authorization request', async () => {
    const url = new URL(validAuthorizationUrl('discord'));
    url.searchParams.set('code_challenge_method', 'plain');
    mutate.mockResolvedValue({ authorizationUrl: url.toString() });
    await expect(beginSecurityReauthentication(form('discord')))
      .rejects.toThrow('redirect:/account/security?error=reauth-start');
  });

  it.each(['discord', 'google'] as const)('allows a verified %s OAuth challenge', async (provider) => {
    const authorizationUrl = validAuthorizationUrl(provider);
    mutate.mockResolvedValue({ authorizationUrl });
    await expect(beginSecurityReauthentication(form(provider)))
      .rejects.toThrow(`redirect:${authorizationUrl}`);
    expect(mutate).toHaveBeenCalledWith(`/api/v1/auth/${provider}/reauthentication`);
  });

  it('never calls the API for unsupported providers', async () => {
    await expect(beginSecurityReauthentication(form('attacker')))
      .rejects.toThrow('redirect:/account/security?error=provider');
    expect(mutate).not.toHaveBeenCalled();
  });
});
