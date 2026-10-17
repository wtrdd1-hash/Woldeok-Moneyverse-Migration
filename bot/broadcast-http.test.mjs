import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import { createBroadcastWebhookServer } from './broadcast-http.mjs';

const secret = randomBytes(32).toString('hex');
async function withServer(configuredSecret, fn, deliver = async () => ({ logDelivered: true, adminDmDelivered: true })) {
  const delivered = [];
  const server = createBroadcastWebhookServer({
    secret: configuredSecret,
    deliver: async (payload) => { delivered.push(payload); return deliver(payload); },
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await fn('http://127.0.0.1:' + server.address().port + '/broadcast', delivered); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}
const post = (url, key, body = { title: 'test' }) =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(key ? { 'x-internal-secret': key } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test('missing and invalid credentials cannot deliver; correct secret delivers', async () => {
  await withServer(secret, async (url, delivered) => {
    assert.equal((await post(url)).status, 403);
    assert.equal((await post(url, 'invalid')).status, 403);
    assert.equal(delivered.length, 0);
    const res = await post(url, secret);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).deliveredToBot, true);
    assert.equal(delivered.length, 1);
  });
});
test('missing or weak configuration fails closed', async () => {
  for (const key of ['', 'short']) {
    await withServer(key, async (url, delivered) => {
      assert.equal((await post(url, secret)).status, 503);
      assert.equal(delivered.length, 0);
    });
  }
});
test('invalid JSON, invalid embeds and oversized bodies cannot deliver', async () => {
  await withServer(secret, async (url, delivered) => {
    assert.equal((await post(url, secret, '{')).status, 400);
    assert.equal((await post(url, secret, { title: '' })).status, 400);
    assert.equal((await post(url, secret, { title: 'x', fields: [{ name: 'a', value: '' }] })).status, 400);
    assert.equal((await post(url, secret, { title: 'x'.repeat(70_000) })).status, 413);
    assert.equal(delivered.length, 0);
  });
});
test('only POST /broadcast is permitted', async () => {
  await withServer(secret, async (url, delivered) => {
    assert.equal((await fetch(url)).status, 404);
    assert.equal((await post(url + '/other', secret)).status, 404);
    assert.equal(delivered.length, 0);
  });
});
test('delivery failure does not report success', async () => {
  await withServer(secret, async (url) => {
    const res = await post(url, secret);
    assert.equal(res.status, 502);
    assert.equal((await res.json()).deliveredToBot, false);
  }, async () => false);
});
test('chunked oversized request is rejected before Discord delivery', async () => {
  await withServer(secret, async (url, delivered) => {
    const { request } = await import('node:http');
    const target = new URL(url);
    const status = await new Promise((resolve, reject) => {
      const req = request({ hostname: target.hostname, port: target.port, path: target.pathname,
        method: 'POST', headers: { 'x-internal-secret': secret, 'content-type': 'application/json', 'transfer-encoding': 'chunked' } }, res => {
        res.resume(); res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', reject);
      req.write('x'.repeat(40_000)); req.end('x'.repeat(40_000));
    });
    assert.equal(status, 413);
    assert.equal(delivered.length, 0);
  });
});
test('non-JSON content type is refused before delivery', async () => {
  await withServer(secret, async (url, delivered) => {
    const res = await fetch(url, { method: 'POST',
      headers: { 'x-internal-secret': secret, 'content-type': 'text/plain' },
      body: JSON.stringify({ title: 'must not deliver' }),
    });
    assert.equal(res.status, 415);
    assert.equal(delivered.length, 0);
  });
});
test('boolean callback cannot certify channel or DM delivery', async () => {
  await withServer(secret, async (url) => {
    const res = await post(url, secret, { title: 'uncertified', notifyAdminDm: true });
    assert.equal(res.status, 502);
  }, async () => true);
});
test('admin DM failure is not full success', async () => {
  await withServer(secret, async (url) => {
    const res = await post(url, secret, { title: 'test', notifyAdminDm: true });
    const data = await res.json();
    assert.equal(res.status, 502);
    assert.equal(data.logDelivered, true);
    assert.equal(data.adminDmDelivered, false);
    assert.equal(data.retryMayDuplicate, true);
  }, async () => ({ logDelivered: true, adminDmDelivered: false }));
});
test('channel failure is not success', async () => {
  await withServer(secret, async (url) => {
    const res = await post(url, secret);
    assert.equal(res.status, 502);
    assert.equal((await res.json()).logDelivered, false);
  }, async () => ({ logDelivered: false }));
});
