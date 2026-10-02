import test from 'node:test';
import assert from 'node:assert/strict';
import { containsForbiddenControlBytes, isSourcePath } from './check-control-bytes.mjs';

test('detects forbidden raw control bytes but permits tab, newline, and carriage return', () => {
  assert.equal(containsForbiddenControlBytes(Buffer.from([0x61, 0x01, 0x62])), true);
  assert.equal(containsForbiddenControlBytes(Buffer.from([0x61, 0x7f, 0x62])), true);
  assert.equal(containsForbiddenControlBytes(Buffer.from('a\tb\nc\rd')), false);
  assert.equal(containsForbiddenControlBytes(Buffer.from('\\u0001')), false);
});

test('scans only JavaScript and TypeScript source files', () => {
  assert.equal(isSourcePath('backend/src/main.ts'), true);
  assert.equal(isSourcePath('frontend/src/page.tsx'), true);
  assert.equal(isSourcePath('scripts/check.mjs'), true);
  assert.equal(isSourcePath('docs/example.md'), false);
  assert.equal(isSourcePath('node_modules/pkg/file.js'), false);
  assert.equal(isSourcePath('frontend/.next/server/file.js'), false);
});
