import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  MinecraftApprovedOperationExecutor,
  MinecraftApprovedOperationService,
} from './approved-operation.service';
import { MinecraftApprovedOperationInputError } from './approved-operation.repository';

const REQUESTER_ID = '10000000-0000-4000-8000-000000000001';
const OPERATION_ID = '20000000-0000-4000-8000-000000000002';
const APPROVAL_ID = '30000000-0000-4000-8000-000000000003';
const IDEMPOTENCY_KEY = '40000000-0000-4000-8000-000000000004';
const LEASE_TOKEN = '50000000-0000-4000-8000-000000000005';

test('a request always uses the authenticated server operator and exposes no actor target field', async () => {
  const calls: unknown[] = [];
  const service = new MinecraftApprovedOperationService({
    requestOperation: async (input: { requesterUserId: string; operation: string; idempotencyKey: string }) => {
      calls.push(input);
      return {
        operation_id: OPERATION_ID,
        approval_request_id: APPROVAL_ID,
        operation: 'restart',
        state: 'pending_approval',
        replayed: false,
      };
    },
    myOperation: async () => null,
  });

  assert.deepEqual(await service.requestOperation(REQUESTER_ID, {
    operation: 'restart',
    idempotencyKey: IDEMPOTENCY_KEY,
  }), {
    operationId: OPERATION_ID,
    approvalRequestId: APPROVAL_ID,
    operation: 'restart',
    state: 'pending_approval',
    replayed: false,
  });
  assert.deepEqual(calls, [{
    requesterUserId: REQUESTER_ID,
    operation: 'restart',
    idempotencyKey: IDEMPOTENCY_KEY,
  }]);
});
test('request and lookup DTOs reject command, URL, host, endpoint, and target-user injection before repository use', async () => {
  let calls = 0;
  const service = new MinecraftApprovedOperationService({
    requestOperation: async () => { calls += 1; return {}; },
    myOperation: async () => { calls += 1; return null; },
  });

  for (const dangerousDto of [
    { operation: 'restart', idempotencyKey: IDEMPOTENCY_KEY, command: 'stop' },
    { operation: 'restart', idempotencyKey: IDEMPOTENCY_KEY, url: 'http://127.0.0.1:18080' },
    { operation: 'restart', idempotencyKey: IDEMPOTENCY_KEY, host: '127.0.0.1' },
    { operation: 'restart', idempotencyKey: IDEMPOTENCY_KEY, endpoint: '/v1/minecraft/restart' },
    { operation: 'restart', idempotencyKey: IDEMPOTENCY_KEY, requesterUserId: 'attacker-controlled' },
  ]) {
    await assert.rejects(service.requestOperation(REQUESTER_ID, dangerousDto), MinecraftApprovedOperationInputError);
  }
  await assert.rejects(
    service.myOperation(REQUESTER_ID, { operationId: OPERATION_ID, userId: 'other-user' }),
    MinecraftApprovedOperationInputError,
  );
  assert.equal(calls, 0);
});

test('my operation is scoped by the authenticated user and an absent row remains non-enumerating', async () => {
  const calls: unknown[] = [];
  const service = new MinecraftApprovedOperationService({
    requestOperation: async () => { throw new Error('not used'); },
    myOperation: async (input: { requesterUserId: string; operationId: string }) => {
      calls.push(input);
      return null;
    },
  });

  assert.equal(await service.myOperation(REQUESTER_ID, { operationId: OPERATION_ID }), null);
  assert.deepEqual(calls, [{ requesterUserId: REQUESTER_ID, operationId: OPERATION_ID }]);
});

test('executor generates an opaque lease internally and only receives a fixed DB-owned operation', async () => {
  const calls: unknown[] = [];
  const executor = new MinecraftApprovedOperationExecutor({
    repository: {
      claimNextApprovedOperation: async (input: { leaseToken: string; leaseSeconds: number }) => {
        calls.push(input);
        return {
          operation_id: OPERATION_ID,
          operation: 'status',
          lease_expires_at: '2026-08-26T00:00:30.000Z',
        };
      },
      completeApprovedOperation: async () => { throw new Error('not used'); },
    },
    leaseSeconds: 30,
    randomUuid: () => LEASE_TOKEN,
  });

  assert.deepEqual(await executor.claimNext(), {
    operationId: OPERATION_ID,
    operation: 'status',
    leaseToken: LEASE_TOKEN,
    leaseExpiresAt: '2026-08-26T00:00:30.000Z',
  });
  assert.deepEqual(calls, [{ leaseToken: LEASE_TOKEN, leaseSeconds: 30 }]);
});

test('executor completion accepts only a safe summary and cannot receive a raw host response or arbitrary target', async () => {
  const calls: unknown[] = [];
  const executor = new MinecraftApprovedOperationExecutor({
    repository: {
      claimNextApprovedOperation: async () => null,
      completeApprovedOperation: async (input: {
        operationId: string;
        leaseToken: string;
        outcome: 'succeeded' | 'failed';
        agentRequestId: string | null;
        resultSummary: unknown;
      }) => {
        calls.push(input);
        return { operation_id: OPERATION_ID, state: 'succeeded', replayed: false };
      },
    },
  });

  assert.deepEqual(await executor.complete({
    operationId: OPERATION_ID,
    leaseToken: LEASE_TOKEN,
    outcome: 'succeeded',
    agentRequestId: 'agent-4fd100',
    resultSummary: { accepted: true, state: 'running', responseDigest: 'b'.repeat(64) },
  }), {
    operationId: OPERATION_ID,
    state: 'succeeded',
    replayed: false,
  });
  assert.deepEqual(calls, [{
    operationId: OPERATION_ID,
    leaseToken: LEASE_TOKEN,
    outcome: 'succeeded',
    agentRequestId: 'agent-4fd100',
    resultSummary: { accepted: true, state: 'running', responseDigest: 'b'.repeat(64) },
  }]);

  for (const unsafe of [
    {
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { logs: 'do not persist raw logs' },
    },
    {
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { host: '127.0.0.1' },
    },
    {
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { endpoint: '/v1/minecraft/start' },
    },
    {
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'succeeded',
      resultSummary: { command: 'stop' },
    },
    {
      operationId: OPERATION_ID,
      leaseToken: LEASE_TOKEN,
      outcome: 'replay',
      resultSummary: {},
    },
  ]) {
    await assert.rejects(executor.complete(unsafe), MinecraftApprovedOperationInputError);
  }
  assert.equal(calls.length, 1);
});
