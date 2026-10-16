import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const migration=new URL('../../packages/database/migrations/274-stock-league-scoped-reads.sql',import.meta.url);
const repo=new URL('../../backend/src/stock/stock-league.repository.ts',import.meta.url);
test('scoped privileged lookups do not expose roles or portfolio base tables',async()=>{
 const sql=await readFile(migration,'utf8');
 assert.match(sql,/CREATE OR REPLACE FUNCTION public\.stock_league_is_admin\(p_user_id uuid\)/);
 assert.match(sql,/CREATE OR REPLACE FUNCTION public\.stock_league_portfolio_value\(p_user_id uuid\)/);
 assert.match(sql,/SECURITY DEFINER/g);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.stock_league_is_admin\(uuid\) FROM PUBLIC/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.stock_league_portfolio_value\(uuid\) FROM PUBLIC/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.stock_league_is_admin\(uuid\) TO moneyverse_app/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.stock_league_portfolio_value\(uuid\) TO moneyverse_app/);
 assert.doesNotMatch(sql,/GRANT\s+SELECT\s+ON\s+(?:TABLE\s+)?public\.(?:user_roles|virtual_stocks|virtual_stock_positions)/i);
});
test('league repository queries only scoped read functions, not raw role or member portfolio tables',async()=>{
 const src=await readFile(repo,'utf8');
 assert.doesNotMatch(src,/FROM\s+public\.user_roles/i);
 assert.doesNotMatch(src,/FROM\s+public\.virtual_stock_positions/i);
 assert.doesNotMatch(src,/JOIN\s+public\.virtual_stocks/i);
 assert.match(src,/public\.stock_league_is_admin\(/);
 assert.match(src,/public\.stock_league_portfolio_value\(/);
});
