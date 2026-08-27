import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { MinecraftResultSummary } from './approved-operation.repository';
import {
  MinecraftApprovedOperationInputError,
  PostgresMinecraftApprovedOperationExecutorRepository,
  PostgresMinecraftApprovedOperationRepository,
  requireMinecraftAgentRequestId,
  requireMinecraftApprovedOperation,
  requireMinecraftApprovedOperationUuid,
  requireMinecraftCompletionOutcome,
  requireMinecraftLeaseSeconds,
  requireMinecraftOperationState,
  normalizeMinecraftResultSummary,
} from './approved-operation.repository';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireExactObject(
  value: unknown,
  field: string,
  keys: Set<string>,
): Record<string, unknown> {
  if (!isRecord(value) || Array.isArray(value)) {
    throw new MinecraftApprovedOperationInputError(`${field} must be an object`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new MinecraftApprovedOperationInputError(`${field} must be a plain object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) {
      // Failing closed is intentional. It prevents future callers from
      // smuggling a command, URL, host, endpoint, method, or raw agent result
      // into this fixed-operation boundary.
      throw new MinecraftApprovedOperationInputError(`${field} contains an unsupported field`);
    }
  }
  return value;
}

function requiredTimestamp(value: unknown, field: string): string {
  // Invariant: `Date`'s runtime constructor coerces any input value it is
  // given (string, number, boolean, null all produce *some* Date; other
  // shapes produce an Invalid Date); this cast only satisfies TypeScript's
  // overload signatures and does not change which value flows into `Date`.
  const timestamp = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(timestamp.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return timestamp.toISOString();
}

function optionalTimestamp(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return requiredTimestamp(value, field);
}

function requiredReplayFlag(value: unknown, field = 'replayed'): boolean {
  if (typeof value !== 'boolean') throw new Error(`database returned an invalid ${field}`);
  return value;
}

/** Row shape accepted from PostgresMinecraftApprovedOperationRepository#requestOperation. */
interface RequestReceiptRow {
  readonly operation_id: unknown;
  readonly approval_request_id: unknown;
  readonly operation: unknown;
  readonly state: unknown;
  readonly replayed: unknown;
}

export interface MinecraftOperationReceipt {
  readonly operationId: string;
  readonly approvalRequestId: string;
  readonly operation: string;
  readonly state: string;
  readonly replayed: boolean;
}

function normalizeRequestReceipt(row: RequestReceiptRow): MinecraftOperationReceipt {
  return Object.freeze({
    operationId: requireMinecraftApprovedOperationUuid(row.operation_id, 'database operation id'),
    approvalRequestId: requireMinecraftApprovedOperationUuid(
      row.approval_request_id,
      'database approval request id',
    ),
    operation: requireMinecraftApprovedOperation(row.operation, 'database operation'),
    state: requireMinecraftOperationState(row.state),
    replayed: requiredReplayFlag(row.replayed),
  });
}

/** Row shape accepted from PostgresMinecraftApprovedOperationRepository#myOperation. */
interface MyOperationRow {
  readonly operation_id: unknown;
  readonly approval_request_id: unknown;
  readonly operation: unknown;
  readonly state: unknown;
  readonly requested_at: unknown;
  readonly approved_at: unknown;
  readonly finished_at: unknown;
  readonly result_summary: unknown;
}

export interface MinecraftMyOperation {
  readonly operationId: string;
  readonly approvalRequestId: string;
  readonly operation: string;
  readonly state: string;
  readonly requestedAt: string;
  readonly approvedAt: string | null;
  readonly finishedAt: string | null;
  readonly resultSummary: MinecraftResultSummary | null;
}

function normalizeMyOperation(row: MyOperationRow | null): MinecraftMyOperation | null {
  if (row === null || row === undefined) return null;
  if (row.result_summary !== null && row.result_summary !== undefined) {
    // Reuse the same strict allow-list on DB output. A malformed row is a
    // server fault, not data that should be displayed to an operator.
    normalizeMinecraftResultSummary(row.result_summary, 'database result summary');
  }
  return Object.freeze({
    operationId: requireMinecraftApprovedOperationUuid(row.operation_id, 'database operation id'),
    approvalRequestId: requireMinecraftApprovedOperationUuid(
      row.approval_request_id,
      'database approval request id',
    ),
    operation: requireMinecraftApprovedOperation(row.operation, 'database operation'),
    state: requireMinecraftOperationState(row.state),
    requestedAt: requiredTimestamp(row.requested_at, 'operation requested timestamp'),
    approvedAt: optionalTimestamp(row.approved_at, 'operation approved timestamp'),
    finishedAt: optionalTimestamp(row.finished_at, 'operation finished timestamp'),
    resultSummary:
      row.result_summary === null || row.result_summary === undefined
        ? null
        : normalizeMinecraftResultSummary(row.result_summary, 'database result summary'),
  });
}

/** Row shape accepted from PostgresMinecraftApprovedOperationExecutorRepository#claimNextApprovedOperation. */
interface ClaimRow {
  readonly operation_id: unknown;
  readonly operation: unknown;
  readonly lease_expires_at: unknown;
}

export interface MinecraftClaimedOperation {
  readonly operationId: string;
  readonly operation: string;
  readonly leaseToken: string;
  readonly leaseExpiresAt: string;
}

function normalizeClaim(
  row: ClaimRow | null,
  leaseToken: string,
): MinecraftClaimedOperation | null {
  if (row === null || row === undefined) return null;
  return Object.freeze({
    operationId: requireMinecraftApprovedOperationUuid(row.operation_id, 'database operation id'),
    operation: requireMinecraftApprovedOperation(row.operation, 'database operation'),
    leaseToken: requireMinecraftApprovedOperationUuid(leaseToken, 'lease token'),
    leaseExpiresAt: requiredTimestamp(row.lease_expires_at, 'lease expiry timestamp'),
  });
}

/** Row shape accepted from PostgresMinecraftApprovedOperationExecutorRepository#completeApprovedOperation. */
interface CompletionRow {
  readonly operation_id: unknown;
  readonly state: unknown;
  readonly replayed: unknown;
}

export interface MinecraftOperationCompletion {
  readonly operationId: string;
  readonly state: string;
  readonly replayed: boolean;
}

function normalizeCompletion(row: CompletionRow): MinecraftOperationCompletion {
  return Object.freeze({
    operationId: requireMinecraftApprovedOperationUuid(row.operation_id, 'database operation id'),
    state: requireMinecraftOperationState(row.state),
    replayed: requiredReplayFlag(row.replayed),
  });
}

function hasMethods(value: unknown, methods: readonly string[]): boolean {
  return isRecord(value) && methods.every((method) => typeof value[method] === 'function');
}

interface MinecraftApprovedOperationRepositoryLike {
  requestOperation(input: {
    requesterUserId: string;
    operation: string;
    idempotencyKey: string;
  }): Promise<RequestReceiptRow>;
  myOperation(input: {
    requesterUserId: string;
    operationId: string;
  }): Promise<MyOperationRow | null>;
}

function resolveRepository(repository: unknown): MinecraftApprovedOperationRepositoryLike {
  if (repository instanceof PostgresMinecraftApprovedOperationRepository) return repository;
  if (hasMethods(repository, ['requestOperation', 'myOperation'])) {
    // Invariant: hasMethods only confirms these two method names exist as
    // functions on the value; it cannot prove their call signatures, exactly
    // as the pre-conversion runtime check could not either.
    return repository as MinecraftApprovedOperationRepositoryLike;
  }
  throw new TypeError('a Minecraft approved-operation repository is required');
}

/**
 * Web/Discord-facing side of the workflow. `authenticatedUserId` is supplied
 * by the session or verified interaction boundary; DTOs cannot choose another
 * requester and cannot contain a host, URL, command, or agent request.
 */
@Injectable()
export class MinecraftApprovedOperationService {
  readonly repository: MinecraftApprovedOperationRepositoryLike;

  constructor(repository: unknown) {
    this.repository = resolveRepository(repository);
  }

  async requestOperation(
    authenticatedUserId: unknown,
    input: unknown,
  ): Promise<MinecraftOperationReceipt> {
    const actor = requireMinecraftApprovedOperationUuid(
      authenticatedUserId,
      'authenticated user id',
    );
    const dto = requireExactObject(
      input,
      'operation request',
      new Set(['operation', 'idempotencyKey']),
    );
    const operation = requireMinecraftApprovedOperation(dto.operation);
    const idempotencyKey = requireMinecraftApprovedOperationUuid(
      dto.idempotencyKey,
      'idempotency key',
    );
    return normalizeRequestReceipt(
      await this.repository.requestOperation({
        requesterUserId: actor,
        operation,
        idempotencyKey,
      }),
    );
  }

  async myOperation(
    authenticatedUserId: unknown,
    input: unknown,
  ): Promise<MinecraftMyOperation | null> {
    const actor = requireMinecraftApprovedOperationUuid(
      authenticatedUserId,
      'authenticated user id',
    );
    const dto = requireExactObject(input, 'operation lookup', new Set(['operationId']));
    const operationId = requireMinecraftApprovedOperationUuid(dto.operationId, 'operation id');
    return normalizeMyOperation(
      await this.repository.myOperation({
        requesterUserId: actor,
        operationId,
      }),
    );
  }
}

interface MinecraftApprovedOperationExecutorRepositoryLike {
  claimNextApprovedOperation(input: {
    leaseToken: string;
    leaseSeconds: number;
  }): Promise<ClaimRow | null>;
  completeApprovedOperation(input: {
    operationId: string;
    leaseToken: string;
    outcome: 'succeeded' | 'failed';
    agentRequestId: string | null;
    resultSummary: MinecraftResultSummary;
  }): Promise<CompletionRow>;
}

function resolveExecutorRepository(
  repository: unknown,
): MinecraftApprovedOperationExecutorRepositoryLike {
  if (repository instanceof PostgresMinecraftApprovedOperationExecutorRepository) return repository;
  if (hasMethods(repository, ['claimNextApprovedOperation', 'completeApprovedOperation'])) {
    // Invariant: hasMethods only confirms these two method names exist as
    // functions on the value; it cannot prove their call signatures, exactly
    // as the pre-conversion runtime check could not either.
    return repository as MinecraftApprovedOperationExecutorRepositoryLike;
  }
  throw new TypeError('a Minecraft approved-operation executor repository is required');
}

interface MinecraftApprovedOperationExecutorOptions {
  repository?: unknown;
  leaseSeconds?: unknown;
  randomUuid?: () => string;
}

/**
 * Internal executor side of the workflow. This service has no host client and
 * intentionally has no operation/host/URL argument to `claimNext`. It only
 * returns a DB-owned fixed operation after it has been approved and leased.
 *
 * Migration 014 does not grant its database functions to moneyverse_app. A
 * future host-local worker must receive a separately provisioned executor DB
 * role before constructing this service with a real repository.
 */
export class MinecraftApprovedOperationExecutor {
  readonly repository: MinecraftApprovedOperationExecutorRepositoryLike;
  readonly leaseSeconds: number;
  readonly randomUuid: () => string;

  constructor({
    repository,
    leaseSeconds = 30,
    randomUuid = randomUUID,
  }: MinecraftApprovedOperationExecutorOptions = {}) {
    const resolvedRepository = resolveExecutorRepository(repository);
    if (typeof randomUuid !== 'function') throw new TypeError('a UUID generator is required');
    this.repository = resolvedRepository;
    this.leaseSeconds = requireMinecraftLeaseSeconds(leaseSeconds);
    this.randomUuid = randomUuid;
  }

  async claimNext(): Promise<MinecraftClaimedOperation | null> {
    const leaseToken = requireMinecraftApprovedOperationUuid(
      this.randomUuid(),
      'generated lease token',
    );
    const row = await this.repository.claimNextApprovedOperation({
      leaseToken,
      leaseSeconds: this.leaseSeconds,
    });
    return normalizeClaim(row, leaseToken);
  }

  async complete(input: unknown): Promise<MinecraftOperationCompletion> {
    const dto = requireExactObject(
      input,
      'operation completion',
      new Set(['operationId', 'leaseToken', 'outcome', 'agentRequestId', 'resultSummary']),
    );
    const operationId = requireMinecraftApprovedOperationUuid(dto.operationId, 'operation id');
    const leaseToken = requireMinecraftApprovedOperationUuid(dto.leaseToken, 'lease token');
    const outcome = requireMinecraftCompletionOutcome(dto.outcome);
    const agentRequestId = requireMinecraftAgentRequestId(dto.agentRequestId);
    const resultSummary = normalizeMinecraftResultSummary(dto.resultSummary);
    return normalizeCompletion(
      await this.repository.completeApprovedOperation({
        operationId,
        leaseToken,
        outcome,
        agentRequestId,
        resultSummary,
      }),
    );
  }
}
