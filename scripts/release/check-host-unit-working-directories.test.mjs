import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectUnit, checkUnits } from './check-host-unit-working-directories.mjs';

test('missing immutable release directory is reported without changing the unit', () => {
  assert.deepEqual(inspectUnit('legacy.service', 'WorkingDirectory=/missing/release/backend\nLoadState=loaded\n', () => false), { unit: 'legacy.service', status: 'MISSING_DIRECTORY', directory: '/missing/release/backend' });
});
test('valid working directory passes', () => {
  assert.equal(inspectUnit('current.service', 'WorkingDirectory=/srv/current/backend\n', () => true).status, 'OK');
});
test('relative or unset working directory fails closed', () => {
  assert.equal(inspectUnit('x.service', 'WorkingDirectory=relative\n').status, 'INVALID_DIRECTORY');
  assert.equal(inspectUnit('x.service', 'LoadState=loaded\n').status, 'INVALID_DIRECTORY');
});
test('permission errors cannot be interpreted as missing or healthy', () => {
  const result = inspectUnit('x.service', 'WorkingDirectory=/restricted\n', () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); });
  assert.equal(result.status, 'UNVERIFIED_DIRECTORY');
});
test('multiple units preserve separate statuses', () => {
  const results = checkUnits(['a.service', 'b.service'], (unit) => `WorkingDirectory=/${unit}\n`, (directory) => directory === '/a.service');
  assert.deepEqual(results.map((item) => item.status), ['OK', 'MISSING_DIRECTORY']);
});

test('unloaded units fail even when a path exists', () => {
  assert.equal(inspectUnit('x.service', 'LoadState=not-found\nWorkingDirectory=/tmp\n', () => true).status, 'UNIT_NOT_LOADED');
});
