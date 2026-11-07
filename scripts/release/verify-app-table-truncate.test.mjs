import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAppTableTruncate, readAppTableTruncateSnapshot } from './verify-app-table-truncate.mjs';

const names = ['account_balances', 'audit_logs', 'ledger_postings', 'ledger_transactions', 'users'];
const baseline = () => ({
  identity: { database: 'woldeok_moneyverse_dev', app_role_exists: true, table_count: 5 },
  tables: names.map(name => ({ schema: 'public', name, can_truncate: false })),
});

test('allows complete, non-truncatable public table inventory only as a narrow release prerequisite', () => {
  const result = evaluateAppTableTruncate(baseline(), 'woldeok_moneyverse_dev');
  assert.equal(result.ok, true);
  assert.equal(result.status, 'READY_FOR_OTHER_RELEASE_GATES');
  assert.equal(result.scannedTables, 5);
});

test('blocks effective direct TRUNCATE even if other DML is separately accepted', () => {
  const snapshot = baseline();
  snapshot.tables[4].can_truncate = true;
  const result = evaluateAppTableTruncate(snapshot, 'woldeok_moneyverse_dev');
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('app_can_truncate_public_tables'));
  assert.equal(result.unsafeTables, 1);
  assert.deepEqual(result.unsafeSample, ['public.users']);
});

test('rejects wrong database, missing app role, invalid identity and unverified table count', () => {
  for (const mutation of [
    x => { x.identity.database = 'postgres'; },
    x => { x.identity.app_role_exists = false; },
    x => { x.identity = null; },
    x => { x.identity.table_count = '5'; },
    x => { x.identity.table_count = 4; },
  ]) {
    const x = baseline(); mutation(x);
    assert.equal(evaluateAppTableTruncate(x, 'woldeok_moneyverse_dev').ok, false);
  }
});

test('rejects incomplete, duplicate, unexpected-schema and malformed evidence', () => {
  for (const mutation of [
    x => { x.tables.pop(); },
    x => { x.tables[1] = x.tables[0]; },
    x => { x.tables[0].schema = 'other'; },
    x => { x.tables[0].can_truncate = null; },
    x => { x.tables = null; },
    x => { x.tables[0].name = ''; },
  ]) {
    const x = baseline(); mutation(x);
    assert.equal(evaluateAppTableTruncate(x, 'woldeok_moneyverse_dev').ok, false);
  }
});

test('requires essential financial, identity and audit tables even if inventory count agrees', () => {
  const x = baseline(); x.tables[0].name = 'arbitrary_table';
  const result = evaluateAppTableTruncate(x, 'woldeok_moneyverse_dev');
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('missing_protected_table:account_balances'));
});

test('requires a nonempty explicit expected database, never trusts default input', () => {
  assert.equal(evaluateAppTableTruncate(baseline(), '').ok, false);
  assert.equal(evaluateAppTableTruncate(baseline(), undefined).ok, false);
});

test('reads a consistent read-only snapshot and always rolls back', async () => {
  const queries = [];
  const client = { async query(sql, args) {
    queries.push({ sql, args });
    if (sql.includes('current_database()')) return { rows: [baseline().identity] };
    if (sql.includes('has_table_privilege')) return { rows: baseline().tables };
    return { rows: [] };
  } };
  const result = await readAppTableTruncateSnapshot(client);
  assert.equal(evaluateAppTableTruncate(result, 'woldeok_moneyverse_dev').ok, true);
  assert.match(queries[0].sql, /BEGIN.*REPEATABLE READ.*READ ONLY/);
  assert.ok(queries.some(x => x.sql.includes('has_table_privilege') && x.args?.[0] === 'moneyverse_app'));
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});

test('query failure rolls back rather than reporting safe grants', async () => {
  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('current_database()')) throw new Error('db unavailable');
    return { rows: [] };
  } };
  await assert.rejects(readAppTableTruncateSnapshot(client), /db unavailable/);
  assert.equal(queries.at(-1), 'ROLLBACK');
});
