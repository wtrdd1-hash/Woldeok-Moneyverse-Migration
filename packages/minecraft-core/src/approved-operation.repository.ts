import type { Queryable } from './db';
import { queryOne } from './db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AGENT_REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export const MINECRAFT_APPROVED_OPERATIONS: readonly string[] = Object.freeze([
  'start',
  'stop',
  'restart',
  'status',
  'logs',
]);

export const MINECRAFT_OPERATION_STATES: readonly string[] = Object.freeze([
  'pending_approval',
  'approved',
  'rejected',
  'leased',
  'lease_expired',
  'succeeded',
  'failed',
]);

export class MinecraftApprovedOperationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MinecraftApprovedOperationInputError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function plainObject(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value) || Array.isArray(value)) {
    throw new MinecraftApprovedOperationInputError(`${field} must be an object`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new MinecraftApprovedOperationInputError(`${field} must be a plain object`);
  }
  return value;
}

function exactInput(
  value: unknown,
  field: string,
  allowedKeys: Set<string>,
): Record<string, unknown> {
  const input = plainObject(value, field);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      throw new MinecraftApprovedOperationInputError(`${field} contains an unsupported field`);
    }
  }
  return input;
}

export function requireMinecraftApprovedOperationUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new MinecraftApprovedOperationInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function requireMinecraftApprovedOperation(value: unknown, field = 'operation'): string {
  if (typeof value !== 'string' || !MINECRAFT_APPROVED_OPERATIONS.includes(value)) {
    throw new MinecraftApprovedOperationInputError(
      `${field} must be one of the fixed Minecraft operations`,
    );
  }
  return value;
}

export function requireMinecraftOperationState(value: unknown, field = 'operation state'): string {
  if (typeof value !== 'string' || !MINECRAFT_OPERATION_STATES.includes(value)) {
    throw new Error(`database returned an invalid ${field}`);
  }
  return value;
}

export function requireMinecraftLeaseSeconds(value: unknown, field = 'lease seconds'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 5 || value > 120) {
    throw new MinecraftApprovedOperationInputError(`${field} must be an integer between 5 and 120`);
  }
  return value;
}

export function requireMinecraftCompletionOutcome(
  value: unknown,
  field = 'outcome',
): 'succeeded' | 'failed' {
  if (value !== 'succeeded' && value !== 'failed') {
    throw new MinecraftApprovedOperationInputError(`${field} must be succeeded or failed`);
  }
  return value;
}

export function requireMinecraftAgentRequestId(
  value: unknown,
  field = 'agent request id',
): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (
    typeof value !== 'string' ||
    value.trim() !== value ||
    !AGENT_REQUEST_ID_PATTERN.test(value)
  ) {
    throw new MinecraftApprovedOperationInputError(`${field} must be a safe opaque identifier`);
  }
  return value;
}

type MinecraftServerState = 'running' | 'stopped' | 'starting' | 'stopping' | 'unknown';

const MINECRAFT_SERVER_STATES: readonly string[] = [
  'running',
  'stopped',
  'starting',
  'stopping',
  'unknown',
];

function isMinecraftServerState(value: string): value is MinecraftServerState {
  return MINECRAFT_SERVER_STATES.includes(value);
}

/**
 * Mutable working shape while normalizeMinecraftResultSummary builds the
 * output; the exported type is the readonly view of the same fields.
 */
interface MinecraftResultSummaryDraft {
  accepted?: boolean;
  state?: MinecraftServerState;
  logLineCount?: number;
  logsTruncated?: boolean;
  responseDigest?: string;
}

export type MinecraftResultSummary = Readonly<MinecraftResultSummaryDraft>;

/**
 * Completion stores a deliberately tiny telemetry summary instead of a raw
 * host-agent response.  In particular, logs, errors, URLs, hosts, commands,
 * credentials, and nested caller-controlled values have no representation in
 * this DTO. PostgreSQL validates the same allow-list against the stored
 * operation before making it terminal.
 */
