import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';

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
  request: Request,
  context: { readonly params: Promise<{ readonly provider: string }> },
): Promise<NextResponse> {
  const { provider } = await context.params;
  const origin = new URL(request.url).origin;

  try {
    const { authorizationUrl } = await api<{ authorizationUrl: string }>(
      `/auth/${encodeURIComponent(provider)}/authorize`,
    );
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      // No session, or a session that never acknowledged the policy: both
      // are answered by sending the visitor to the consent step, which is
      // where they can fix it.
      if (error.status === 401 || error.status === 403) {
        return NextResponse.redirect(new URL('/login?error=consent_required', origin));
      }
      if (error.status === 503) {
        return NextResponse.redirect(new URL('/login?error=provider_unavailable', origin));
      }
    }
    return NextResponse.redirect(new URL('/login?error=oauth_login', origin));
  }
}
