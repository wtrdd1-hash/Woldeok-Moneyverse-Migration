import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  evaluateFinancialReadiness,
  readFinancialSnapshot,
  PROTECTED_FINANCIAL_TABLES,
  PROTECTED_PRIVATE_TABLES,
  PROTECTED_CORE_TABLES,
} from './verify-financial-readiness.mjs';

const safe = () => ({
  identity: { database: 'isolated_test', role: 'moneyverse_migrator' },
  grants: PROTECTED_CORE_TABLES.map(name => ({
    name, can_select: PROTECTED_FINANCIAL_TABLES.includes(name) || name === 'outbox_events',
    can_insert: false, can_update: false, can_delete: false, can_truncate: false,
  })),
  ledger: {
    balance_rows: 1, unexplained_account_count: 0, unexplained_delta_wld: '0',
    unexplained_without_postings_count: 0, unexplained_without_postings_delta_wld: '0',
    unbalanced_transaction_count: 0, transactions_without_postings: 0,
    unknown_posting_direction_count: 0,
  },
});

const mutate = (name, changes) => {
  const snapshot = safe();
  snapshot.grants = snapshot.grants.map(row => row.name === name ? { ...row, ...changes } : row);
  return snapshot;
};

test('release gate enumerates private identity, audit and owner inventory tables', () => {
  assert.deepEqual(PROTECTED_PRIVATE_TABLES, [
    'audit_logs', 'users', 'identities', 'user_consents', 'user_items', 'shop_catalog',
  ]);
  assert(PROTECTED_CORE_TABLES.includes('outbox_events'));
  assert.equal(evaluateFinancialReadiness(safe()).ok, true);
});

test('direct private table SELECT is a release blocker, not a harmless read', () => {
  for (const name of PROTECTED_PRIVATE_TABLES) {
    const result = evaluateFinancialReadiness(mutate(name, { can_select: true }));
    assert.equal(result.ok, false, name);
    assert(result.blockers.includes('direct_application_private_select:' + name));
  }
  assert.equal(evaluateFinancialReadiness(safe()).ok, true);
});

test('app role TRUNCATE is blocked even when INSERT UPDATE DELETE are denied', () => {
  for (const name of ['account_balances', 'ledger_transactions', 'audit_logs', 'users', 'outbox_events']) {
    const result = evaluateFinancialReadiness(mutate(name, { can_truncate: true }));
    assert.equal(result.ok, false, name);
    assert(result.blockers.includes('direct_application_protected_truncate:' + name));
    assert(result.summary.protectedTablesWithAppTruncate.includes(name));
  }
});

test('private table DML, missing rows and unverified privilege flags fail closed', () => {
  const result = evaluateFinancialReadiness(mutate('user_items', { can_update: true }));
  assert(result.blockers.includes('direct_application_protected_dml:user_items'));
  assert(evaluateFinancialReadiness({ ...safe(), grants: safe().grants.filter(x => x.name !== 'audit_logs') })
    .blockers.includes('missing_protected_table:audit_logs'));
  for (const bad of [undefined, null, 'false', 0]) {
    const broken = mutate('users', { can_truncate: bad });
    assert(evaluateFinancialReadiness(broken).blockers.includes('unverified_protected_grant_flags:users'));
  }
});

test('snapshot checks every protected table for SELECT and TRUNCATE in one read-only transaction', async () => {
  const snapshot = safe();
  const calls = [];
  const client = { async query(sql, params) {
    calls.push({ sql, params });
    if (sql.includes('current_database()')) return { rows: [snapshot.identity] };
    if (sql.includes('has_table_privilege')) return { rows: snapshot.grants };
    if (sql.includes('account_net AS')) return { rows: [snapshot.ledger] };
    return { rows: [] };
  } };
  assert.deepEqual(await readFinancialSnapshot(client), snapshot);
  const grantQuery = calls.find(call => call.sql.includes('has_table_privilege'));
  assert.match(grantQuery.sql, /'SELECT'/);
  assert.match(grantQuery.sql, /'TRUNCATE'/);
  assert.deepEqual(grantQuery.params[0], PROTECTED_CORE_TABLES);
  assert.equal(calls[0].sql, 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
});