export function normalizeMinecraftResultSummary(
  value: unknown,
  field = 'result summary',
): MinecraftResultSummary {
  const summary = plainObject(value, field);
  const allowedKeys = new Set([
    'accepted',
    'state',
    'logLineCount',
    'logsTruncated',
    'responseDigest',
  ]);
  const output: MinecraftResultSummaryDraft = {};

  for (const key of Object.keys(summary)) {
    if (!allowedKeys.has(key)) {
      throw new MinecraftApprovedOperationInputError(`${field} contains an unsupported field`);
    }
  }

  if (Object.hasOwn(summary, 'accepted')) {
    if (typeof summary.accepted !== 'boolean') {
      throw new MinecraftApprovedOperationInputError(`${field}.accepted must be a boolean`);
    }
    output.accepted = summary.accepted;
  }

  if (Object.hasOwn(summary, 'state')) {
    if (typeof summary.state !== 'string' || !isMinecraftServerState(summary.state)) {
      throw new MinecraftApprovedOperationInputError(`${field}.state must be a fixed server state`);
    }
    output.state = summary.state;
  }

  if (Object.hasOwn(summary, 'logLineCount')) {
    const logLineCount = summary.logLineCount;
    if (
      typeof logLineCount !== 'number' ||
      !Number.isSafeInteger(logLineCount) ||
      logLineCount < 0 ||
      logLineCount > 999
    ) {
      throw new MinecraftApprovedOperationInputError(
        `${field}.logLineCount must be an integer between 0 and 999`,
      );
    }
    output.logLineCount = logLineCount;
  }

  if (Object.hasOwn(summary, 'logsTruncated')) {
    if (typeof summary.logsTruncated !== 'boolean') {
      throw new MinecraftApprovedOperationInputError(`${field}.logsTruncated must be a boolean`);
    }
    output.logsTruncated = summary.logsTruncated;
  }

  if (Object.hasOwn(summary, 'responseDigest')) {
    if (
      typeof summary.responseDigest !== 'string' ||
      !/^[0-9a-f]{64}$/i.test(summary.responseDigest)
    ) {
      throw new MinecraftApprovedOperationInputError(
        `${field}.responseDigest must be a SHA-256 hex digest`,
      );
    }
    output.responseDigest = summary.responseDigest.toLowerCase();
  }

  return Object.freeze(output);
}

function requirePool(pool: unknown): Queryable {
  if (!isRecord(pool) || typeof pool.query !== 'function') {
    throw new TypeError('a PostgreSQL pool is required');
  }
  // Invariant: a runtime check can only confirm `query` exists as a function,
  // not its generic call signature; callers are documented (repositories in
  // this module) to pass a pg Pool/PoolClient or an equivalent test double.
  return pool as unknown as Queryable;
}

function requireSingleRow<T>(row: T | null, functionName: string): T {
  if (!row) {
    throw new Error(`database did not return a result from ${functionName}`);
  }
  return row;
}

interface RequestOperationInput {
  readonly requesterUserId: unknown;
  readonly operation: unknown;
  readonly idempotencyKey: unknown;
}

interface MyOperationInput {
  readonly requesterUserId: unknown;
  readonly operationId: unknown;
}

interface ClaimNextInput {
  readonly leaseToken: unknown;
  readonly leaseSeconds: unknown;
}

interface CompleteOperationInput {
  readonly operationId: unknown;
  readonly leaseToken: unknown;
  readonly outcome: unknown;
  readonly agentRequestId?: unknown;
  readonly resultSummary: unknown;
}

/** Row returned by minecraft_request_approved_operation (packages/database/migrations/014-minecraft-approved-operations.sql). */
export interface RequestApprovedOperationRow {
  readonly operation_id: string;
  readonly approval_request_id: string;
  readonly operation: string;
  readonly state: string;
  readonly replayed: boolean;
}

/** Row returned by minecraft_get_my_approved_operation (packages/database/migrations/014-minecraft-approved-operations.sql). */
export interface MyApprovedOperationRow {
  readonly operation_id: string;
  readonly approval_request_id: string;
  readonly operation: string;
  readonly state: string;
  readonly requested_at: Date;
  readonly approved_at: Date | null;
  readonly finished_at: Date | null;
  readonly result_summary: unknown;
}

/** Row returned by minecraft_claim_next_approved_operation (packages/database/migrations/014-minecraft-approved-operations.sql). */
export interface ClaimNextApprovedOperationRow {
  readonly operation_id: string;
  readonly operation: string;
  readonly lease_expires_at: Date;
}

/** Row returned by minecraft_complete_approved_operation (packages/database/migrations/014-minecraft-approved-operations.sql). */
export interface CompleteApprovedOperationRow {
  readonly operation_id: string;
  readonly state: string;
  readonly replayed: boolean;
}

/**
 * Narrow gateway for web-facing request/read use cases.  It has no query that
 * mentions a Minecraft table, host, endpoint, URL, or arbitrary command.
 */
