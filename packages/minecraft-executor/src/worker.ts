import { createHash } from 'node:crypto';
import {
  MINECRAFT_APPROVED_OPERATIONS,
  requireMinecraftAgentRequestId,
  requireMinecraftApprovedOperation,
  requireMinecraftApprovedOperationUuid,
  requireMinecraftOperationState,
} from '@moneyverse/minecraft-core';

const SERVER_STATE_BY_SYSTEMD_ACTIVE_STATE: Readonly<Record<string, string>> = Object.freeze({
  active: 'running',
  inactive: 'stopped',
  // A failed unit is certainly not healthy, but it is not proof of a clean
  // stopped state. Preserve uncertainty instead of presenting a false normal
  // shutdown to an operator.
  failed: 'unknown',
  activating: 'starting',
  deactivating: 'stopping',
});

export class MinecraftExecutorError extends Error {
  constructor(message = 'Minecraft executor operation failed') {
    super(message);
    this.name = 'MinecraftExecutorError';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasMethod(value: unknown, method: string): boolean {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>)[method] === 'function';
}

function requireMethod(value: unknown, method: string, description: string): void {
  if (!hasMethod(value, method)) {
    throw new TypeError(`${description} with ${method}() is required`);
  }
}

/** A clock function may return anything `Date`'s constructor accepts. */
type ClockLike = () => Date | string | number;

function safeNow(now: ClockLike): string {
  const value = now();
  // Invariant: `Date`'s runtime constructor coerces any input value it is
  // given (string or number; the `Date` case is already handled above); this
  // cast only satisfies TypeScript's overload signatures and does not change
  // which value is passed at runtime. Mirrors the equivalent cast in
  // src/minecraft/approved-operation-service.ts's `requiredTimestamp`.
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.valueOf())) return new Date().toISOString();
  return date.toISOString();
}

type AuditEvent = Record<string, unknown>;
type AuditLog = (event: AuditEvent) => void;

function defaultAuditLog(event: AuditEvent): void {
  process.stdout.write(`${JSON.stringify(event)}\n`);
}

function countLogLines(logs: string): number {
  if (logs.length === 0) return 0;
  const lines = logs.split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') lines.pop();
  return lines.length;
}

function responseDigest(response: unknown): string {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(response);
  } catch {
    throw new MinecraftExecutorError();
  }
  if (typeof serialized !== 'string') throw new MinecraftExecutorError();
  return createHash('sha256').update(serialized, 'utf8').digest('hex');
}

interface NormalizedClaim {
  readonly operationId: string;
  readonly operation: string;
  readonly leaseToken: string;
}

function normalizedClaim(claim: unknown): NormalizedClaim {
  if (!isPlainObject(claim)) throw new MinecraftExecutorError();
  return Object.freeze({
    operationId: requireMinecraftApprovedOperationUuid(claim.operationId, 'claimed operation id'),
    operation: requireMinecraftApprovedOperation(claim.operation, 'claimed operation'),
    leaseToken: requireMinecraftApprovedOperationUuid(claim.leaseToken, 'claimed lease token'),
  });
}

interface NormalizedCompletion {
  readonly state: string;
  readonly replayed: boolean;
}

function normalizedCompletion(completion: unknown): NormalizedCompletion {
  if (!isPlainObject(completion) || typeof completion.replayed !== 'boolean') {
    throw new MinecraftExecutorError();
  }
  return Object.freeze({
    state: requireMinecraftOperationState(completion.state, 'completion state'),
    replayed: completion.replayed,
  });
}

export type MinecraftHostOperationSummary =
  | Readonly<{ state: string; responseDigest: string }>
  | Readonly<{ logLineCount: number; logsTruncated: boolean; responseDigest: string }>
  | Readonly<{ accepted: true; responseDigest: string }>;

export interface HostAgentSummary {
  readonly agentRequestId: string;
  readonly resultSummary: MinecraftHostOperationSummary;
}

/**
 * Converts a successful host-agent response to the fixed, non-sensitive DB
 * receipt DTO. Raw logs, service names, command output, URLs, host data, and
 * agent errors intentionally have no return path from this function.
 */
