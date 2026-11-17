/**
 * The current Spring prelogin path issues mv_session, while the canonical Nest
 * provider callback prefers __Host-mv_session. A browser carrying both can
 * authorize against one session and return its state on the other.
 *
 * This scoped transition preserves state binding: it does not relax OAuth
 * challenge verification or change the backend's global cookie precedence.
 */
export const CLEAR_HOST_SESSION =
  '__Host-mv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
export const CLEAR_LEGACY_SESSION =
  'mv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax';

function issuedSession(setCookie: readonly string[], name: string): boolean {
  return setCookie.some((header) => {
    const [pair] = header.split(';', 1);
    if (!pair || !pair.startsWith(`${name}=`) || pair.length <= name.length + 1) return false;
    return !/(?:^|;)\s*max-age\s*=\s*0\s*(?:;|$)/i.test(header);
  });
}

/**
 * When starting OAuth round trip, clear any conflicting sessions so Nest & Spring
 * agree on the exact prelogin session ID bound to the PKCE/state challenge.
 */
export function cookiesToClearAfterOAuthStart(
  setCookie: readonly string[],
  signedIn: boolean,
): readonly string[] {
  if (!signedIn) {
    if (issuedSession(setCookie, 'mv_session')) {
      return [CLEAR_HOST_SESSION];
    }
    if (issuedSession(setCookie, '__Host-mv_session')) {
      return [CLEAR_LEGACY_SESSION];
    }
  }
  return [];
}

/** After provider replaces the session on callback, clear the superseded prelogin cookie. */
export function cookiesToClearAfterOAuthCompletion(
  setCookie: readonly string[],
  outcome: 'signed-in' | 'linked' | 'reauthenticated' | null | undefined,
): readonly string[] {
  if (outcome === 'signed-in') {
    if (issuedSession(setCookie, '__Host-mv_session')) {
      return [CLEAR_LEGACY_SESSION];
    }
    if (issuedSession(setCookie, 'mv_session')) {
      return [CLEAR_HOST_SESSION];
    }
  }
  return [];
}
