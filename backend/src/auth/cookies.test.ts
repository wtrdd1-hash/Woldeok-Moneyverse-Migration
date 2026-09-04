import { describe, expect, it } from 'vitest';
import {
  AUTH_COOKIE,
  HOST_PREFIXED_AUTH_COOKIE,
  SESSION_MAX_AGE,
  authCookieName,
  clearSessionCookie,
  parseCookies,
  sessionCookie,
  sessionToken,
} from './cookies';

const SECURE = { cookieSecure: true } as const;
const INSECURE = { cookieSecure: false } as const;

describe('authCookieName', () => {
  it('uses the __Host- prefix only when the cookie will carry Secure', () => {
    expect(authCookieName(SECURE)).toBe(HOST_PREFIXED_AUTH_COOKIE);
    expect(authCookieName(INSECURE)).toBe(AUTH_COOKIE);
  });
});

describe('parseCookies', () => {
  it('parses multiple cookies', () => {
    expect(parseCookies('a=1; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('decodes percent-encoded values', () => {
    expect(parseCookies('a=hello%20world')).toEqual({ a: 'hello world' });
  });

  it('ignores a malformed percent sequence instead of throwing', () => {
    expect(() => parseCookies('a=%E0%A4%A')).not.toThrow();
  });

  it('ignores a pair with no name', () => {
    expect(parseCookies('=value')).toEqual({});
  });

  it('returns an empty object for a missing header', () => {
    expect(parseCookies(undefined)).toEqual({});
  });
});

describe('sessionToken', () => {
  it('reads the prefixed name on a secure deployment', () => {
    expect(sessionToken({ cookie: `${HOST_PREFIXED_AUTH_COOKIE}=token-value` }, SECURE)).toBe(
      'token-value',
    );
  });

  // A browser holding an old mv_session cookie will never send the new
  // __Host-mv_session name on its own, so without this fallback the rename
  // would log every live session out on deploy.
  it('falls back to the unprefixed name so a rename does not log everyone out', () => {
    expect(sessionToken({ cookie: `${AUTH_COOKIE}=old-token` }, SECURE)).toBe('old-token');
  });

  it('prefers the prefixed cookie when both are present', () => {
    const cookie = `${AUTH_COOKIE}=old-token; ${HOST_PREFIXED_AUTH_COOKIE}=new-token`;
    expect(sessionToken({ cookie }, SECURE)).toBe('new-token');
  });

  it('returns undefined with no cookie header', () => {
    expect(sessionToken({}, SECURE)).toBeUndefined();
  });
});

describe('sessionCookie', () => {
  it('is HttpOnly, SameSite=Lax and path-scoped to the whole site', () => {
    const header = sessionCookie('token-value', INSECURE);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/');
    expect(header).toContain(`Max-Age=${SESSION_MAX_AGE}`);
  });

  it('expires the session after thirty days', () => {
    expect(SESSION_MAX_AGE).toBe(30 * 24 * 60 * 60);
  });

  // A browser silently drops a __Host--named cookie that lacks Secure, with
  // no console error. Setting one without the other logs every developer on
  // plain HTTP out and gives them nothing to debug with.
  it('adds Secure and the prefix together, never one without the other', () => {
    const header = sessionCookie('token-value', SECURE);
    expect(header.startsWith(`${HOST_PREFIXED_AUTH_COOKIE}=`)).toBe(true);
    expect(header).toContain('Secure');
  });

  it('omits Secure on a plain-HTTP deployment and drops the prefix with it', () => {
    const header = sessionCookie('token-value', INSECURE);
    expect(header.startsWith(`${AUTH_COOKIE}=`)).toBe(true);
    expect(header).not.toContain('Secure');
  });

  it('never sets a Domain attribute, which __Host- forbids', () => {
    expect(sessionCookie('token-value', SECURE)).not.toContain('Domain');
  });

  it('percent-encodes the token', () => {
    expect(sessionCookie('a b', INSECURE)).toContain('a%20b');
  });

  it('round-trips through parseCookies', () => {
    const header = sessionCookie('a b', INSECURE);
    const [pair] = header.split(';');
    expect(parseCookies(pair)[AUTH_COOKIE]).toBe('a b');
  });
});

describe('clearSessionCookie', () => {
  it('expires the cookie immediately under the matching name', () => {
    expect(clearSessionCookie(SECURE)).toContain(`${HOST_PREFIXED_AUTH_COOKIE}=`);
    expect(clearSessionCookie(SECURE)).toContain('Max-Age=0');
  });

  it('keeps the same attributes the cookie was set with', () => {
    const header = clearSessionCookie(SECURE);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/');
    expect(header).toContain('Secure');
  });
});
