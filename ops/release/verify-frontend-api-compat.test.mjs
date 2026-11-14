import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { promisify } from 'node:util';
import { test } from 'node:test';
const exec = promisify(execFile);
const script = new URL('./verify-frontend-api-compat.sh', import.meta.url).pathname;
const token = 'synthetic-test-only-token';
async function run(origin, hasToken = true) {
  try {
    const r = await exec('bash', [script, origin], { env: { ...process.env, INTERNAL_API_TOKEN: hasToken ? token : '' }, timeout: 10000 });
    return { code: 0, output: r.stdout + r.stderr };
  } catch (e) { return { code: e.code, output: (e.stdout ?? '') + (e.stderr ?? '') }; }
}
async function withServer(routes, fn) {
  const server = createServer((req, res) => res.writeHead(req.headers['x-internal-token'] === token ? (routes[req.url] ?? 404) : 403).end());
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('compatible backend passes required route contract', async () => {
  await withServer({ '/api/v1/auth/policy': 200, '/api/v1/auth/session': 401, '/api/v1/admin/security': 401, '/api/v1/stocks': 200 }, async origin => {
    const r = await run(origin); assert.equal(r.code, 0, r.output); assert.doesNotMatch(r.output, new RegExp(token));
  });
});
test('partially migrated Spring backend fails safely', async () => {
  await withServer({}, async origin => { const r = await run(origin); assert.equal(r.code, 1, r.output); assert.match(r.output, /expected 200, received 404/); });
});
test('rejects adversarial URL before forwarding internal token', async () => {
  for (const url of ['http://evil.example:9999', 'http://127.0.0.1:4500@evil.example', 'http://127.0.0.1:4500/path']) {
    const r = await run(url); assert.equal(r.code, 2, `${url}: ${r.output}`); assert.doesNotMatch(r.output, new RegExp(token));
  }
});
test('rejects absent internal token', async () => { const r = await run('http://127.0.0.1:4500', false); assert.equal(r.code, 2, r.output); });
