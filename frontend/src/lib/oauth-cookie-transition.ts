/**
 * The current Spring prelogin path issues mv_session, while the canonical Nest
 * provider callback prefers __Host-mv_session. A browser carrying both can
 * authorize against one session and return its state on the other.
 *
 * This scoped transition preserves state binding: it does not relax OAuth
 * challenge verification or change the backend's global cookie precedence.
 */
const CLEAR_HOST_SESSION =
  '__Host-mv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
const CLEAR_LEGACY_SESSION =
  'mv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax';

function issuedSession(setCookie: readonly string[], name: string): boolean {
  return setCookie.some((header) => {
    const [pair] = header.split(';', 1);
    if (!pair || !pair.startsWith(`${name}=`) || pair.length <= name.length + 1) return false;
    return !/(?:^|;)\s*max-age\s*=\s*0\s*(?:;|$)/i.test(header);
  });
}

/** A new anonymous Spring session must be the only cookie Nest sees on callback. */
export function cookiesToClearAfterOAuthStart(
  setCookie: readonly string[],
  signedIn: boolean,
): readonly string[] {
  return !signedIn && issuedSession(setCookie, 'mv_session') ? [CLEAR_HOST_SESSION] : [];
}

/** After Nest replaces the session, Spring must not read the stale prelogin cookie. */
export function cookiesToClearAfterOAuthCompletion(
  setCookie: readonly string[],
  outcome: 'signed-in' | 'linked' | 'reauthenticated' | null | undefined,
): readonly string[] {
  return outcome === 'signed-in' && issuedSession(setCookie, '__Host-mv_session')
    ? [CLEAR_LEGACY_SESSION]
    : [];
}
