import { beforeEach, describe, expect, it, vi } from 'vitest';

const { internalApi, internalWithCookie, relay, pair } = vi.hoisted(() => ({
  internalApi: vi.fn(),
  internalWithCookie: vi.fn(),
  relay: vi.fn(),
  pair: vi.fn(() => 'mv_session=issued-spring-session'),
}));

vi.mock('@/lib/api', () => ({
  api: internalApi,
  apiWithCookie: internalWithCookie,
  ApiError: class ApiError extends Error {
    constructor(
      public status: number,
      public detail: string,
      public code: string,
    ) {
      super(detail);
    }
  },
}));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: relay, sessionCookiePair: pair }));
vi.mock('@/lib/public-url', () => ({
  publicUrl: (path: string) => `https://easy-scraping.com${path}`,
}));
vi.mock('@/lib/mobile-oauth-return', () => ({ mobileOAuthCompletionResponse: vi.fn() }));

import { GET as authorize } from './[provider]/authorize/route';
import { GET as callback } from './[provider]/callback/route';

const springCookie = 'mv_session=spring-token; Path=/; Secure; HttpOnly; Max-Age=2592000';
const nestCookie = '__Host-mv_session=nest-token; Path=/; Secure; HttpOnly; SameSite=Lax';
const params = { params: Promise.resolve({ provider: 'discord' }) };

beforeEach(() => {
  vi.resetAllMocks();
  pair.mockReturnValue('mv_session=issued-spring-session');
});

describe('OAuth cookie compatibility across Spring and Nest', () => {
  it('starts under the freshly issued Spring session, clears obsolete host token, and retains provider redirect', async () => {
    internalWithCookie.mockResolvedValueOnce({
      payload: { signedIn: false },
      setCookie: [springCookie],
    });
    internalApi.mockResolvedValueOnce({
      authorizationUrl: 'https://discord.com/oauth2/authorize?client_id=dummy',
    });
    const response = await authorize(
      new Request('https://easy-scraping.com/auth/discord/authorize'),
      params,
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('https://discord.com/oauth2/authorize');
    expect(internalApi).toHaveBeenCalledWith('/auth/discord/authorize', {
      cookieHeader: 'mv_session=issued-spring-session',
    });
    const cookies = response.headers.getSetCookie();
    expect(cookies).toContain(springCookie);
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^__Host-mv_session=;.*Expires=Thu, 01 Jan 1970 00:00:00 GMT.*Max-Age=0/,
        ),
      ]),
    );
  });

  it('does not clear the host session when the caller is already signed in', async () => {
    internalWithCookie.mockResolvedValueOnce({ payload: { signedIn: true }, setCookie: [] });
    internalApi.mockResolvedValueOnce({ authorizationUrl: 'https://discord.com/oauth2/authorize' });
    const response = await authorize(
      new Request('https://easy-scraping.com/auth/discord/authorize'),
      params,
    );
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('successful callback delivers Nest session and clears stale Spring cookie', async () => {
    internalWithCookie.mockResolvedValueOnce({
      payload: { outcome: 'signed-in', consentCurrent: true },
      setCookie: [nestCookie],
    });
    const response = await callback(
      new Request('https://easy-scraping.com/auth/discord/callback?state=dummy&code=dummy'),
      params,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://easy-scraping.com/?account=signed-in');
    expect(response.headers.getSetCookie()).toEqual(
      expect.arrayContaining([
        nestCookie,
        expect.stringMatching(/^mv_session=;.*Expires=Thu, 01 Jan 1970 00:00:00 GMT.*Max-Age=0/),
      ]),
    );
  });

  it('does not clear session cookies for linking or step-up verification', async () => {
    internalWithCookie.mockResolvedValueOnce({ payload: { outcome: 'linked' }, setCookie: [] });
    const response = await callback(
      new Request('https://easy-scraping.com/auth/discord/callback?state=dummy'),
      params,
    );
    expect(response.headers.get('location')).toContain('/account?linked=discord');
    expect(response.headers.getSetCookie()).toEqual([]);
  });
});
