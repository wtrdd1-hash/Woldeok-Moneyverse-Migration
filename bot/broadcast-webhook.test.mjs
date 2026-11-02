import assert from 'node:assert/strict';
import { test } from 'node:test';
import http from 'node:http';
import { once } from 'node:events';
import { createBroadcastWebhookHandler } from './broadcast-webhook.js';

const SECRET = 'only-for-isolated-test-a-very-long-random-secret';
async function withServer(options, run) {
  const server = http.createServer(createBroadcastWebhookHandler(options));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    return await run('http://127.0.0.1:' + address.port + '/broadcast');
  } finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}
function post(url, body, secret = SECRET, headers = {}) {
  return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(secret === null ? {} : { 'x-internal-secret': secret }), ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
const valid = { title: 'Economy update', description: 'Verified announcement', fields: [{ name: 'Market', value: 'Open' }] };

test('no configured strong secret never dispatches, even with a supplied header', async () => {
  let sent = 0;
  await withServer({ secret: '', sendChannel: async () => { sent++; return true; } }, async url => {
    const response = await post(url, valid);
    assert.equal(response.status, 503);
    assert.equal(sent, 0);
  });
});
test('missing, wrong, short, or duplicated secret cannot dispatch', async () => {
  let sent = 0;
  await withServer({ secret: SECRET, sendChannel: async () => { sent++; return true; } }, async url => {
    for (const secret of [null, 'wrong', 'a'.repeat(800)]) {
      assert.equal((await post(url, valid, secret)).status, 403);
    }
    assert.equal(sent, 0);
  });
});
test('rejects oversized, invalid JSON, and unbounded Discord embeds before dispatch', async () => {
  let sent = 0;
  await withServer({ secret: SECRET, sendChannel: async () => { sent++; return true; } }, async url => {
    for (const payload of ['{invalid', { ...valid, description: 'x'.repeat(17000) }, { ...valid, fields: Array.from({length: 26}, (_, i) => ({name: 'N' + i, value: 'V'})) }, { ...valid, fields: Array.from({length: 8}, (_, i) => ({name: 'N' + i, value: 'V'.repeat(800)})) }, { ...valid, title: 'Invalid\nTitle' }, { ...valid, color: -1 }]) {
      const response = await post(url, payload);
      assert.ok([400, 413].includes(response.status), String(response.status));
    }
    assert.equal(sent, 0);
  });
});
test('channel unavailable or failed send is 503, never a positive delivery receipt', async () => {
  for (const sendChannel of [async () => false, async () => { throw Error('discord offline'); }]) {
    await withServer({ secret: SECRET, sendChannel }, async url => {
      const response = await post(url, valid);
      assert.equal(response.status, 503);
      assert.equal((await response.json()).ok, false);
    });
  }
});
test('successful authenticated dispatch acknowledges only confirmed channel send, not DM delivery', async () => {
  let sends = 0;
  await withServer({ secret: SECRET, sendChannel: async () => { sends++; return true; }, sendAdminDm: async () => false }, async url => {
    const response = await post(url, { ...valid, notifyAdminDm: true });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.ok, true);
    assert.equal(result.acceptedByDiscord, true);
    assert.equal(result.status, 'Broadcast sent to Discord');
    assert.equal(result.adminDmSent, false);
    assert.equal(sends, 1);
  });
});
test('GET and unrelated paths cannot dispatch', async () => {
  let sends = 0;
  await withServer({ secret: SECRET, sendChannel: async () => { sends++; return true; } }, async url => {
    assert.equal((await fetch(url)).status, 404);
    assert.equal((await post(url.replace('/broadcast', '/other'), valid)).status, 404);
    assert.equal(sends, 0);
  });
});

test('optional admin DM transport failure does not turn a confirmed channel send into a retry', async () => {
  let sends = 0;
  await withServer({ secret: SECRET, sendChannel: async () => { sends++; return true; }, sendAdminDm: async () => { throw Error('DM unavailable'); } }, async url => {
    const response = await post(url, { ...valid, notifyAdminDm: true });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).adminDmSent, false);
    assert.equal(sends, 1);
  });
});
test('non-ASCII content survives request chunk decoding and is accepted only after authentication', async () => {
  let captured;
  await withServer({ secret: SECRET, sendChannel: async payload => { captured = payload; return true; } }, async url => {
    const response = await post(url, { ...valid, title: '경제 알림 🔒' });
    assert.equal(response.status, 200);
    assert.equal(captured.title, '경제 알림 🔒');
  });
});
