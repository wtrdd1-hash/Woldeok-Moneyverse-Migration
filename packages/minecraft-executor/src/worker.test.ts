import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  MinecraftApprovedOperationWorker,
  MinecraftExecutorError,
  summarizeHostAgentResponse,
  type MinecraftHostOperationSummary,
} from './worker';

const OPERATION_ID = '10000000-0000-4000-8000-000000000001';
const LEASE_TOKEN = '20000000-0000-4000-8000-000000000002';
const REQUEST_ID = '30000000-0000-4000-8000-000000000003';

interface Claim {
  readonly operationId: string;
  readonly operation: string;
  readonly leaseToken: string;
}

function claim(operation = 'restart'): Claim {
  return { operationId: OPERATION_ID, operation, leaseToken: LEASE_TOKEN };
}

interface CompleteInput {
  readonly operationId: string;
  readonly leaseToken: string;
  readonly outcome: 'succeeded' | 'failed';
  readonly agentRequestId: string | null;
  readonly resultSummary: MinecraftHostOperationSummary | Record<string, never>;
}

interface WorkerFakeOptions {
  nextClaim?: Claim | null;
  agentResponse?: unknown;
  agentError?: Error;
  completeError?: Error;
}

function worker({ nextClaim = claim(), agentResponse, agentError, completeError }: WorkerFakeOptions = {}) {
  const calls: {
    host: string[];
    complete: CompleteInput[];
    events: Record<string, unknown>[];
  } = { host: [], complete: [], events: [] };
  const executor = {
    async claimNext(): Promise<Claim | null> { return nextClaim; },
    async complete(input: CompleteInput) {
      calls.complete.push(input);
      if (completeError) throw completeError;
      return { operationId: input.operationId, state: input.outcome, replayed: false };
    },
  };
  const hostAgent = {
    async execute(operation: string): Promise<unknown> {
      calls.host.push(operation);
      if (agentError) throw agentError;
      return agentResponse ?? {
        requestId: REQUEST_ID,
        operation,
        result: operation === 'status'
          ? { state: { ActiveState: 'active' } }
          : operation === 'logs'
            ? { logs: 'one\ntwo\n' }
            : { accepted: true },
      };
    },
  };
  return {
    calls,
    instance: new MinecraftApprovedOperationWorker({
      executor,
      hostAgent,
      auditLog: (event: Record<string, unknown>) => { calls.events.push(event); },
      now: () => '2026-08-26T00:00:00.000Z',
    }),
  };
}

test('does nothing when no approved DB lease is available', async () => {
  const subject = worker({ nextClaim: null });
  assert.deepEqual(await subject.instance.runOnce(), { claimed: false });
  assert.deepEqual(subject.calls.host, []);
  assert.deepEqual(subject.calls.complete, []);
});

test('executes only the fixed DB-owned operation and writes a safe mutation receipt', async () => {
  const subject = worker();
  const result = await subject.instance.runOnce();
  assert.deepEqual(result, {
    claimed: true,
    operationId: OPERATION_ID,
    operation: 'restart',
    outcome: 'succeeded',
    state: 'succeeded',
  });
  assert.deepEqual(subject.calls.host, ['restart']);
  assert.equal(subject.calls.complete.length, 1);
  const completeCall = subject.calls.complete[0];
  assert.ok(completeCall);
  const summary = completeCall.resultSummary;
  if (!('responseDigest' in summary) || !('accepted' in summary)) {
    throw new Error('expected an accepted result summary');
  }
  assert.deepEqual(completeCall, {
    operationId: OPERATION_ID,
    leaseToken: LEASE_TOKEN,
    outcome: 'succeeded',
    agentRequestId: REQUEST_ID,
    resultSummary: {
      accepted: true,
      responseDigest: summary.responseDigest,
    },
  });
  assert.match(summary.responseDigest, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(subject.calls.events).includes('http://'), false);
});

test('status and logs responses retain only normalized metadata and a digest', () => {
  const status = summarizeHostAgentResponse('status', {
    requestId: REQUEST_ID,
    operation: 'status',
    result: { service: 'minecraft-server.service', state: { ActiveState: 'activating' } },
  });
  if (!('state' in status.resultSummary)) throw new Error('expected a status result summary');
  assert.deepEqual(status.resultSummary.state, 'starting');
  assert.equal(Object.hasOwn(status.resultSummary, 'service'), false);

  const failedStatus = summarizeHostAgentResponse('status', {
    requestId: REQUEST_ID,
    operation: 'status',
    result: { state: { ActiveState: 'failed' } },
  });
  if (!('state' in failedStatus.resultSummary)) throw new Error('expected a status result summary');
  assert.equal(failedStatus.resultSummary.state, 'unknown');

  const logs = summarizeHostAgentResponse('logs', {
    requestId: REQUEST_ID,
    operation: 'logs',
    result: { logs: 'db_password=must-never-be-stored\nline two\n' },
  });
  if (!('logLineCount' in logs.resultSummary)) throw new Error('expected a logs result summary');
  assert.deepEqual(logs.resultSummary.logLineCount, 2);
  assert.equal(logs.resultSummary.logsTruncated, false);
  assert.equal(JSON.stringify(logs.resultSummary).includes('db_password'), false);
});

test('host-agent failure records only a terminal failed receipt and never logs raw error detail', async () => {
  const subject = worker({ agentError: new Error('token=super-secret host=10.0.0.8') });
  const result = await subject.instance.runOnce();
  if (!result.claimed) throw new Error('expected a claimed result');
  assert.equal(result.outcome, 'failed');
  assert.deepEqual(subject.calls.complete, [{
    operationId: OPERATION_ID,
    leaseToken: LEASE_TOKEN,
    outcome: 'failed',
    agentRequestId: null,
    resultSummary: {},
  }]);
  assert.equal(JSON.stringify(subject.calls.events).includes('super-secret'), false);
  assert.equal(JSON.stringify(subject.calls.events).includes('10.0.0.8'), false);
});

test('malformed claims do not call the host, and completion failures stay opaque and do not retry', async () => {
  const malformed = worker({ nextClaim: claim('exec --unsafe') });
  await assert.rejects(malformed.instance.runOnce(), MinecraftExecutorError);
  assert.deepEqual(malformed.calls.host, []);

  const completion = worker({ completeError: new Error('postgresql://secret@private-db') });
  await assert.rejects(completion.instance.runOnce(), MinecraftExecutorError);
  assert.deepEqual(completion.calls.host, ['restart']);
  assert.equal(JSON.stringify(completion.calls.events).includes('private-db'), false);
});

test('poll loop catches opaque cycle failures and stops after abort', async () => {
  const subject = worker({ nextClaim: claim('exec --unsafe') });
  const controller = new AbortController();
  let sleeps = 0;
  await subject.instance.runUntilStopped({
    pollIntervalMs: 250,
    signal: controller.signal,
    sleep: async () => {
      sleeps += 1;
      controller.abort();
    },
  });
  assert.equal(sleeps, 1);
  assert.ok(subject.calls.events.some(event => event.event === 'minecraft_executor_poll_failed'));
});
