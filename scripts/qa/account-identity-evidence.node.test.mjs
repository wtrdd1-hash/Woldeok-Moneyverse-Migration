import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const page = readFileSync('frontend/src/app/account/page.tsx', 'utf8');
test('account uses validated identities', () => { assert.ok(page.includes('parseAccountIdentityEvidence(identityData)')); });
test('account never shows fabricated score', () => { assert.ok(!page.includes('securityScore')); });
test('account includes accessible retry', () => { assert.ok(page.includes('다시 조회하기')); });
