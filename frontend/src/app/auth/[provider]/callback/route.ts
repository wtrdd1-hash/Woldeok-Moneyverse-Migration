import { NextResponse } from 'next/server';
import { ApiError, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';

/**
 * Where Discord and Google send the browser back.
 *
 * One path serves three purposes — signing in, linking another sign-in
 * method, and step-up reauthentication — because each provider allows one
 * registered redirect URI. Which one applies is decided by the challenge the
 * API stored, never by anything in this URL, so a caller cannot turn a link
 * into a login by editing it.
 *
 * The `set-cookie` the API issues on a successful login is relayed here. It
 * is the only place a session can reach the browser: the browser never talks
 * to the API directly.
 */
export const dynamic = 'force-dynamic';

/** The API's own error vocabulary, carried through to the login screen. */
const KNOWN_ERRORS = new Set([
  'oauth_session',
  'oauth_state',
  'oauth_cancelled',
  'oauth_response',
  'oauth_verification',
  'oauth_login',
  'consent_required',
]);

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly provider: string }> },
): Promise<NextResponse> {
  const { provider } = await context.params;
  const url = new URL(request.url);
  const query = url.searchParams;

  const forwarded = new URLSearchParams();
  for (const name of ['state', 'code', 'error'] as const) {
    const value = query.get(name);
    if (value !== null) forwarded.set(name, value);
  }

  try {
    const { payload, setCookie } = await apiWithCookie<{
      outcome: 'signed-in' | 'linked' | 'reauthenticated';
      provider?: string;
    }>(`/auth/${encodeURIComponent(provider)}/callback?${forwarded.toString()}`);

    await relaySetCookie(setCookie);

    if (payload.outcome === 'linked') {
      return NextResponse.redirect(new URL(`/account?linked=${provider}`, url.origin));
    }
    if (payload.outcome === 'reauthenticated') {
      return NextResponse.redirect(new URL('/account?reauth=done', url.origin));
    }
    return NextResponse.redirect(new URL('/?account=signed-in', url.origin));
  } catch (error) {
    const detail = error instanceof ApiError ? (error.detail ?? '') : '';
    const code = KNOWN_ERRORS.has(detail) ? detail : 'oauth_login';
    return NextResponse.redirect(new URL(`/login?error=${code}`, url.origin));
  }
}
