/**
 * Synthetic Next HTTP regression for stock-alert evidence. This does not
 * replace an authenticated official Test run or PostgreSQL owner ACL tests.
 * Run after `pnpm build`.
 */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { createServer as createTcpServer } from 'node:net';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const serverPath = resolve(root, 'frontend/.next/standalone/frontend/server.js');
assert.ok(existsSync(serverPath), 'build the frontend before HTTP E2E');

async function freePort() {
  const server = createTcpServer();
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  await new Promise((done) => server.close(done));
  return address.port;
}

const apiPort = await freePort();
const webPort = await freePort();
let mode = 'invalid';
const mock = createServer((request, response) => {
  let payload;
  if (request.url === '/api/v1/auth/session') payload = { csrfToken: 'synthetic-only' };
  else if (request.url === '/api/v1/stocks') payload = { stocks: [] };
  else if (request.url === '/api/v1/stocks/alerts') payload = mode === 'valid' ? { alerts: [] } : { alerts: {} };
  else if (request.url?.startsWith('/api/v1/stocks/alerts/events')) payload = { events: [] };
  else { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
  response.end(JSON.stringify(payload));
});
await new Promise((done) => mock.listen(apiPort, '127.0.0.1', done));

const child = spawn(process.execPath, [serverPath], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    HOSTNAME: '127.0.0.1',
    PORT: String(webPort),
    API_ORIGIN: `http://127.0.0.1:${apiPort}`,
    APP_BASE_URL: `http://127.0.0.1:${webPort}`,
    INTERNAL_API_TOKEN: randomBytes(32).toString('hex'),
  },
  stdio: 'ignore',
});
try {
  const url = `http://127.0.0.1:${webPort}/stocks/alerts`;
  let response;
  for (let attempt = 0; attempt < 35; attempt += 1) {
    try {
      response = await fetch(url, { cache: 'no-store' });
      break;
    } catch {
      if (child.exitCode !== null) throw new Error('Next server exited before HTTP E2E');
      await delay(400);
    }
  }
  assert.ok(response, 'Next server did not become ready');
  assert.equal(response.status, 200);
  const invalidHtml = await response.text();
  assert.match(invalidHtml, /알림 다시 조회/);
  assert.doesNotMatch(invalidHtml, /알림 만들기/);
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  console.log('Malformed 200: HTTP 200, retry visible, mutation form absent — PASS');

  mode = 'valid';
  const validResponse = await fetch(url, { cache: 'no-store' });
  assert.equal(validResponse.status, 200);
  const validHtml = await validResponse.text();
  assert.match(validHtml, /알림 만들기/);
  assert.doesNotMatch(validHtml, /알림 다시 조회/);
  console.log('Verified empty: HTTP 200, alert form available — PASS');
  console.log('X-Robots-Tag observed (separate release gate):', response.headers.get('x-robots-tag'));
} finally {
  child.kill('SIGTERM');
  await new Promise((done) => mock.close(done));
}
