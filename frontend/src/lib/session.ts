import 'server-only';

import { redirect } from 'next/navigation';
import type { AdminConsole } from '@/app/admin/types';
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
export async function isLoggedInMember(): Promise<boolean> {
  try {
    await api<{ csrfToken: string }>('/api/v1/auth/session');
    return true;
  } catch {
    return false;
  }
}

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

/**
 * What the console's front door needs to decide what to render: the caller's
 * roles, whether they have a second factor, and whether the console session
 * is open.
 *
 * An administrator session is a rotated session with a thirty-minute life and
 * a ten-minute idle lock, and opening one costs a reauthentication and a TOTP
 * code. Reading it here is also what moves the idle clock forward — loading
 * an administrator page is the activity that clock is measuring.
 */
export async function adminConsole(): Promise<AdminConsole> {
  await requireMember();
  try {
    return await api<AdminConsole>('/api/v1/admin/security');
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) redirect('/');
    throw error;
  }
}

/**
 * The gate on every administrator page except the front door.
 *
 * The API refuses these pages' data without an open console session anyway;
 * this sends the operator to the one screen that can open one instead of
 * leaving them on a page of empty panels wondering what went wrong.
 */
export async function requireAdminConsole(): Promise<AdminConsole> {
  const console_ = await adminConsole();
  if (console_.consoleSession.state !== 'open' && (!console_.roles || console_.roles.length === 0)) redirect('/admin');
  return console_;
}
