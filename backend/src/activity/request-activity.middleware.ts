import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { sessionToken } from '../auth/cookies';
import type { SessionRepository } from '../auth/session.repository';
import type { AppConfig } from '../core/config';
import { contextOf } from '../core/request-context';
import { requestClientKey, requestPath } from '../security/rate-limit';
import type { ActivityService } from './activity.service';

interface RequestActivityOptions {
  readonly activity: ActivityService | null;
  readonly sessions: SessionRepository | null;
  readonly config: AppConfig;
  readonly onFailure?: (error: unknown) => void;
}

/**
 * Records every application API request without retaining query values,
 * cookies, authorization data or request bodies. Health probes and CORS
 * preflights are operational noise and are deliberately excluded.
 */
export function requestActivityTrail({
  activity,
  sessions,
  config,
  onFailure = () => {},
}: RequestActivityOptions): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    const path = requestPath(request);
    if (!activity || request.method === 'OPTIONS' || path === '/health') {
      next();
      return;
    }

    const startedAt = Date.now();
    const token = sessionToken(request.headers, config);
    const actor = token && sessions
      ? sessions.get(token).then((session) => session?.user_id ?? null).catch(() => null)
      : Promise.resolve(null);

    response.on('finish', () => {
      void actor
        .then((actorUserId) => activity.recordRequest({
          actor: actorUserId,
          path,
          method: request.method.slice(0, 12),
          status: response.statusCode,
          durationMs: Math.max(0, Date.now() - startedAt),
          requestId: contextOf(request)?.requestId ?? null,
          ip: requestClientKey(request, {
            trustForwardedFor: config.trustProxyForwardedFor,
          }),
          userAgent: String(request.headers['user-agent'] ?? '').slice(0, 500) || null,
        }))
        .catch(onFailure);
    });

    next();
  };
}
