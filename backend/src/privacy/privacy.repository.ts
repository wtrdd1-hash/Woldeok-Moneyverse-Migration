import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PRIVACY_REQUEST_TYPES: readonly string[] = Object.freeze([
  'access',
  'correction',
  'restriction',
  'withdrawal',
  'deletion',
]);

export const PRIVACY_REQUEST_STATUSES: readonly string[] = Object.freeze(['received']);

export class PrivacyRequestInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrivacyRequestInputError';
  }
}

function assertPlainObject(
  value: unknown,
  field: string,
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new PrivacyRequestInputError(`${field} must be an object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new PrivacyRequestInputError(`${field} must be a plain object`);
  }
}

function exactInput(
  value: unknown,
  field: string,
  allowedKeys: ReadonlySet<string>,
): Record<string, unknown> {
  assertPlainObject(value, field);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      // The browser must never choose a target account, a delivery channel, or
      // an export format. This small DTO is deliberately the whole request.
      throw new PrivacyRequestInputError(`${field} contains an unsupported field`);
    }
  }
  return value;
}

export function requirePrivacyRequestUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new PrivacyRequestInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function requirePrivacyRequestType(value: unknown, field = 'request type'): string {
  if (typeof value !== 'string' || !PRIVACY_REQUEST_TYPES.includes(value)) {
    throw new PrivacyRequestInputError(`${field} must be a supported privacy request type`);
  }
  return value;
}

export function requirePrivacyRequestLimit(value: unknown, field = 'limit'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new PrivacyRequestInputError(`${field} must be an integer between 1 and 100`);
  }
  return value;
}

/**
 * This is intentionally a short, plain-text clarification only. It is not a
 * contact channel, attachment, arbitrary JSON payload, or data-export
 * destination. The database normalizes the same shape before persisting it.
 */
export function normalizePrivacyRequestDetail(value: unknown, field = 'detail'): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new PrivacyRequestInputError(`${field} must be text`);
  if (value.length > 4_000) {
    throw new PrivacyRequestInputError(`${field} must be at most 1000 characters`);
  }

  const normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length === 0) return null;
  if (
    normalized.length > 1_000 ||
    /[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)
  ) {
    throw new PrivacyRequestInputError(
      `${field} must be safe plain text of at most 1000 characters`,
    );
  }
  return normalized;
}

function requirePool(pool: Queryable): Queryable {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('a PostgreSQL pool is required');
  }
  return pool;
}

export interface PrivacyRequestCreateInput {
  readonly actorUserId: unknown;
  readonly requestType: unknown;
  readonly detail?: unknown;
  readonly idempotencyKey: unknown;
}

export interface PrivacyRequestListInput {
  readonly actorUserId: unknown;
  readonly limit?: unknown;
}

// The service layer re-validates every receipt/list field, so these stay
// `unknown` to match that defensive intent rather than asserting the
// database is already trusted.
export interface PrivacyRequestReceiptRow {
  readonly request_id?: unknown;
  readonly request_type?: unknown;
  readonly status?: unknown;
  readonly created_at?: unknown;
  readonly replayed?: unknown;
}

export interface PrivacyRequestListedRow {
  readonly request_id?: unknown;
  readonly request_type?: unknown;
  readonly detail?: unknown;
  readonly status?: unknown;
  readonly created_at?: unknown;
}

/**
 * Privacy-request database gateway.
 *
 * The shared application role has no direct privilege on the request table.
 * Both calls below are SECURITY DEFINER functions that receive the current
 * session-owned user ID as a separate argument and never take contact,
 * recipient, or export data.
 */
@Injectable()
export class PostgresPrivacyRequestRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = requirePool(pool);
  }

  async createMyRequest(input: PrivacyRequestCreateInput): Promise<PrivacyRequestReceiptRow> {
    const {
      actorUserId,
      requestType,
      detail = null,
      idempotencyKey,
    } = exactInput(
      input,
      'privacy request',
      new Set(['actorUserId', 'requestType', 'detail', 'idempotencyKey']),
    );
    const actor = requirePrivacyRequestUuid(actorUserId, 'authenticated user id');
    const type = requirePrivacyRequestType(requestType);
    const safeDetail = normalizePrivacyRequestDetail(detail);
    if (type === 'correction' && safeDetail === null) {
      throw new PrivacyRequestInputError('correction requests require a detail');
    }
    const key = requirePrivacyRequestUuid(idempotencyKey, 'idempotency key');

    /** public.privacy_create_my_request RETURNS TABLE: packages/database/migrations/015-privacy-data-subject-requests.sql */
    const {
      rows: [row],
    } = await this.pool.query<PrivacyRequestReceiptRow>(
      `SELECT
         request_id::text AS request_id,
         request_type,
         status,
         created_at,
         replayed
       FROM public.privacy_create_my_request($1, $2, $3, $4)`,
      [actor, type, safeDetail, key],
    );
    if (!row?.request_id || typeof row.replayed !== 'boolean') {
      throw new Error('database did not return a privacy-request receipt');
    }
    return row;
  }

  async listMyRequests(input: PrivacyRequestListInput): Promise<PrivacyRequestListedRow[]> {
    const { actorUserId, limit = 30 } = exactInput(
      input,
      'privacy request list',
      new Set(['actorUserId', 'limit']),
    );
    const actor = requirePrivacyRequestUuid(actorUserId, 'authenticated user id');
    const requestLimit = requirePrivacyRequestLimit(limit);
    /** public.privacy_list_my_requests RETURNS TABLE: packages/database/migrations/015-privacy-data-subject-requests.sql */
    const { rows } = await this.pool.query<PrivacyRequestListedRow>(
      `SELECT
         request_id::text AS request_id,
         request_type,
         detail,
         status,
         created_at
       FROM public.privacy_list_my_requests($1, $2)`,
      [actor, requestLimit],
    );
    return rows;
  }
}