export class PostgresMinecraftApprovedOperationRepository {
  readonly pool: Queryable;

  constructor(pool: unknown) {
    this.pool = requirePool(pool);
  }

  async requestOperation(input: RequestOperationInput): Promise<RequestApprovedOperationRow> {
    const { requesterUserId, operation, idempotencyKey } = exactInput(
      input,
      'operation request',
      new Set(['requesterUserId', 'operation', 'idempotencyKey']),
    );
    const requester = requireMinecraftApprovedOperationUuid(
      requesterUserId,
      'authenticated user id',
    );
    const fixedOperation = requireMinecraftApprovedOperation(operation);
    const key = requireMinecraftApprovedOperationUuid(idempotencyKey, 'idempotency key');
    const row = await queryOne<RequestApprovedOperationRow>(
      this.pool,
      `SELECT
         operation_id::text AS operation_id,
         approval_request_id::text AS approval_request_id,
         operation,
         state,
         replayed
       FROM public.minecraft_request_approved_operation($1, $2, $3)`,
      [requester, fixedOperation, key],
    );
    return requireSingleRow(row, 'minecraft_request_approved_operation');
  }

  async myOperation(input: MyOperationInput): Promise<MyApprovedOperationRow | null> {
    const { requesterUserId, operationId } = exactInput(
      input,
      'operation lookup',
      new Set(['requesterUserId', 'operationId']),
    );
    const requester = requireMinecraftApprovedOperationUuid(
      requesterUserId,
      'authenticated user id',
    );
    const id = requireMinecraftApprovedOperationUuid(operationId, 'operation id');
    return queryOne<MyApprovedOperationRow>(
      this.pool,
      `SELECT
         operation_id::text AS operation_id,
         approval_request_id::text AS approval_request_id,
         operation,
         state,
         requested_at,
         approved_at,
         finished_at,
         result_summary
       FROM public.minecraft_get_my_approved_operation($1, $2)`,
      [requester, id],
    );
  }
}

/**
 * Private executor gateway.  Its two DB functions intentionally receive no
 * grants for moneyverse_app in migration 014; a future host-local worker must
 * use a separately provisioned database role.  This class is not imported by
 * server routes and never invokes MinecraftHostAgentClient itself.
 */
export class PostgresMinecraftApprovedOperationExecutorRepository {
  readonly pool: Queryable;

  constructor(pool: unknown) {
    this.pool = requirePool(pool);
  }

  async claimNextApprovedOperation(
    input: ClaimNextInput,
  ): Promise<ClaimNextApprovedOperationRow | null> {
    const { leaseToken, leaseSeconds } = exactInput(
      input,
      'operation lease',
      new Set(['leaseToken', 'leaseSeconds']),
    );
    const token = requireMinecraftApprovedOperationUuid(leaseToken, 'lease token');
    const seconds = requireMinecraftLeaseSeconds(leaseSeconds);
    return queryOne<ClaimNextApprovedOperationRow>(
      this.pool,
      `SELECT
         operation_id::text AS operation_id,
         operation,
         lease_expires_at
       FROM public.minecraft_claim_next_approved_operation($1, $2)`,
      [token, seconds],
    );
  }

  async completeApprovedOperation(
    input: CompleteOperationInput,
  ): Promise<CompleteApprovedOperationRow> {
    const {
      operationId,
      leaseToken,
      outcome,
      agentRequestId = null,
      resultSummary,
    } = exactInput(
      input,
      'operation completion',
      new Set(['operationId', 'leaseToken', 'outcome', 'agentRequestId', 'resultSummary']),
    );
    const id = requireMinecraftApprovedOperationUuid(operationId, 'operation id');
    const token = requireMinecraftApprovedOperationUuid(leaseToken, 'lease token');
    const fixedOutcome = requireMinecraftCompletionOutcome(outcome);
    const requestId = requireMinecraftAgentRequestId(agentRequestId);
    const summary = normalizeMinecraftResultSummary(resultSummary);
    const row = await queryOne<CompleteApprovedOperationRow>(
      this.pool,
      `SELECT
         operation_id::text AS operation_id,
         state,
         replayed
       FROM public.minecraft_complete_approved_operation($1, $2, $3, $4, $5::jsonb)`,
      [id, token, fixedOutcome, requestId, summary],
    );
    return requireSingleRow(row, 'minecraft_complete_approved_operation');
  }
}
