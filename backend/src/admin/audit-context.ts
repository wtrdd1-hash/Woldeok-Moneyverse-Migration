import { createHash } from 'node:crypto';
import type { RequestWithSession } from '../auth/session.context';
import { contextOf } from '../core/request-context';
import { requestClientKey } from '../security/rate-limit';

/**
 * Builds the `context` envelope that
 * packages/database/migrations/063-audit-event-context.sql validates.
 *
 * The key set there is closed: an unrecognised key is a 22023, not a dropped
 * field. So this file and that migration are one unit, and adding a field
 * means editing both.
 *
 * Nothing here reads a request body. Spec 14.9 forbids storing a request
 * whole and asks for allowed fields recorded in a structured form; a caller
 * that wants a value from the body passes it explicitly through `extra`,
 * having decided that value is safe to keep.
 */
export type AuditOutcome = 'success' | 'failure' | 'partial';

export interface AuditContextInput {
  readonly request: RequestWithSession;
  readonly pepper: string;
  readonly trustForwardedFor: boolean;
  readonly feature?: string;
  readonly outcome?: AuditOutcome;
  readonly responseStatus?: number;
  readonly durationMs?: number;
  readonly extra?: Record<string, unknown>;
}

/**
 * An address, not an address-shaped string. `requestClientKey` answers
 * `'unknown'` when there is nothing to report, and PostgreSQL's `inet` would
 * reject that as malformed rather than treat it as absent.
 */
const ADDRESS = /^[0-9a-fA-F.:]+$/;

/**
 * Coarse on purpose. A full user-agent string is a fingerprint and 18.6 asks
 * for the minimum necessary; the family answers "was this the same kind of
 * client" and the hash answers "was this the same client", which together
 * cover what an incident needs without keeping the string itself.
 */
function userAgentFamily(userAgent: string): string | undefined {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : /bot|crawler|spider/i.test(userAgent)
              ? 'Bot'
              : undefined;

  const platform = /Windows/.test(userAgent)
    ? 'Windows'
    : /Android/.test(userAgent)
      ? 'Android'
      : /iPhone|iPad|iOS/.test(userAgent)
        ? 'iOS'
        : /Mac OS X/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : undefined;

  if (!browser && !platform) return undefined;
  return [browser ?? 'Unknown', platform ?? 'Unknown'].join(' on ');
}

function peppered(pepper: string, label: string, value: string): string {
  return createHash('sha256').update(`${pepper}:${label}:${value}`).digest('hex');
}

/**
 * `/api/v1/admin/audit-events/...` becomes `audit_events`. The database
 * checks the result against `^[a-z][a-z0-9_.:-]{2,63}$`, so anything that
 * does not fit is reported as the generic console rather than rejected --
 * a new route must not be able to make its own audit write fail.
 */
export function featureFromPath(path: string): string {
  const match = /^\/api\/v\d+\/admin\/([a-z0-9-]+)/i.exec(path);
  const candidate = match?.[1]?.toLowerCase().replace(/-/g, '_');
  if (!candidate || !/^[a-z][a-z0-9_.:-]{2,63}$/.test(candidate)) return 'console';
  return candidate;
}

export function auditContext({
  request,
  pepper,
  trustForwardedFor,
  feature,
  outcome,
  responseStatus,
  durationMs,
  extra = {},
}: AuditContextInput): Record<string, unknown> {
  const correlation = contextOf(request);
  const session = request.session;
  const userAgent = typeof request.headers['user-agent'] === 'string'
    ? request.headers['user-agent'].slice(0, 512)
    : undefined;
  const address = requestClientKey(request, { trustForwardedFor });

  const context: Record<string, unknown> = {
    traceId: correlation?.traceId,
    sessionHash: session ? peppered(pepper, 'session', session.id) : undefined,
    authMethod: request.adminSession ? 'oauth_session.console' : 'oauth_session',
    reauthenticatedAt: session?.reauthenticated_at?.toISOString(),
    actorRoles: request.adminRoles && request.adminRoles.length ? request.adminRoles : undefined,
    clientIp: address !== 'unknown' && ADDRESS.test(address) ? address : undefined,
    userAgentHash: userAgent ? peppered(pepper, 'user-agent', userAgent) : undefined,
    userAgentFamily: userAgent ? userAgentFamily(userAgent) : undefined,
    httpMethod: request.method,
    httpPath: request.path,
    feature: feature ?? featureFromPath(request.path),
    outcome,
    responseStatus,
    durationMs,
    receivedAt: correlation?.receivedAt.toISOString(),
    ...extra,
  };

  for (const [key, value] of Object.entries(context)) {
    if (value === undefined || value === null) delete context[key];
  }

  return context;
}
