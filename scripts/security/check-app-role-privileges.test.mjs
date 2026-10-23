import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessPrivileges, assertDisposableCiDatabase } from './check-app-role-privileges.mjs';

const protectedTables = ['account_balances', 'accounts', 'audit_logs', 'daily_rewards', 'identities', 'ledger_postings', 'ledger_transactions', 'outbox_events', 'user_consents', 'users'];
const safeRows = protectedTables.map((name) => `${name}|f|f|f`).join('\n');

test('accepts a complete read-only app role boundary', () => {
  assert.deepEqual(assessPrivileges(safeRows), []);
});

test('fails closed when a protected balance can be updated or an audit row deleted', () => {
  const compromised = safeRows.replace('account_balances|f|f|f', 'account_balances|f|t|f').replace('audit_logs|f|f|f', 'audit_logs|f|f|t');
  assert.deepEqual(assessPrivileges(compromised), ['account_balances:UPDATE', 'audit_logs:DELETE']);
});

test('fails closed on missing or malformed table evidence', () => {
  assert.throws(() => assessPrivileges(safeRows.replace('users|f|f|f', '')), /missing|incomplete/i);
  assert.throws(() => assessPrivileges(safeRows.replace('accounts|f|f|f', 'accounts|f|x|f')), /invalid/i);
  assert.throws(() => assessPrivileges(`${safeRows}\naccounts|f|f|f`), /duplicate/i);
});

test('only permits a disposable localhost GitHub Actions database', () => {
  // Assemble synthetic test credentials rather than committing a credential URL.
  const valid = new URL('postgresql://localhost:5432/woldeok_moneyverse_dev');
  valid.username = 'moneyverse_migrator';
  valid.password = 'test_only';
  assert.equal(assertDisposableCiDatabase(valid.href, { CI: 'true', GITHUB_ACTIONS: 'true' }).hostname, 'localhost');
  for (const change of [
    (url) => { url.hostname = 'production.example'; },
    (url) => { url.username = 'moneyverse_app'; },
    (url) => { url.pathname = '/moneyverse_production'; },
  ]) {
    const invalid = new URL(valid);
    change(invalid);
    assert.throws(() => assertDisposableCiDatabase(invalid.href, { CI: 'true', GITHUB_ACTIONS: 'true' }), /disposable/i);
  }
  assert.throws(() => assertDisposableCiDatabase(valid.href, { CI: 'false', GITHUB_ACTIONS: 'false' }), /disposable/i);
});
