import assert from 'node:assert/strict';
import test from 'node:test';
import { BACKEND_API_EXPECTATIONS } from './http-guard-policy.mjs';

test('published announcement and gallery reads remain publicly discoverable', () => {
  const byPath = new Map(BACKEND_API_EXPECTATIONS.map((item) => [item.path, item]));
  for (const path of ['/api/v1/announcements', '/api/v1/photos']) {
    assert.equal(byPath.get(path)?.expectedStatus, 200, path);
    assert.equal(byPath.get(path)?.kind, 'published-public-read', path);
  }
});

test('member-specific gallery read and central bank policy keep auth barriers', () => {
  const byPath = new Map(BACKEND_API_EXPECTATIONS.map((item) => [item.path, item]));
  assert.equal(byPath.get('/api/v1/photos/mine')?.expectedStatus, 401);
  assert.equal(byPath.get('/api/v1/central-bank/base-rate')?.expectedStatus, 401);
});

test('every selected API has an explicit expected status and no duplicate route', () => {
  const names = new Set();
  for (const item of BACKEND_API_EXPECTATIONS) {
    assert.ok(item.path.startsWith('/'));
    assert.ok([200, 401].includes(item.expectedStatus));
    assert.ok(item.kind);
    assert.equal(names.has(item.path), false, 'duplicate route: ' + item.path);
    names.add(item.path);
  }
});
