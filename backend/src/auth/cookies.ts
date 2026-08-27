export const AUTH_COOKIE = 'mv_session';
export const HOST_PREFIXED_AUTH_COOKIE = `__Host-${AUTH_COOKIE}`;
export const SESSION_MAX_AGE = 8 * 60 * 60;

interface CookieSecurity {
  readonly cookieSecure: boolean;
}

/**
 * Header-shaped rather than a full request: this only ever reads the cookie
 * header, and the socket.io handshake object passed at the lobby-connection
 * boundary carries headers without being an Express request.
 */
interface HeaderBearing {
  readonly cookie?: string | undefined;
}

/**
 * `__Host-` is only valid on a cookie that carries `Secure`, `Path=/`, and no
 * `Domain`. This cookie already satisfies the latter two unconditionally, so
 * `Secure` is the only variable — and `Secure` itself is only set when
 * `config.cookieSecure` is true. A browser silently drops a `__Host-`-named
 * cookie that lacks `Secure` instead of storing it, so applying the prefix
 * unconditionally would break every local run over plain HTTP. The prefix
 * therefore tracks `cookieSecure` exactly, both here and in `sessionToken()`.
 */
export function authCookieName(config: CookieSecurity): string {
  return config.cookieSecure ? HOST_PREFIXED_AUTH_COOKIE : AUTH_COOKIE;
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    try {
      parsed[key] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      /* Ignore malformed cookies. */
    }
  }
  return parsed;
}

/**
 * Reads the session token, falling back to the pre-`__Host-` cookie name so
 * that sessions issued before the rename are not silently logged out on
 * deploy — a browser holding an old `mv_session` cookie will never send the
 * new `__Host-mv_session` name on its own. `sessionCookie()` and
 * `clearSessionCookie()` only ever *write* the current name; this is a
 * read-only compatibility shim.
 */
export function sessionToken(headers: HeaderBearing, config: CookieSecurity): string | undefined {
  const parsed = parseCookies(headers.cookie);
  return parsed[authCookieName(config)] ?? parsed[AUTH_COOKIE];
}

export function sessionCookie(token: string, config: CookieSecurity): string {
  const attributes = [
    `${authCookieName(config)}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE}`,
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearSessionCookie(config: CookieSecurity): string {
  const attributes = [
    `${authCookieName(config)}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}
