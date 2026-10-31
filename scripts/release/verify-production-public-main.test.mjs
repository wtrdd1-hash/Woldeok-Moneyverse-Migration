import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyProductionPublicMain } from './verify-production-public-main.mjs';

const mainSha = 'a'.repeat(40);
const unmergedSha = 'b'.repeat(40);
const healthy = () => ({
  mainSha,
  backend: { status: 200, id: mainSha },
  frontend: { status: 200, id: mainSha },
});

test('accepts only two valid public Production identities equal to independent GitHub main', () => {
  assert.deepEqual(verifyProductionPublicMain(healthy()), {
    ok: true, mainSha, backendSha: mainSha, frontendSha: mainSha, failures: [],
  });
});

test('rejects self-consistent but unmerged Production SHA (QA v1410 incident)', () => {
  const state = healthy();
  state.backend.id = unmergedSha;
  state.frontend.id = unmergedSha;
  const verdict = verifyProductionPublicMain(state);
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.failures, ['backend_not_main', 'frontend_not_main']);
});

test('rejects a frontend different from both main and backend', () => {
  const state = healthy();
  state.frontend.id = unmergedSha;
  assert.deepEqual(verifyProductionPublicMain(state).failures, ['frontend_not_main', 'public_versions_disagree']);
});

test('fails closed on absent, malformed or invalid main and version proofs', () => {
  for (const invalid of [null, undefined, 'unknown', 'A'.repeat(40), '1'.repeat(39)]) {
    const state = healthy();
    state.mainSha = invalid;
    assert.ok(verifyProductionPublicMain(state).failures.includes('invalid_main_sha'));
    state.mainSha = mainSha;
    state.backend.id = invalid;
    assert.ok(verifyProductionPublicMain(state).failures.includes('invalid_backend_sha'));
    state.backend.id = mainSha;
    state.frontend.id = invalid;
    assert.ok(verifyProductionPublicMain(state).failures.includes('invalid_frontend_sha'));
  }
});

test('fails closed when either public endpoint returns non-200 or missing response', () => {
  for (const [key, code] of [['backend', 'backend_http_unverified'], ['frontend', 'frontend_http_unverified']]) {
    const state = healthy();
    state[key].status = 503;
    assert.ok(verifyProductionPublicMain(state).failures.includes(code));
    state[key] = null;
    assert.ok(verifyProductionPublicMain(state).failures.includes(code));
  }
});

test('treats non-string JSON version ids as invalid without throwing or coercion', () => {
  for (const value of [42, [], {}, { toString: null }, true]) {
    const state = healthy();
    state.backend.id = value;
    const verdict = verifyProductionPublicMain(state);
    assert.equal(verdict.ok, false);
    assert.ok(verdict.failures.includes('invalid_backend_sha'));
  }
});

test('does not echo malformed public payloads into CI logs', () => {
  const state = healthy();
  state.backend.id = { secret: 'must-not-leak' };
  state.frontend.id = 'unexpected-private-payload';
  const verdict = verifyProductionPublicMain(state);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.backendSha, null);
  assert.equal(verdict.frontendSha, null);
  assert.equal(JSON.stringify(verdict).includes('must-not-leak'), false);
  assert.equal(JSON.stringify(verdict).includes('unexpected-private-payload'), false);
});
