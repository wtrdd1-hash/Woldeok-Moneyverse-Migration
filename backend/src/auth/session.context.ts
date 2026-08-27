import type { Request } from 'express';
import type { AuthSessionRow } from './session.repository';

export interface RequestWithSession extends Request {
  session?: AuthSessionRow;
  adminRoles?: string[];
}

/**
 * Reaching this without a session means a controller was decorated with the
 * wrong guard order. That is a programming defect, not a client error, so it
 * throws a plain Error and surfaces as a 500 with a stack rather than a
 * misleading 401 that would send the caller off to re-authenticate.
 */
export function requireSession(request: RequestWithSession): AuthSessionRow {
  const session = request.session;
  if (!session) throw new Error('guard order defect: no session on the request');
  return session;
}

export function requireUserId(request: RequestWithSession): string {
  const userId = requireSession(request).user_id;
  if (!userId) throw new Error('guard order defect: session is not bound to a user');
  return userId;
}