export function summarizeHostAgentResponse(operation: unknown, response: unknown): HostAgentSummary {
  const fixedOperation = requireMinecraftApprovedOperation(operation, 'claimed operation');
  if (!isPlainObject(response)
    || response.operation !== fixedOperation
    || !isPlainObject(response.result)) {
    throw new MinecraftExecutorError();
  }
  const result = response.result;

  const agentRequestId = requireMinecraftAgentRequestId(response.requestId, 'host agent request id');
  if (agentRequestId === null) throw new MinecraftExecutorError();
  const digest = responseDigest({
    requestId: agentRequestId,
    operation: fixedOperation,
    result,
  });

  if (fixedOperation === 'status') {
    const stateValue = result.state;
    const activeState = isPlainObject(stateValue) ? stateValue.ActiveState : undefined;
    const state = typeof activeState === 'string'
      ? (SERVER_STATE_BY_SYSTEMD_ACTIVE_STATE[activeState] ?? 'unknown')
      : 'unknown';
    return Object.freeze({
      agentRequestId,
      resultSummary: Object.freeze({ state, responseDigest: digest }),
    });
  }

  if (fixedOperation === 'logs') {
    if (typeof result.logs !== 'string') throw new MinecraftExecutorError();
    const lineCount = countLogLines(result.logs);
    return Object.freeze({
      agentRequestId,
      resultSummary: Object.freeze({
        logLineCount: Math.min(lineCount, 999),
        logsTruncated: lineCount > 999,
        responseDigest: digest,
      }),
    });
  }

  if (result.accepted !== true) throw new MinecraftExecutorError();
  return Object.freeze({
    agentRequestId,
    resultSummary: Object.freeze({ accepted: true as const, responseDigest: digest }),
  });
}

function requirePollInterval(value: number): number {
  if (!Number.isSafeInteger(value) || value < 250 || value > 60000) {
    throw new TypeError('poll interval must be an integer between 250 and 60000 milliseconds');
  }
  return value;
}

export function waitForNextPoll(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(done, milliseconds);
    timer.unref?.();

    function done(): void {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    }

    signal?.addEventListener('abort', done, { once: true });
  });
}

export interface MinecraftExecutorLike {
  claimNext(): Promise<unknown>;
  complete(input: unknown): Promise<unknown>;
}

export interface MinecraftHostAgentLike {
  execute(operation: string): Promise<unknown>;
}

interface WorkerOptions {
  executor?: unknown;
  hostAgent?: unknown;
  auditLog?: AuditLog;
  now?: ClockLike;
}

export type WorkerRunResult =
  | Readonly<{ claimed: false }>
  | Readonly<{ claimed: true; operationId: string; operation: string; outcome: 'succeeded' | 'failed'; state: string }>;

interface RunUntilStoppedOptions {
  pollIntervalMs?: number;
  signal?: AbortSignal;
  sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}

/**
 * Sequential, host-local consumer for the durable one-attempt queue. It has
 * no HTTP listener and takes neither a target nor a command from a caller.
 */
export class MinecraftApprovedOperationWorker {
  readonly executor: MinecraftExecutorLike;
  readonly hostAgent: MinecraftHostAgentLike;
  readonly auditLog: AuditLog;
  readonly now: ClockLike;

  constructor({ executor, hostAgent, auditLog = defaultAuditLog, now = () => new Date() }: WorkerOptions = {}) {
    requireMethod(executor, 'claimNext', 'a Minecraft operation executor');
    requireMethod(executor, 'complete', 'a Minecraft operation executor');
    requireMethod(hostAgent, 'execute', 'a Minecraft host agent client');
    if (typeof auditLog !== 'function') throw new TypeError('an audit log function is required');
    if (typeof now !== 'function') throw new TypeError('a clock function is required');
    // Invariant: requireMethod has confirmed the required method names exist
    // as functions on these values; it cannot prove their call signatures,
    // exactly as the pre-conversion runtime check could not either.
    this.executor = executor as MinecraftExecutorLike;
    this.hostAgent = hostAgent as MinecraftHostAgentLike;
    this.auditLog = auditLog;
    this.now = now;
  }

