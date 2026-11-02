import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAppRoleBoundary, readAppRoleBoundarySnapshot } from './verify-app-role-boundary.mjs';

const db = 'mv_b_v765_isolated';
const safe = () => ({
  identity: {
    database: db, app_role_exists: true, public_schema_exists: true,
    role_superuser: false, role_createdb: false, role_createrole: false,
    role_replication: false, role_bypassrls: false, role_inherit: false,
    role_login: true, can_create_database: false, can_create_public_schema: false,
    can_use_public_schema: true,
  },
  memberships: [],
});

test('accepts restricted login role with public USAGE and normal TEMP allowance', () => {
  const result = evaluateAppRoleBoundary(safe(), db);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'READY_FOR_OTHER_RELEASE_GATES');
  assert.equal(result.membershipsChecked, 0);
});

test('blocks every privileged role attribute independently', () => {
  for (const key of ['role_superuser', 'role_createdb', 'role_createrole', 'role_replication', 'role_bypassrls', 'role_inherit']) {
    const snapshot = safe(); snapshot.identity[key] = true;
    const result = evaluateAppRoleBoundary(snapshot, db);
    assert.equal(result.ok, false, key);
    assert.ok(result.blockers.includes(`unsafe_${key}`), key);
  }
});

test('blocks database and public schema CREATE even without privileged role flags', () => {
  for (const key of ['can_create_database', 'can_create_public_schema']) {
    const snapshot = safe(); snapshot.identity[key] = true;
    assert.ok(evaluateAppRoleBoundary(snapshot, db).blockers.includes(`unsafe_${key}`));
  }
});

test('rejects membership even with NOINHERIT because SET ROLE can escalate', () => {
  const snapshot = safe(); snapshot.memberships = [{ role: 'pg_write_all_data' }];
  const result = evaluateAppRoleBoundary(snapshot, db);
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('unexpected_role_membership'));
  assert.deepEqual(result.membershipSample, ['pg_write_all_data']);
});

test('rejects wrong database, missing role or missing schema', () => {
  for (const mutate of [
    d => { d.identity.database = 'postgres'; },
    d => { d.identity.app_role_exists = false; },
    d => { d.identity.public_schema_exists = false; },
    d => { d.identity.can_use_public_schema = false; },
    d => { d.identity.role_login = false; },
    d => { d.identity = null; },
  ]) { const s = safe(); mutate(s); assert.equal(evaluateAppRoleBoundary(s, db).ok, false); }
});

test('fails closed on absent or malformed privilege evidence', () => {
  for (const mutate of [
    d => { d.identity.role_superuser = null; },
    d => { delete d.identity.role_inherit; },
    d => { d.identity.can_create_database = 'false'; },
    d => { d.identity.can_create_public_schema = undefined; },
    d => { d.memberships = null; },
    d => { d.memberships = [{ role: '' }]; },
    d => { d.memberships = [{ role: 'pg_read_all_data' }, { role: 'pg_read_all_data' }]; },
  ]) { const s = safe(); mutate(s); assert.equal(evaluateAppRoleBoundary(s, db).ok, false); }
});

test('requires an explicit expected database', () => {
  assert.equal(evaluateAppRoleBoundary(safe(), '').ok, false);
  assert.equal(evaluateAppRoleBoundary(safe(), undefined).ok, false);
});

test('reads role and membership in one repeatable-read read-only transaction', async () => {
  const queries = [];
  const client = { async query(sql, args) {
    queries.push({ sql, args });
    if (sql.includes('current_database()')) return { rows: [safe().identity] };
    if (sql.includes('pg_auth_members')) return { rows: [] };
    return { rows: [] };
  } };
  const snapshot = await readAppRoleBoundarySnapshot(client);
  assert.equal(evaluateAppRoleBoundary(snapshot, db).ok, true);
  assert.match(queries[0].sql, /BEGIN.*REPEATABLE READ.*READ ONLY/);
  assert.ok(queries.some(q => q.sql.includes('has_schema_privilege') && q.sql.includes('has_database_privilege')));
  assert.ok(queries.some(q => q.sql.includes('pg_auth_members')));
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});

test('query failure always rolls back and never becomes success', async () => {
  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('current_database()')) throw Error('catalog unavailable');
    return { rows: [] };
  } };
  await assert.rejects(readAppRoleBoundarySnapshot(client), /catalog unavailable/);
  assert.equal(queries.at(-1), 'ROLLBACK');
});
