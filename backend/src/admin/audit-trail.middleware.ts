import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { RequestWithSession } from '../auth/session.context';
import { contextOf } from '../core/request-context';
import { auditContext } from './audit-context';
import type { AuditRepository } from './audit.repository';

/**
 * One audit row per administrator HTTP request -- the "record every console
 * view and execution" half of spec 14.9.
 *
 * WHY MIDDLEWARE AND NOT AN INTERCEPTOR. Nest runs guards before
 * interceptors, so an interceptor never sees the request an authorization
 * guard refused -- and 17.10 names authorization denial as a thing that must
 * be logged and alerted on. Middleware runs first and its `finish` handler
 * runs last, which is the only position that sees both the refused request
 * and the final status code of the served one.
 *
 * WHY IT DOES NOT FAIL THE REQUEST. The row is written after the response has
 * been sent, so there is nothing left to refuse. A failure here is logged
 * rather than swallowed; it cannot be turned into a 500 without pretending
 * the request did not happen, which it did.
 *
 * WHY AN ANONYMOUS REFUSAL IS NOT RECORDED. `admin_record_console_access`
 * requires an actor, and a request with no session has none. Unauthenticated
 * probing of `/api/v1/admin` is the throttler's problem, not the audit
 * trail's -- an unattributable row would only make the trail noisier.
 */
export interface AuditTrailOptions {
  readonly repository: AuditRepository | null;
  readonly pepper: string;
  readonly trustForwardedFor: boolean;
  readonly onFailure?: (error: unknown) => void;
}

function verb(method: string, status: number): string {
  if (status === 401 || status === 403) return 'denied';
  if (status >= 400) return 'failed';
  return method === 'GET' || method === 'HEAD' ? 'viewed' : 'executed';
}

export function adminAuditTrail({
  repository,
  pepper,
  trustForwardedFor,
  onFailure = () => {},
}: AuditTrailOptions): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!repository || request.method === 'OPTIONS') {
      next();
      return;
    }

    response.on('finish', () => {
      const carrier = request as RequestWithSession;
      const actorUserId = carrier.session?.user_id;
      if (!actorUserId) return;

      const status = response.statusCode;
      const context = auditContext({
        request: carrier,
        pepper,
        trustForwardedFor,
        outcome: status >= 400 ? 'failure' : 'success',
        responseStatus: status,
        extra: { completedAt: new Date().toISOString() },
      });

      const started = contextOf(request)?.receivedAt;
      if (started) context.durationMs = Date.now() - started.getTime();

      void repository
        .recordConsoleAccess({
          actorUserId,
          action: `admin.${context.feature as string}.${verb(request.method, status)}`,
          requestId: contextOf(request)?.requestId ?? null,
          context,
        })
        .catch(onFailure);
    });

    next();
  };
}
