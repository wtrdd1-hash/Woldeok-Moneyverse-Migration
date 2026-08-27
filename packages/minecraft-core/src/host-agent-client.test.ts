import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  MinecraftHostAgentClient,
  MinecraftHostAgentClientError,
  MinecraftHostAgentConfigurationError,
  parseMinecraftHostAgentEndpoint,
} from './host-agent-client';
import { requestHeader } from './testing/http';

interface RecordedFetchCall {
  url: string;
  init: RequestInit;
}

const TOKEN = 'a'.repeat(48);
const ENDPOINT = 'http://127.0.0.1:18080';

function agentResponse(operation: string | undefined, result: unknown = { accepted: true }, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({
    requestId: '0e02fcb7-7d44-4e4a-a009-d03440de1e43', ok: true, operation, result,
  }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function assertOpaque(error: unknown) {
  assert.ok(error instanceof MinecraftHostAgentClientError);
  assert.equal(error.message, 'Minecraft host agent request failed');
  return true;
}

test('requires an explicit literal loopback HTTP origin with a port', () => {
  assert.equal(parseMinecraftHostAgentEndpoint(ENDPOINT), ENDPOINT);
  for (const unsafe of [
    undefined,
    'https://127.0.0.1:18080',
    'http://localhost:18080',
    'http://127.0.0.1',
    'http://127.0.0.1:18080/v1/minecraft/status',
    'http://127.0.0.1:18080?path=/v1/minecraft/start',
    'http://token@127.0.0.1:18080',
    'http://[::ffff:127.0.0.1]:18080',
    'http://10.0.0.1:18080',
  ]) {
    assert.throws(() => parseMinecraftHostAgentEndpoint(unsafe), MinecraftHostAgentConfigurationError);
  }
  assert.equal(parseMinecraftHostAgentEndpoint('http://[::1]:18080'), 'http://[::1]:18080');
});

test('uses only the fixed host-agent route, method, Bearer header, and no body', async () => {
  const calls: RecordedFetchCall[] = [];
  const client = new MinecraftHostAgentClient({
    endpoint: ENDPOINT,
    token: TOKEN,
    fetchImpl: async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      const operation = url.endsWith('/logs') ? 'logs' : 'status';
      return agentResponse(operation, { service: 'minecraft-server.service' });
    },
  });

  const status = await client.execute('status');
  const logs = await client.execute('logs');
  assert.deepEqual(status, {
    requestId: '0e02fcb7-7d44-4e4a-a009-d03440de1e43', operation: 'status', result: { service: 'minecraft-server.service' },
  });
  assert.equal(logs.operation, 'logs');
  assert.deepEqual(calls.map(({ url, init }) => ({
    url,
    method: init.method,
    authorization: requestHeader(init, 'authorization'),
    accept: requestHeader(init, 'accept'),
    body: init.body,
    redirect: init.redirect,
  })), [
    {
      url: 'http://127.0.0.1:18080/v1/minecraft/status', method: 'GET', authorization: `Bearer ${TOKEN}`,
      accept: 'application/json', body: undefined, redirect: 'error',
    },
    {
      url: 'http://127.0.0.1:18080/v1/minecraft/logs', method: 'GET', authorization: `Bearer ${TOKEN}`,
      accept: 'application/json', body: undefined, redirect: 'error',
    },
  ]);
});

test('maps each mutation to its fixed POST endpoint and rejects arbitrary operations before fetch', async () => {
  const calls: RecordedFetchCall[] = [];
  const client = new MinecraftHostAgentClient({
    endpoint: ENDPOINT,
    token: TOKEN,
    fetchImpl: async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return agentResponse(url.split('/').at(-1));
    },
  });

  for (const operation of ['start', 'stop', 'restart']) await client.execute(operation);
  assert.deepEqual(calls.map(({ url, init }) => [init.method, url]), [
    ['POST', 'http://127.0.0.1:18080/v1/minecraft/start'],
    ['POST', 'http://127.0.0.1:18080/v1/minecraft/stop'],
    ['POST', 'http://127.0.0.1:18080/v1/minecraft/restart'],
  ]);

  await assert.rejects(client.execute('exec?command=stop'), assertOpaque);
  await assert.rejects(client.execute('constructor'), assertOpaque);
  assert.equal(calls.length, 3);
});

test('rejects non-success, non-JSON, malformed, and oversized agent responses without leaking details', async () => {
  const responses = [
    new Response('{"error":"credential=secret"}', { status: 500, headers: { 'content-type': 'application/json' } }),
    new Response('<html>upstream internal detail</html>', { status: 200, headers: { 'content-type': 'text/html' } }),
    new Response('{"ok":true,"operation":"stop"}', { status: 200, headers: { 'content-type': 'application/json' } }),
    new Response('x'.repeat(1025), { status: 200, headers: { 'content-type': 'application/json' } }),
  ];
  const client = new MinecraftHostAgentClient({
    endpoint: ENDPOINT,
    token: TOKEN,
    maxResponseBytes: 1024,
    fetchImpl: async () => responses.shift(),
  });

  for (let index = 0; index < 4; index += 1) {
    await assert.rejects(client.execute('status'), assertOpaque);
  }
});

test('rejects an oversized declared response before reading its body', async () => {
  let bodyRead = false;
  const client = new MinecraftHostAgentClient({
    endpoint: ENDPOINT,
    token: TOKEN,
    maxResponseBytes: 1024,
    fetchImpl: async () => ({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json', 'content-length': '1025' }),
      body: {
        async cancel() {},
        getReader() {
          bodyRead = true;
          throw new Error('body must not be read');
        },
      },
    }),
  });

  await assert.rejects(client.execute('status'), assertOpaque);
  assert.equal(bodyRead, false);
});

test('aborts a slow fetch on the configured timeout and returns only an opaque error', async () => {
  let sawAbort = false;
  const client = new MinecraftHostAgentClient({
    endpoint: ENDPOINT,
    token: TOKEN,
    timeoutMs: 250,
    fetchImpl: async (_url: string, init: RequestInit) => new Promise<Response>((resolve, reject) => {
      assert.ok(init.signal);
      init.signal.addEventListener('abort', () => {
        sawAbort = true;
        reject(new Error('network topology detail must not escape'));
      }, { once: true });
    }),
  });

  await assert.rejects(client.execute('status'), assertOpaque);
  assert.equal(sawAbort, true);
});

test('requires a sufficiently long token and never calls fetch for invalid configuration', () => {
  assert.throws(() => new MinecraftHostAgentClient({ endpoint: ENDPOINT, token: 'too-short' }), MinecraftHostAgentConfigurationError);
});
