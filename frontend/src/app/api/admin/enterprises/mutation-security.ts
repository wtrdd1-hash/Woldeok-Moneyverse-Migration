import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

/** Fail closed at the browser gateway before forwarding any operator mutation. */
export async function enterpriseMutationCsrf(req: Request): Promise<string | NextResponse> {
  const origin = req.headers.get('origin');
  const fetchSite = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (fetchSite && fetchSite !== 'same-origin')) {
    return NextResponse.json({ error: 'same-origin request required' }, { status: 403 });
  }

  // Obtain the CSRF proof from the authenticated server-side session, not
  // from an arbitrary browser-supplied header or body field.
  const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
  if (typeof session?.csrfToken !== 'string' || session.csrfToken.length === 0) {
    return NextResponse.json({ error: 'authenticated CSRF session required' }, { status: 403 });
  }
  return session.csrfToken;
}
