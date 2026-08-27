import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';

// This is a `new URL()` path argument, not a module import specifier: the
// build now emits this file to `dist/minecraft-executor/test/`, two levels
// deeper than the pre-conversion `minecraft-executor/test/` (see the tsconfig
// comment for why `rootDir` is the repository root). The two extra `../`
// keep this fixture path pointing at the same repository-root
// migrations directory, which this rewrite moved to packages/database — a
// tsc does not copy into any `dist/`, so it is read from its source location.
const migrationPath = new URL('../../database/migrations/017-minecraft-executor-role.sql', import.meta.url);
const reconciliationPath = new URL('../../database/migrations/020-minecraft-executor-privilege-reconciliation.sql', import.meta.url);

test('migration provisions a fail-closed NOLOGIN executor role and grants only the two executor functions', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  assert.match(sql, /CREATE ROLE moneyverse_minecraft_executor\s+NOLOGIN\s+NOSUPERUSER\s+NOCREATEDB\s+NOCREATEROLE\s+NOINHERIT\s+NOREPLICATION\s+NOBYPASSRLS/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\.minecraft_approved_operations,[\s\S]*moneyverse_app,[\s\S]*moneyverse_minecraft_executor/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON FUNCTION public\.minecraft_claim_next_approved_operation\(uuid, integer\)[\s\S]*moneyverse_app,[\s\S]*moneyverse_minecraft_executor/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.minecraft_claim_next_approved_operation\(uuid, integer\)\s+TO moneyverse_minecraft_executor/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.minecraft_complete_approved_operation\(uuid, uuid, text, text, jsonb\)\s+TO moneyverse_minecraft_executor/i);
  assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.minecraft_(?:claim_next_approved_operation|complete_approved_operation)[\s\S]*TO moneyverse_app/i);
});

test('020 removes inherited PUBLIC executor capabilities, rejects unsafe memberships, and reasserts only claim/complete', async () => {
  const sql = await readFile(reconciliationPath, 'utf8');
  assert.match(sql, /minecraft executor group must not be a member of another role/i);
  assert.match(sql, /minecraft executor group has an unsafe member role/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public\s+FROM moneyverse_minecraft_executor/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON FUNCTION public\.economy_claim_daily\(uuid, uuid, date, bigint\)[\s\S]*moneyverse_minecraft_executor/i);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC/i);
  assert.match(sql, /unexpected_function_count <> 0/i);
  assert.match(sql, /a required web application function lacks an explicit execute grant/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.digest\(text, text\)\s+TO moneyverse_migrator/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.gen_random_uuid\(\)\s+TO moneyverse_migrator/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.minecraft_claim_next_approved_operation\(uuid, integer\)\s+TO moneyverse_minecraft_executor/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.minecraft_complete_approved_operation\(uuid, uuid, text, text, jsonb\)\s+TO moneyverse_minecraft_executor/i);
});
