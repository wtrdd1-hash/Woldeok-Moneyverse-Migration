import 'server-only';

import { redirect } from 'next/navigation';
import { ApiError, api } from './api';

/**
 * What a page needs to know about the caller.
 *
 * The API decides all of it. Nothing here interprets the session cookie — it
 * is opaque, its hash is what the database stores, and only the API can
 * resolve it. A front end that tried to read it would be guessing.
 */
export interface Viewer {
  readonly csrfToken: string;
  readonly adminRoles: readonly string[];
}

/**
 * Loads what an authenticated page needs, or sends the visitor where they can
 * get it.
 *
 * The three outcomes are distinct on purpose and match the API's own answers:
 * 401 means sign in, 428 means the current policy has not been accepted, and
 * 503 means the store is offline — which is not the visitor's problem and must
 * not be presented as a login prompt.
 */
export async function requireViewer(): Promise<Viewer> {
  try {
    const session = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const admin = await api<{ roles: string[] }>('/api/v1/admin/me').catch(() => ({ roles: [] }));
    return { csrfToken: session.csrfToken, adminRoles: admin.roles };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect('/login?error=login_required');
      if (error.status === 428) redirect('/login?error=consent_required');
    }
    throw error;
  }
}
