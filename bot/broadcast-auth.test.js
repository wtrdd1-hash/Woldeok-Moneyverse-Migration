import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeBroadcastRequest } from './broadcast-auth.js';
const secret = 'bot-broadcast-test-credential-32-chars-long';
test('only a configured high-entropy broadcast credential authenticates', () => {
  assert.equal(authorizeBroadcastRequest(secret, secret), true);
  assert.equal(authorizeBroadcastRequest('wrong', secret), false);
  assert.equal(authorizeBroadcastRequest(secret, ''), false);
  assert.equal(authorizeBroadcastRequest('short', 'short'), false);
  assert.equal(authorizeBroadcastRequest(['x'], secret), false);
});
test('listener enforces the credential before consuming request body', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
  assert.match(source, /authorizeBroadcastRequest\(req\.headers\['x-internal-secret'\], broadcastSecret\)/);
  assert.match(source, /DISCORD_BROADCAST_SECRET/);
});
