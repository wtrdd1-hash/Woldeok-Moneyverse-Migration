'use server';

import { redirect } from 'next/navigation';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';

/**
 * Ends the session.
 *
 * A server action rather than a link, because ending a session is a write and
 * has to carry a CSRF token — and because doing it here means the token is
 * fetched and spent on the server, so the browser never holds one.
 */
export async function logout(): Promise<void> {
  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<null>('/api/v1/auth/logout', {
      method: 'POST',
      csrfToken,
    });
    await relaySetCookie(setCookie);
  } catch {
    // A session that is already gone is the outcome the member asked for.
    // Failing the navigation here would leave them looking at a signed-in
    // page they can no longer use.
  }
  redirect('/');
}
