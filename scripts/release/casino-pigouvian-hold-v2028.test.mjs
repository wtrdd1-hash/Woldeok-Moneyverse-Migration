import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const migration = fileURLToPath(new URL('../../packages/database/migrations/347-casino-pigouvian-unbacked-trigger-hold.sql', import.meta.url));
const sql = existsSync(migration) ? readFileSync(migration, 'utf8') : '';

test('forward migration 347 removes unsafe casino welfare tax trigger before further bets', () => {
  assert.match(sql, /\bBEGIN\s*;/i);
  assert.match(sql, /DROP TRIGGER IF EXISTS trg_casino_dice_pigouvian_tax ON public\.virtual_casino_dice_plays\s*;/i);
  assert.match(sql, /\bCOMMIT\s*;/i);
  assert.doesNotMatch(sql, /\bINSERT\s+INTO\s+public\.system_treasury_ledger|\bUPDATE\s+public\.system_treasury_vaults/i);
});

test('forward migration 347 revokes SECURITY DEFINER execution from PUBLIC and app', () => {
  assert.match(sql, /REVOKE\s+(?:ALL(?: PRIVILEGES)?|EXECUTE)\s+ON\s+FUNCTION\s+public\.trigger_casino_pigouvian_welfare_tax\(\)\s+FROM\s+PUBLIC\s*,\s*moneyverse_app\s*;/i);
  assert.doesNotMatch(sql, /GRANT\s+EXECUTE.*(?:PUBLIC|moneyverse_app)/i);
});
