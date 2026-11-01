/**
 * Club writes use the backend's current session-bound CSRF token, not a token
 * captured at page render. Fetching for each write prevents reuse after logout,
 * account switch or session rotation; the backend remains the authority.
 */
export async function clubMutation(path: string, init: RequestInit): Promise<Response> {
  if (!/^\/api\/v1\/clubs(?:\/|$)/.test(path) ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method ?? '') ||
      new Headers(init.headers).has('x-csrf-token')) {
    throw new Error('Invalid club mutation request');
  }

  const sessionResponse = await fetch('/app-api/v1/auth/session', {
    credentials: 'same-origin', cache: 'no-store', redirect: 'error',
  });
  if (!sessionResponse.ok) throw new Error('Club mutation requires an active CSRF session');

  const session: unknown = await sessionResponse.json();
  const csrfToken = session && typeof session === 'object' && !Array.isArray(session)
    ? (session as Record<string, unknown>).csrfToken : null;
  if (typeof csrfToken !== 'string' || !/^[A-Za-z0-9_-]{32,512}$/.test(csrfToken)) {
    throw new Error('Club mutation requires a valid current session CSRF token');
  }

  const headers = new Headers(init.headers);
  headers.set('x-csrf-token', csrfToken);
  return fetch(path, {
    ...init,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'error',
  });
}
