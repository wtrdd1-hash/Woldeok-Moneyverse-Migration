import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sqlPath = new URL('../../packages/database/migrations/307-audit-log-app-acl-lockdown.sql', import.meta.url);

test('forward-only migration 307 revokes all direct audit table privileges', () => {
  const sql = readFileSync(sqlPath, 'utf8');
  assert.match(sql, /\bBEGIN\s*;/i);
  assert.match(sql, /\bREVOKE\s+ALL\s+PRIVILEGES\s+ON\s+TABLE\s+public\.audit_logs\s+FROM\s+PUBLIC\s*,\s*moneyverse_app\s*;/i);
  assert.match(sql, /\bCOMMIT\s*;/i);
});

test('audit ACL repair cannot mutate financial or audit data, alter existing migration or regrant app table rights', () => {
  const sql = readFileSync(sqlPath, 'utf8').replace(/^\s*--.*$/gm, '');
  assert.doesNotMatch(sql, /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP|ALTER\s+TABLE|GRANT\s+(?:ALL|SELECT|INSERT|UPDATE|DELETE))\b/i);
  assert.doesNotMatch(sql, /\b(?:account_balances|ledger_transactions|ledger_postings|users|user_roles)\b/i);
});
