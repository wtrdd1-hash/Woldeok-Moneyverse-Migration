import 'server-only';

import { redirect } from 'next/navigation';
import { ApiError, api } from './api';

/**
 * The gate an authenticated page opens with.
 *
 * The API decides all of it. Nothing here interprets the session cookie — it
 * is opaque, its hash is what the database stores, and only the API can
 * resolve it. A front end that tried to read it would be guessing.
 *
 * This is a redirect, not a permission check. It exists so a signed-out
 * visitor lands somewhere useful instead of on a page of empty panels; the
 * API refuses every request on its own regardless of what happens here.
 */
export async function requireMember(): Promise<void> {
  try {
    // Any authenticated route would do. This one is the cheapest, and its
    // three failures are exactly the three a member can be in.
    await api<{ csrfToken: string }>('/api/v1/auth/session');
  } catch (error) {
    if (error instanceof ApiError) {
      // 401 means sign in, 428 means the current policy has not been
      // accepted, and 503 means the store is offline — which is not the
      // visitor's problem and must not be presented as a login prompt.
      if (error.status === 401) redirect('/login?error=login_required');
      if (error.status === 428 || error.status === 403) redirect('/login?error=consent_required');
    }
    throw error;
  }
}

/**
 * The same, for an administrator page. `/admin/me` answers 403 without a
 * role, so this needs no second source of truth about who is an operator.
 */
export async function requireAdministrator(): Promise<readonly string[]> {
  await requireMember();
  try {
    const { roles } = await api<{ roles: string[] }>('/api/v1/admin/me');
    if (roles.length === 0) redirect('/');
    return roles;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) redirect('/');
    throw error;
  }
}
