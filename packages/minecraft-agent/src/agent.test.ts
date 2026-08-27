import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'vitest';
import { loadConfig, type MinecraftAgentConfig } from './config';
import { createRequestHandler, type AgentRequest, type AgentResponse, type RequestHandler } from './http';
import { buildOperationInvocation, createProcessRunner, MinecraftOperations } from './operations';

const token = 'a'.repeat(48);

function config(overrides: Partial<MinecraftAgentConfig> = {}): MinecraftAgentConfig {
  return {
    host: '127.0.0.1',
    port: 0,
    token,
    service: 'minecraft-server.service',
    allowedServices: ['minecraft-server.service'],
    maxBodyBytes: 1024,
    rateLimitMax: 10,
    rateLimitWindowMs: 60000,
    mutationCooldownMs: 0,
    commandTimeoutMs: 20000,
    logTimeoutMs: 10000,
    logLines: 200,
    ...overrides
  };
}

class FakeAgentRequest extends EventEmitter implements AgentRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress?: string };

  constructor({ method, url, headers }: { method?: string; url?: string; headers: Record<string, string | string[] | undefined> }) {
    super();
    if (method !== undefined) this.method = method;
    if (url !== undefined) this.url = url;
    this.headers = headers;
    this.socket = { remoteAddress: '127.0.0.1' };
  }
}

interface InvokeResult {
  statusCode: number | undefined;
  headers: Record<string, string> | undefined;
  body: unknown;
}

async function invoke(handler: RequestHandler, { method = 'GET', url, headers = {} }: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
}): Promise<InvokeResult> {
  const request = new FakeAgentRequest({ method, url, headers });

  let statusCode: number | undefined;
  let responseHeaders: Record<string, string> | undefined;
  let body: string | undefined;
  const response: AgentResponse = {
    writeHead(status, responseHeaderValues) {
      statusCode = status;
      responseHeaders = responseHeaderValues;
    },
    end(value) {
      body = value;
    }
  };
  await handler(request, response);
  return { statusCode, headers: responseHeaders, body: body === undefined ? undefined : JSON.parse(body) };
}

function fakeOperations() {
  const calls: string[] = [];
  return {
    calls,
    async execute(operation: string) {
      calls.push(operation);
      return { service: 'minecraft-server.service', accepted: true };
    }
  };
}

test('rejects unauthenticated control requests before executing an operation', async () => {
  const operations = fakeOperations();
  const handler = createRequestHandler({ config: config(), operations, auditLog: () => {} });
  const response = await invoke(handler, { url: '/v1/minecraft/status' });
  assert.equal(response.statusCode, 401);
  assert.equal((response.body as { error: { code: string } }).error.code, 'unauthorized');
  assert.deepEqual(operations.calls, []);
});

test('permits only the fixed method and operation endpoints', async () => {
  const operations = fakeOperations();
  const handler = createRequestHandler({ config: config(), operations, auditLog: () => {} });
  const headers = { authorization: `Bearer ${token}` };
  const denied = await invoke(handler, { url: '/v1/minecraft/start', headers });
  assert.equal(denied.statusCode, 405);

  const accepted = await invoke(handler, { method: 'POST', url: '/v1/minecraft/start', headers });
  assert.equal(accepted.statusCode, 200);
  const acceptedBody = accepted.body as { ok: boolean; operation: string };
  assert.equal(acceptedBody.ok, true);
  assert.equal(acceptedBody.operation, 'start');

  const arbitrary = await invoke(handler, { method: 'POST', url: '/v1/minecraft/command', headers });
  assert.equal(arbitrary.statusCode, 404);
  assert.deepEqual(operations.calls, ['start']);
});

test('rejects request bodies and applies a local rate limit', async () => {
  const operations = fakeOperations();
  const handler = createRequestHandler({ config: config({ rateLimitMax: 1 }), operations, auditLog: () => {} });
  const headers = { authorization: `Bearer ${token}` };
  const bodyResponse = await invoke(handler, {
    method: 'POST', url: '/v1/minecraft/stop', headers: { ...headers, 'content-length': '2' }
  });
  assert.equal(bodyResponse.statusCode, 400);
  assert.deepEqual(operations.calls, []);

  const first = await invoke(handler, { url: '/v1/minecraft/status', headers });
  assert.equal(first.statusCode, 200);
  const second = await invoke(handler, { url: '/v1/minecraft/logs', headers });
  assert.equal(second.statusCode, 429);
  assert.deepEqual(operations.calls, ['status']);
});

test('configuration rejects non-loopback hosts and services outside the allowlist', () => {
  const env = {
    MINECRAFT_AGENT_TOKEN: token,
    MINECRAFT_SYSTEMD_SERVICE: 'minecraft-server.service',
    MINECRAFT_ALLOWED_SYSTEMD_SERVICES: 'minecraft-server.service'
  };
  assert.throws(() => loadConfig({ ...env, MINECRAFT_AGENT_HOST: '0.0.0.0' }), /loopback/i);
  assert.throws(() => loadConfig({
    ...env,
    MINECRAFT_SYSTEMD_SERVICE: 'other.service'
  }), /ALLOWED_SYSTEMD_SERVICES/);
});

test('host commands are fixed argv calls with no shell and unsupported operations fail', async () => {
  const calls: Array<{ file: string; args: readonly string[] }> = [];
  const runner = {
    async run(invocation: { file: string; args: readonly string[] }) {
      calls.push(invocation);
      return { exitCode: 0, signal: null, timedOut: false, overflow: false, stdout: 'ActiveState=active', stderr: '' };
    }
  };
  const operations = new MinecraftOperations(config(), { runner });
  const result = await operations.execute('status');
  if (!('state' in result)) throw new Error('expected a status result with state');
  assert.equal(result.state.ActiveState, 'active');
  const firstCall = calls[0];
  assert.ok(firstCall);
  assert.equal(firstCall.file, '/usr/bin/sudo');
  assert.deepEqual(firstCall.args.slice(0, 4), [
    '--non-interactive', '/usr/bin/systemctl', 'show', '--no-pager'
  ]);
  assert.throws(() => buildOperationInvocation(config(), 'anything'), /Unsupported Minecraft operation/);
});

class FakeChildProcess extends EventEmitter {
  readonly stdout = new EventEmitter();
  readonly stderr = new EventEmitter();
  killed = false;

  kill(): boolean {
    this.killed = true;
    return true;
  }
}

test('process runner uses shell:false and handles a synchronous spawn failure', async () => {
  let spawnOptions: { shell: false; windowsHide: true; stdio: readonly ['ignore', 'pipe', 'pipe'] } | undefined;
  const child = new FakeChildProcess();
  const runner = createProcessRunner({
    spawnImpl(_file, _args, options) {
      spawnOptions = options;
      queueMicrotask(() => child.emit('close', 0, null));
      return child;
    }
  });
  const result = await runner.run({ file: '/usr/bin/sudo', args: ['--non-interactive'], timeoutMs: 1000 });
  assert.equal(result.exitCode, 0);
  assert.equal(spawnOptions?.shell, false);

  const failingRunner = createProcessRunner({ spawnImpl: () => { throw new Error('spawn denied'); } });
  await assert.rejects(
    failingRunner.run({ file: '/usr/bin/sudo', args: [], timeoutMs: 1000 }),
    /spawn denied/
  );
});
