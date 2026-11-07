import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateAppDefaultAcl, readAppDefaultAclSnapshot } from './verify-app-default-acl.mjs';

const identity = Object.freeze({ database: 'woldeok_moneyverse_dev', role: 'moneyverse_app', app_role_exists: true });
const options = Object.freeze({ expectedDatabase: identity.database, expectedRole: identity.role });
const grant = Object.freeze({ owner_role: 'moneyverse_migrator', scope: 'public', grantee: 'moneyverse_app', privilege: 'TRUNCATE' });

function report(rows, actualIdentity = identity) {
  return evaluateAppDefaultAcl({ rows, identity: actualIdentity }, options);
}

test('verified absence of app/PUBLIC table default grants is a narrow pass', () => {
  const result = report([]);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'READY_FOR_OTHER_RELEASE_GATES');
  assert.equal(result.summary.unsafeDefaultTableGrants, 0);
  assert.match(result.caveat, /existing.table grants|existing tables/i);
});

test('migrator default ALL table ACL blocks future app-owned destructive grants', () => {
  for (const privilege of ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN']) {
    const result = report([{ ...grant, privilege }]);
    assert.equal(result.ok, false, privilege);
    assert(result.blockers.some(value => value.includes('unsafe_default_table_acl')), privilege);
  }
});

test('PUBLIC default ACL and global defaults block even outside an explicit public schema row', () => {
  for (const row of [{ ...grant, grantee: 'PUBLIC' }, { ...grant, scope: '<all schemas>' }]) {
    assert.equal(report([row]).ok, false);
  }
});

test('malformed, duplicate, or absent evidence fails closed', () => {
  assert.equal(report(null).ok, false);
  assert.equal(report([{ ...grant, privilege: 'nonsense' }]).ok, false);
  assert.equal(report([{ ...grant, owner_role: '' }]).ok, false);
  assert.equal(report([grant, grant]).ok, false);
  assert.equal(report([{ ...grant, grantee: 'someone_else' }]).ok, false);
});

test('wrong DB, role, or missing app role cannot be certified', () => {
  assert.equal(report([], { ...identity, database: 'other' }).ok, false);
  assert.equal(report([], { ...identity, role: 'postgres' }).ok, false);
  assert.equal(report([], { ...identity, app_role_exists: false }).ok, false);
  assert.equal(report([], null).ok, false);
});

test('catalog snapshot uses a read-only transaction, includes global and public defaults, and rolls back', async () => {
  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('current_database()')) return { rows: [identity] };
    if (sql.includes('pg_catalog.pg_default_acl')) return { rows: [grant] };
    return { rows: [] };
  } };
  assert.deepEqual(await readAppDefaultAclSnapshot(client), { identity, rows: [grant] });
  assert.equal(queries[0], 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(queries.at(-1), 'ROLLBACK');
  assert(queries.some(sql => sql.includes('pg_catalog.pg_default_acl') && sql.includes('aclexplode') && sql.includes('defaclnamespace')));
});

test('catalog failure rolls back and cannot be reported as a clean ACL', async () => {
  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('current_database()')) return { rows: [identity] };
    if (sql.includes('pg_catalog.pg_default_acl')) throw Error('catalog unavailable');
    return { rows: [] };
  } };
  await assert.rejects(() => readAppDefaultAclSnapshot(client), /catalog unavailable/);
  assert.equal(queries.at(-1), 'ROLLBACK');
});
