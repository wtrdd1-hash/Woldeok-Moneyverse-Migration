import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Every request gets an id, and every audit row written while serving it
 * carries that id.
 *
 * `audit_logs.request_id` has existed since 001 and was NULL on every
 * backend-written row, because nothing ever generated one: the column was
 * threaded through four repository signatures and no controller supplied a
 * value. Spec 14.9 asks for an administrator request to be traceable from
 * the console through the API to the database function and the ledger
 * transaction it produced, which needs the id to exist before the handler
 * runs.
 *
 * `traceId` is the wider unit -- one browser action that fans out into
 * several API calls -- and defaults to the request id when no edge supplies
 * one, which keeps the column meaningful rather than empty.
 */
export interface RequestContext {
  readonly requestId: string;
  readonly traceId: string;
  readonly receivedAt: Date;
}

export interface RequestWithContext extends Request {
  auditContext?: RequestContext;
}

/**
 * The same shape `admin.repository.ts` enforces before handing a value to
 * PostgreSQL, so anything accepted here survives the whole path.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function suppliedUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return UUID.test(trimmed) ? trimmed.toLowerCase() : null;
}

/**
 * `trustForwardedHeaders` is the same switch that decides whether
 * `X-Forwarded-For` may be believed. A correlation id a visitor can choose is
 * a correlation id a visitor can collide with someone else's on purpose, so
 * the header is only read where an edge proxy is known to write it.
 */
export function requestContext({
  trustForwardedHeaders,
}: {
  trustForwardedHeaders: boolean;
}): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const carrier = request as RequestWithContext;
    const supplied = trustForwardedHeaders ? suppliedUuid(request.headers['x-request-id']) : null;
    const requestId = supplied ?? randomUUID();
    const trace = trustForwardedHeaders ? suppliedUuid(request.headers['x-trace-id']) : null;

    carrier.auditContext = {
      requestId,
      traceId: trace ?? requestId,
      receivedAt: new Date(),
    };

    next();
  };
}

export function contextOf(request: Request): RequestContext | null {
  return (request as RequestWithContext).auditContext ?? null;
}