  #audit(event: string, fields: AuditEvent = {}): void {
    try {
      this.auditLog({ event, at: safeNow(this.now), ...fields });
    } catch {
      // A local audit sink failure must not expose a host response or turn an
      // already-issued command into a retry.
    }
  }

  async #completeFailure(claim: NormalizedClaim): Promise<WorkerRunResult> {
    try {
      const completion = normalizedCompletion(await this.executor.complete({
        operationId: claim.operationId,
        leaseToken: claim.leaseToken,
        outcome: 'failed',
        agentRequestId: null,
        resultSummary: {},
      }));
      this.#audit('minecraft_executor_operation_completed', {
        operationId: claim.operationId,
        operation: claim.operation,
        outcome: 'failed',
        state: completion.state,
        replayed: completion.replayed,
      });
      return Object.freeze({
        claimed: true,
        operationId: claim.operationId,
        operation: claim.operation,
        outcome: 'failed',
        state: completion.state,
      });
    } catch {
      this.#audit('minecraft_executor_completion_failed', {
        operationId: claim.operationId,
        operation: claim.operation,
      });
      throw new MinecraftExecutorError();
    }
  }

  async runOnce(): Promise<WorkerRunResult> {
    let rawClaim: unknown;
    try {
      rawClaim = await this.executor.claimNext();
    } catch {
      this.#audit('minecraft_executor_claim_failed');
      throw new MinecraftExecutorError();
    }
    if (rawClaim === null || rawClaim === undefined) return Object.freeze({ claimed: false });

    let claim: NormalizedClaim;
    try {
      claim = normalizedClaim(rawClaim);
    } catch {
      // Do not execute an operation if a compromised/miswired executor did not
      // return the immutable queue shape. Its lease will expire visibly.
      this.#audit('minecraft_executor_invalid_claim');
      throw new MinecraftExecutorError();
    }

    this.#audit('minecraft_executor_operation_claimed', {
      operationId: claim.operationId,
      operation: claim.operation,
    });

    let safeResult: HostAgentSummary;
    try {
      const response = await this.hostAgent.execute(claim.operation);
      safeResult = summarizeHostAgentResponse(claim.operation, response);
    } catch {
      this.#audit('minecraft_executor_host_operation_failed', {
        operationId: claim.operationId,
        operation: claim.operation,
      });
      return this.#completeFailure(claim);
    }

    try {
      const completion = normalizedCompletion(await this.executor.complete({
        operationId: claim.operationId,
        leaseToken: claim.leaseToken,
        outcome: 'succeeded',
        agentRequestId: safeResult.agentRequestId,
        resultSummary: safeResult.resultSummary,
      }));
      this.#audit('minecraft_executor_operation_completed', {
        operationId: claim.operationId,
        operation: claim.operation,
        outcome: 'succeeded',
        state: completion.state,
        replayed: completion.replayed,
      });
      return Object.freeze({
        claimed: true,
        operationId: claim.operationId,
        operation: claim.operation,
        outcome: 'succeeded',
        state: completion.state,
      });
    } catch {
      // The host action may already have occurred. Do not retry it here; the
      // durable lease becomes lease_expired if a completion cannot be saved.
      this.#audit('minecraft_executor_completion_failed', {
        operationId: claim.operationId,
        operation: claim.operation,
      });
      throw new MinecraftExecutorError();
    }
  }

  async runUntilStopped({ pollIntervalMs = 3000, signal, sleep = waitForNextPoll }: RunUntilStoppedOptions = {}): Promise<void> {
    const interval = requirePollInterval(pollIntervalMs);
    if (typeof sleep !== 'function') throw new TypeError('a sleep function is required');
    this.#audit('minecraft_executor_polling_started', { pollIntervalMs: interval });
    while (!signal?.aborted) {
      const startedAt = Date.now();
      try {
        await this.runOnce();
      } catch {
        this.#audit('minecraft_executor_poll_failed');
      }
      if (signal?.aborted) break;
      const elapsed = Date.now() - startedAt;
      await sleep(Math.max(0, interval - elapsed), signal);
    }
    this.#audit('minecraft_executor_polling_stopped');
  }
}

export const __test__ = {
  SERVER_STATE_BY_SYSTEMD_ACTIVE_STATE,
  countLogLines,
  normalizedClaim,
  normalizedCompletion,
  responseDigest,
  MINECRAFT_APPROVED_OPERATIONS,
};
