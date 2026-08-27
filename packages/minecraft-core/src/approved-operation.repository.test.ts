import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  MinecraftApprovedOperationInputError,
  PostgresMinecraftApprovedOperationExecutorRepository,
  PostgresMinecraftApprovedOperationRepository,
} from './approved-operation.repository';
import { queueingPool, type RecordedQuery } from './testing/pool';

const REQUESTER_ID = '10000000-0000-4000-8000-000000000001';
const OPERATION_ID = '20000000-0000-4000-8000-000000000002';
const APPROVAL_ID = '30000000-0000-4000-8000-000000000003';
const IDEMPOTENCY_KEY = '40000000-0000-4000-8000-000000000004';
const LEASE_TOKEN = '50000000-0000-4000-8000-000000000005';

const poolWith = queueingPool;

function assertOnlyApprovedOperationFunctions(calls: readonly RecordedQuery[]) {
  for (const { sql } of calls) {
    assert.match(sql, /public\.minecraft_(?:request_approved_operation|get_my_approved_operation|claim_next_approved_operation|complete_approved_operation)/);
    assert.doesNotMatch(sql, /\b(?:INSERT|UPDATE|DELETE)\b/i);
    assert.doesNotMatch(sql, /FROM\s+public\.minecraft_approved_operation(?:s|_events)\b/i);
    assert.doesNotMatch(sql, /(?:host|endpoint|command|https?:\/\/)/i);
  }
}

test('request and requester-scoped lookup use only narrow DB functions', async () => {
  const mock = poolWith([
    [{
      operation_id: OPERATION_ID,
      approval_request_id: APPROVAL_ID,
      operation: 'restart',
      state: 'pending_approval',
      replayed: false,
    }],
    [{
      operation_id: OPERATION_ID,
      approval_request_id: APPROVAL_ID,
      operation: 'restart',
      state: 'approved',
      requested_at: '2026-08-26T00:00:00.000Z',
      approved_at: '2026-08-26T00:01:00.000Z',
      finished_at: null,
      result_summary: null,
    }],
  ]);
  const repository = new PostgresMinecraftApprovedOperationRepository(mock.pool);

  assert.deepEqual(await repository.requestOperation({
    requesterUserId: REQUESTER_ID,
    operation: 'restart',
    idempotencyKey: IDEMPOTENCY_KEY,
  }), {
    operation_id: OPERATION_ID,
    approval_request_id: APPROVAL_ID,
    operation: 'restart',
    state: 'pending_approval',
    replayed: false,
  });
  assert.deepEqual(await repository.myOperation({
    requesterUserId: REQUESTER_ID,
    operationId: OPERATION_ID,
  }), {
    operation_id: OPERATION_ID,
    approval_request_id: APPROVAL_ID,
    operation: 'restart',
    state: 'approved',
    requested_at: '2026-08-26T00:00:00.000Z',
    approved_at: '2026-08-26T00:01:00.000Z',
    finished_at: null,
    result_summary: null,
  });
  assert.deepEqual(mock.calls.map(call => call.values), [
    [REQUESTER_ID, 'restart', IDEMPOTENCY_KEY],
    [REQUESTER_ID, OPERATION_ID],
  ]);
  assertOnlyApprovedOperationFunctions(mock.calls);
});

test('executor gateway can only claim a DB-owned fixed operation and complete a safe summary', async () => {
  const mock = poolWith([
    [{
      operation_id: OPERATION_ID,
      operation: 'status',
      lease_expires_at: '2026-08-26T00:00:30.000Z',
    }],
    [{ operation_id: OPERATION_ID, state: 'succeeded', replayed: false }],
  ]);
  const repository = new PostgresMinecraftApprovedOperationExecutorRepository(mock.pool);

  assert.deepEqual(await repository.claimNextApprovedOperation({
    leaseToken: LEASE_TOKEN,
    leaseSeconds: 30,
  }), {
    operation_id: OPERATION_ID,
    operation: 'status',
    lease_expires_at: '2026-08-26T00:00:30.000Z',
  });
  assert.deepEqual(await repository.completeApprovedOperation({
    operationId: OPERATION_ID,
    leaseToken: LEASE_TOKEN,
    outcome: 'succeeded',
    agentRequestId: 'agent-4fd100',
    resultSummary: { state: 'running', responseDigest: 'a'.repeat(64) },
  }), {
    operation_id: OPERATION_ID,
    state: 'succeeded',
    replayed: false,
  });
  assert.deepEqual(mock.calls.map(call => call.values), [
    [LEASE_TOKEN, 30],
    [OPERATION_ID, LEASE_TOKEN, 'succeeded', 'agent-4fd100', {
      state: 'running', responseDigest: 'a'.repeat(64),
    }],
  ]);
  assertOnlyApprovedOperationFunctions(mock.calls);
});

test('repository rejects arbitrary host-control fields and unsafe raw result data before querying PostgreSQL', async () => {
  const mock = poolWith([]);
  const publicRepository = new PostgresMinecraftApprovedOperationRepository(mock.pool);
  const executorRepository = new PostgresMinecraftApprovedOperationExecutorRepository(mock.pool);

  // `host` is not part of RequestOperationInput — exactInput's runtime check
  // is what rejects it, matching the pre-conversion JS — but a fresh object
  // literal argument would fail TypeScript's excess-property check before
  // that runtime path is ever reached, so this is typed as the wider shape.
  const requestWithHostField: { requesterUserId: string; operation: string; idempotencyKey: string; host: string } = {
    requesterUserId: REQUESTER_ID,
    operation: 'restart',
    idempotencyKey: IDEMPOTENCY_KEY,
    host: '127.0.0.1',
  };
  await assert.rejects(
    publicRepository.requestOperation(requestWithHostField),
    MinecraftApprovedOperationInputError,
  );
  await assert.rejects(
    publicRepository.requestOperation({
      requesterUserId: REQUESTER_ID,
      operation: 'exec --unsafe',
      idempotencyKey: IDEMPOTENCY_KEY,
    }),
    MinecraftApprovedOperationInputError,
  );
  await assert.rejects(
    executorRepository.claimNextApprovedOperation({ leaseToken: LEASE_TOKEN, leaseSeconds: 121 }),
    MinecraftApprovedOperationInputError,
  );
  await assert.rejects(
    executorRepository.completeApprovedOperation({
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { command: 'stop' },
    }),
    MinecraftApprovedOperationInputError,
  );
  await assert.rejects(
    executorRepository.completeApprovedOperation({
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { logs: 'raw host log data is forbidden' },
    }),
    MinecraftApprovedOperationInputError,
  );
  assert.equal(mock.calls.length, 0);
});
