import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const migration = new URL('../../packages/database/migrations/273-stock-league-ledger-entry.sql', import.meta.url);
const backend = new URL('../../backend/src/stock/stock-league.repository.ts', import.meta.url);

test('stock league entry fee uses canonical balanced immutable ledger with scoped SECURITY DEFINER', async () => {
 const sql = await readFile(migration, 'utf8');
 assert.match(sql, /CREATE OR REPLACE FUNCTION public\.stock_league_settle_entry_fee/);
 assert.match(sql, /SECURITY DEFINER/);
 assert.match(sql, /economy_post_transaction\s*\(/);
 assert.match(sql, /account_type='ESCROW'/);
 assert.match(sql, /REVOKE ALL ON FUNCTION public\.stock_league_settle_entry_fee\(uuid, uuid\) FROM PUBLIC/);
 assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.stock_league_settle_entry_fee\(uuid, uuid\) TO moneyverse_app/);
});

test('backend never directly updates account balance for stock-league admission', async () => {
 const src = await readFile(backend,'utf8');
 const admission = src.slice(src.indexOf('async joinSeason('),src.indexOf('async subscribeCopyTrading('));
 assert.doesNotMatch(admission, /UPDATE public\.account_balances/i);
 assert.match(admission, /SELECT public\.stock_league_settle_entry_fee\(\$1::uuid,\s*\$2::uuid\)/);
});
