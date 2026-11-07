import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAppTableMaintenance, readAppTableMaintenanceSnapshot } from './verify-app-table-maintenance.mjs';

const protectedNames = ['account_balances', 'audit_logs', 'ledger_postings', 'ledger_transactions', 'users'];
const safe = () => ({
  identity: { database: 'woldeok_moneyverse_dev', app_role_exists: true, table_count: 5 },
  tables: protectedNames.map(name => ({ schema: 'public', name, can_trigger: false, can_maintain: false })),
});

test('accepts a complete read-only proof as only a narrow prerequisite', () => {
  const result = evaluateAppTableMaintenance(safe(), 'woldeok_moneyverse_dev');
  assert.equal(result.ok, true);
  assert.equal(result.status, 'READY_FOR_OTHER_RELEASE_GATES');
  assert.equal(result.scannedTables, 5);
});

test('blocks either TRIGGER or MAINTAIN effective privilege independently', () => {
  for (const key of ['can_trigger', 'can_maintain']) {
    const data = safe();
    data.tables[0][key] = true;
    const result = evaluateAppTableMaintenance(data, 'woldeok_moneyverse_dev');
    assert.equal(result.ok, false);
    assert.equal(result.unsafeTables, 1);
    assert.ok(result.blockers.includes(`app_can_${key.slice(4)}_public_tables`));
  }
});

test('blocks inherited or PUBLIC privileges represented as effective true', () => {
  const data = safe();
  data.tables[1].can_trigger = true;
  data.tables[1].can_maintain = true;
  const result = evaluateAppTableMaintenance(data, 'woldeok_moneyverse_dev');
  assert.deepEqual(result.unsafeSample, ['public.audit_logs']);
  assert.equal(result.unsafeTriggerTables, 1);
  assert.equal(result.unsafeMaintainTables, 1);
});

test('rejects wrong database, absent role and inconsistent inventory', () => {
  for (const mutate of [
    d => { d.identity.database = 'postgres'; },
    d => { d.identity.app_role_exists = false; },
    d => { d.identity.table_count = 4; },
    d => { d.identity.table_count = '5'; },
    d => { d.tables.pop(); },
    d => { d.identity = null; },
  ]) { const data = safe(); mutate(data); assert.equal(evaluateAppTableMaintenance(data, 'woldeok_moneyverse_dev').ok, false); }
});

test('rejects malformed, duplicate, missing essential and unverified privileges', () => {
  for (const mutate of [
    d => { d.tables[0].can_trigger = null; },
    d => { d.tables[0].can_maintain = undefined; },
    d => { d.tables[0].schema = 'other'; },
    d => { d.tables[0].name = ''; },
    d => { d.tables[0] = d.tables[1]; },
    d => { d.tables[0].name = 'arbitrary'; },
    d => { d.tables = null; },
  ]) { const data = safe(); mutate(data); assert.equal(evaluateAppTableMaintenance(data, 'woldeok_moneyverse_dev').ok, false); }
});

test('requires explicit expected DB identity', () => {
  assert.equal(evaluateAppTableMaintenance(safe(), '').ok, false);
  assert.equal(evaluateAppTableMaintenance(safe(), undefined).ok, false);
});

test('reads one repeatable-read, read-only transaction and always rolls back', async () => {
  const queries = [];
  const client = { async query(sql, args) {
    queries.push({ sql, args });
    if (sql.includes('current_database()')) return { rows: [safe().identity] };
    if (sql.includes('has_table_privilege')) return { rows: safe().tables };
    return { rows: [] };
  } };
  const data = await readAppTableMaintenanceSnapshot(client);
  assert.equal(evaluateAppTableMaintenance(data, 'woldeok_moneyverse_dev').ok, true);
  assert.match(queries[0].sql, /BEGIN.*REPEATABLE READ.*READ ONLY/);
  assert.ok(queries.some(x => x.sql.includes("'TRIGGER'") && x.sql.includes("'MAINTAIN'") && x.args?.[0] === 'moneyverse_app'));
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});

test('query errors roll back and never produce a green result', async () => {
  const queries = [];
  const client = { async query(sql) { queries.push(sql); if (sql.includes('current_database()')) throw Error('db unavailable'); return { rows: [] }; } };
  await assert.rejects(readAppTableMaintenanceSnapshot(client), /db unavailable/);
  assert.equal(queries.at(-1), 'ROLLBACK');
});
