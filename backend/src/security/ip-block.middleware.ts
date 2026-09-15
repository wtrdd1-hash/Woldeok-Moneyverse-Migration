import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { requestClientKey, requestPath } from './rate-limit';

interface IpBlockOptions {
  readonly pool: Queryable | null;
  readonly trustForwardedFor: boolean;
  readonly onFailure?: (error: unknown) => void;
}

interface BlockedRow {
  readonly blocked: boolean;
}

/**
 * Enforces the administrator IP deny-list at the HTTP boundary.
 *
 * Health checks are excluded so a mistaken network block cannot make the
 * container look dead. The database function owns CIDR matching and expiry.
 * A database read failure is logged and allowed through: availability must
 * not depend on the moderation table, while an explicit matching block is
 * always refused before session/auth/controller work begins.
 */
export function ipBlockGate({
  pool,
  trustForwardedFor,
  onFailure = () => {},
}: IpBlockOptions): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!pool || request.method === 'OPTIONS' || requestPath(request) === '/health') {
      next();
      return;
    }

    const ip = requestClientKey(request, { trustForwardedFor });
    if (ip === 'unknown') {
      next();
      return;
    }

    void queryOne<BlockedRow>(
      pool,
      'SELECT public.security_address_blocked($1::inet) AS blocked',
      [ip],
    )
      .then((row) => {
        if (!row?.blocked) {
          next();
          return;
        }
        response.status(403).type('application/problem+json').send({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'ip_blocked',
          detail: 'this network is blocked',
        });
      })
      .catch((error: unknown) => {
        onFailure(error);
        next();
      });
  };
}
