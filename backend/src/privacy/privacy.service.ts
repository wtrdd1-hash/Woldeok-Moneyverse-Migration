import { Injectable } from '@nestjs/common';
import type {
  PrivacyRequestCreateInput,
  PrivacyRequestListedRow,
  PrivacyRequestListInput,
  PrivacyRequestReceiptRow,
} from './privacy.repository';
import {
  PostgresPrivacyRequestRepository,
  PrivacyRequestInputError,
  PRIVACY_REQUEST_STATUSES,
  requirePrivacyRequestLimit,
  requirePrivacyRequestType,
  requirePrivacyRequestUuid,
  normalizePrivacyRequestDetail,
} from './privacy.repository';

function assertPlainObject(value: unknown, field: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new PrivacyRequestInputError(`${field} must be an object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new PrivacyRequestInputError(`${field} must be a plain object`);
  }
}

function exactObject(value: unknown, field: string, allowedKeys: ReadonlySet<string>): Record<string, unknown> {
  assertPlainObject(value, field);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      throw new PrivacyRequestInputError(`${field} contains an unsupported field`);
    }
  }
  return value;
}

function timestamp(value: unknown, field: string): string {
  // Invariant: this reproduces the exact runtime coercion `new Date(value)`
  // always had in the pre-conversion JavaScript. The Number.isNaN check
  // immediately below rejects anything Date can't interpret, so widening
  // the parameter type here does not let bad data reach a caller unchecked.
  const parsed = value instanceof Date ? value : new Date(value as string | number | Date);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return parsed.toISOString();
}

function requireStatus(value: unknown): string {
  if (typeof value !== 'string' || !PRIVACY_REQUEST_STATUSES.includes(value)) {
    throw new Error('database returned an invalid privacy request status');
  }
  return value;
}

export interface PrivacyRequestReceipt {
  readonly requestId: string;
  readonly requestType: string;
  readonly status: string;
  readonly createdAt: string;
  readonly replayed: boolean;
}

function normalizeReceipt(row: PrivacyRequestReceiptRow): PrivacyRequestReceipt {
  if (typeof row?.replayed !== 'boolean') {
    throw new Error('database returned an invalid privacy-request receipt');
  }
  return Object.freeze({
    requestId: requirePrivacyRequestUuid(row?.request_id, 'database request id'),
    requestType: requirePrivacyRequestType(row?.request_type, 'database request type'),
    status: requireStatus(row?.status),
    createdAt: timestamp(row?.created_at, 'privacy request timestamp'),
    replayed: row.replayed,
  });
}

export interface PrivacyRequestListedItem {
  readonly requestId: string;
  readonly requestType: string;
  readonly detail: string | null;
  readonly status: string;
  readonly createdAt: string;
}

function normalizeListedRequest(row: PrivacyRequestListedRow): PrivacyRequestListedItem {
  const detail = row?.detail === null || row?.detail === undefined
    ? null
    : normalizePrivacyRequestDetail(row.detail, 'database request detail');
  // The table canonicalizes stored details. If an unexpected privileged path
  // wrote a noncanonical value, do not surface it through an account page.
  if (detail !== row?.detail) throw new Error('database returned a noncanonical privacy request detail');

  return Object.freeze({
    requestId: requirePrivacyRequestUuid(row?.request_id, 'database request id'),
    requestType: requirePrivacyRequestType(row?.request_type, 'database request type'),
    detail,
    status: requireStatus(row?.status),
    createdAt: timestamp(row?.created_at, 'privacy request timestamp'),
  });
}

function accountUnavailable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return error.code === '28000';
}

export class PrivacyRequestAccountUnavailableError extends Error {
  constructor() {
    super('active account required');
    this.name = 'PrivacyRequestAccountUnavailableError';
  }
}

/**
 * The subset of the repository the service depends on. `PostgresPrivacyRequestRepository`
 * satisfies this structurally; the constructor also accepts any object shaped
 * like it (see the runtime duck-typing check below, kept for callers outside
 * this module's static type checking).
 */
export interface PrivacyRequestRepositoryLike {
  createMyRequest(input: PrivacyRequestCreateInput): Promise<PrivacyRequestReceiptRow>;
  listMyRequests(input: PrivacyRequestListInput): Promise<PrivacyRequestListedRow[]>;
}

export interface PrivacyRequestCreateDto {
  readonly requestType: unknown;
  readonly detail?: unknown;
  readonly idempotencyKey: unknown;
}

export interface PrivacyRequestListDto {
  readonly limit?: unknown;
}

/**
 * In-app data-subject request use cases.
 *
 * This service records an authenticated user's request for later reviewed
 * handling. It deliberately does not contain a delivery address, export
 * generation, external messaging, or account mutation. Those need separate
 * legal/operational decisions and must not be inferred from a request type.
 */
@Injectable()
export class PrivacyRequestService {
  readonly repository: PrivacyRequestRepositoryLike;

  constructor(repository: PrivacyRequestRepositoryLike) {
    const methods: readonly (keyof PrivacyRequestRepositoryLike)[] = ['createMyRequest', 'listMyRequests'];
    if (!(repository instanceof PostgresPrivacyRequestRepository)
      && (!repository || !methods.every(method => typeof repository[method] === 'function'))) {
      throw new TypeError('a privacy-request repository is required');
    }
    this.repository = repository;
  }

  async createRequest(authenticatedUserId: unknown, input: PrivacyRequestCreateDto): Promise<PrivacyRequestReceipt> {
    const actorUserId = requirePrivacyRequestUuid(authenticatedUserId, 'authenticated user id');
    const dto = exactObject(input, 'privacy request', new Set([
      'requestType', 'detail', 'idempotencyKey',
    ]));
    const requestType = requirePrivacyRequestType(dto.requestType);
    const detail = normalizePrivacyRequestDetail(dto.detail);
    if (requestType === 'correction' && detail === null) {
      throw new PrivacyRequestInputError('correction requests require a detail');
    }
    const idempotencyKey = requirePrivacyRequestUuid(dto.idempotencyKey, 'idempotency key');

    try {
      return normalizeReceipt(await this.repository.createMyRequest({
        actorUserId,
        requestType,
        detail,
        idempotencyKey,
      }));
    } catch (error) {
      if (accountUnavailable(error)) throw new PrivacyRequestAccountUnavailableError();
      throw error;
    }
  }

  async myRequests(authenticatedUserId: unknown, input: PrivacyRequestListDto = {}): Promise<PrivacyRequestListedItem[]> {
    const actorUserId = requirePrivacyRequestUuid(authenticatedUserId, 'authenticated user id');
    const dto = exactObject(input, 'privacy request list', new Set(['limit']));
    const requestLimit = requirePrivacyRequestLimit(dto.limit ?? 30);
    try {
      const rows = await this.repository.listMyRequests({ actorUserId, limit: requestLimit });
      return rows.map(normalizeListedRequest);
    } catch (error) {
      if (accountUnavailable(error)) throw new PrivacyRequestAccountUnavailableError();
      throw error;
    }
  }
}

export { PrivacyRequestInputError };
