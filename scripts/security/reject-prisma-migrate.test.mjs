import test from 'node:test';
import assert from 'node:assert/strict';
import { containsForbiddenPrismaMigration, isScannablePath } from './reject-prisma-migrate.mjs';

test('detects Prisma schema mutation commands assembled at runtime', () => {
  const forbidden = ['prisma', 'migrate'].join(' ');
  assert.equal(containsForbiddenPrismaMigration('run: ' + forbidden + ' deploy'), true);
  assert.equal(containsForbiddenPrismaMigration('prisma db pull'), false);
});

test('scans code/config but excludes documentation and dependencies', () => {
  assert.equal(isScannablePath('package.json'), true);
  assert.equal(isScannablePath('.github/workflows/ci.yml'), true);
  assert.equal(isScannablePath('backend/src/main.ts'), true);
  assert.equal(isScannablePath('docs/architecture.md'), false);
  assert.equal(isScannablePath('node_modules/x/package.json'), false);
});
