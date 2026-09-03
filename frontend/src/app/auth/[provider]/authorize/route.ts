import { NextResponse } from 'next/server';
import { ApiError, api, apiWithCookie } from '@/lib/api';
import { relaySetCookie, sessionCookiePair } from '@/lib/cookie-relay';
import { publicUrl } from '@/lib/public-url';

/**
 * Starts the OAuth round trip.
 *
 * A route handler on this origin because the provider's redirect URI is
 * registered against it and because only a route handler may issue a
 * redirect while relaying cookies.
 *
 * The URL is built by the API, which owns the client id, the PKCE challenge
 * and the state — none of which this process should be able to influence.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { readonly params: Promise<{ readonly provider: string }> },
): Promise<NextResponse> {
  const { provider } = await context.params;

  try {
    const { payload: session, setCookie } = await apiWithCookie<{ signedIn: boolean }>(
      '/api/v1/auth/prelogin-session',
      { method: 'POST' },
    );
    await relaySetCookie(setCookie);
    const cookieHeader = sessionCookiePair(setCookie);
    const { authorizationUrl } = await api<{ authorizationUrl: string }>(
      `/auth/${encodeURIComponent(provider)}/authorize`,
      cookieHeader && !session.signedIn ? { cookieHeader } : {},
    );
    const response = NextResponse.redirect(authorizationUrl);
    for (const cookie of setCookie) {
      response.headers.append('set-cookie', cookie);
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return NextResponse.redirect(publicUrl('/login/providers?error=oauth_session'));
      }
      if (error.status === 503) {
        return NextResponse.redirect(publicUrl('/login?error=provider_unavailable'));
      }
    }
    return NextResponse.redirect(publicUrl('/login?error=oauth_login'));
  }
}
