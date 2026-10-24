#!/usr/bin/env node
/**
 * Disposable CI PostgreSQL ONLY. No host/Production/dev database connection.
 * Runs concurrent real-app-role SOE remittance transactions after migrations.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export function requireDisposableCiDatabase(env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.MONEYVERSE_CI_DISPOSABLE_DB !== '1') {
    throw new Error('BLOCKED: SOE concurrency probe requires disposable GitHub CI PostgreSQL');
  }
  for (const [name, user] of [
    ['DATABASE_URL', 'moneyverse_app'],
    ['MIGRATOR_DATABASE_URL', 'moneyverse_migrator'],
  ]) {
    let url;
    try { url = new URL(env[name]); } catch { throw new Error(`BLOCKED: ${name} missing or malformed`); }
    if (url.protocol !== 'postgresql:' ||
        !['localhost', '127.0.0.1'].includes(url.hostname) ||
        url.port !== '5432' ||
        url.pathname !== '/woldeok_moneyverse_dev' ||
        decodeURIComponent(url.username) !== user ||
        !url.password || url.search || url.hash) {
      throw new Error(`BLOCKED: ${name} is not the approved disposable CI database`);
    }
  }
  return true;
}

export async function runConcurrencyProbe(env = process.env) {
  requireDisposableCiDatabase(env);
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Client } = require('pg');
  const owner = new Client({ connectionString: env.MIGRATOR_DATABASE_URL, application_name: 'ci_soe_owner' });
  const app1 = new Client({ connectionString: env.DATABASE_URL, application_name: 'ci_soe_parallel_a' });
  const app2 = new Client({ connectionString: env.DATABASE_URL, application_name: 'ci_soe_parallel_b' });
  const actor = randomUUID();
  const outsider = randomUUID();
  const query = 'SELECT public.admin_harvest_soe_dividends($1::uuid, $2::uuid) AS receipt';
  try {
    await owner.connect();
    await app1.connect();
    await app2.connect();
    await owner.query("SET statement_timeout = '20000ms'");
    await app1.query("SET statement_timeout = '20000ms'");
    await app2.query("SET statement_timeout = '20000ms'");
    await owner.query("INSERT INTO public.users (id,status) VALUES ($1,'active'),($2,'active')", [actor, outsider]);
    await owner.query("INSERT INTO public.user_roles(user_id,role) VALUES ($1,'operator')", [actor]);

    const initial = (await owner.query(`
      SELECT (SELECT balance_wld::text FROM public.system_treasury_vaults WHERE code='VAULT_MAIN') AS balance,
             (SELECT count(*)::int FROM public.state_enterprise_dividend_logs) AS logs,
             (SELECT count(*)::int FROM public.soe_dividend_harvest_receipts) AS receipts,
             (SELECT count(*)::int FROM public.system_treasury_ledger) AS ledger,
             (SELECT coalesce(sum(trunc(net_profit_hourly_wld*dividend_rate_bps/10000)),0)::text
                FROM public.state_enterprises WHERE status='ACTIVE' AND net_profit_hourly_wld>0) AS expected
    `)).rows[0];
    assert.ok(initial?.balance && BigInt(initial.expected) > 0n, 'seeded SOEs and treasury required');

    const key = randomUUID();
    const [first, replay] = await Promise.all([
      app1.query(query, [actor, key]), app2.query(query, [actor, key]),
    ]);
    assert.deepEqual(first.rows[0].receipt, replay.rows[0].receipt, 'same-key concurrent requests must replay original');
    assert.equal(first.rows[0].receipt.total_dividends_collected, initial.expected);
    await assert.rejects(app1.query(query, [actor, randomUUID()]), { code: '23505' });
    await assert.rejects(app1.query(query, [outsider, randomUUID()]), { code: '42501' });
    await assert.rejects(app2.query(query, [outsider, key]), { code: '28000' });

    const firstTotals = (await owner.query(`
      SELECT (SELECT balance_wld::text FROM public.system_treasury_vaults WHERE code='VAULT_MAIN') AS balance,
             (SELECT count(*)::int FROM public.state_enterprise_dividend_logs) AS logs,
             (SELECT count(*)::int FROM public.soe_dividend_harvest_receipts) AS receipts
    `)).rows[0];
    assert.equal(BigInt(firstTotals.balance) - BigInt(initial.balance), BigInt(initial.expected));
    assert.equal(firstTotals.receipts - initial.receipts, 1);

    // Move synthetic CI records back two hours to exercise a new period. This
    // job owns a disposable database and runs before it is destroyed.
    await owner.query("UPDATE public.soe_dividend_harvest_receipts SET period_started_at = period_started_at - interval '2 hours' WHERE idempotency_key=$1", [key]);
    await owner.query("UPDATE public.state_enterprise_dividend_logs SET created_at = created_at - interval '2 hours' WHERE created_at >= date_trunc('hour',now())");

    const results = await Promise.allSettled([
      app1.query(query, [actor, randomUUID()]),
      app2.query(query, [actor, randomUUID()]),
    ]);
    const successes = results.filter((r) => r.status === 'fulfilled');
    const refusals = results.filter((r) => r.status === 'rejected');
    assert.equal(successes.length, 1, 'different-key parallel payout must have one winner');
    assert.equal(refusals.length, 1, 'different-key parallel payout must refuse one loser');
    assert.equal(refusals[0].reason?.code, '23505');
    const secondTotals = (await owner.query(`
      SELECT (SELECT balance_wld::text FROM public.system_treasury_vaults WHERE code='VAULT_MAIN') AS balance,
             (SELECT count(*)::int FROM public.soe_dividend_harvest_receipts) AS receipts,
             (SELECT count(*)::int FROM public.state_enterprise_dividend_logs) AS logs,
             (SELECT count(*)::int FROM public.system_treasury_ledger) AS ledger,
             has_table_privilege('moneyverse_app','public.state_enterprise_dividend_logs','INSERT') AS can_insert
    `)).rows[0];
    assert.equal(BigInt(secondTotals.balance) - BigInt(initial.balance), 2n * BigInt(initial.expected));
    assert.equal(secondTotals.receipts - initial.receipts, 2);
    assert.equal(secondTotals.can_insert, false, 'app role must not insert dividend logs directly');
    assert.equal(secondTotals.ledger - initial.ledger, secondTotals.logs - initial.logs);

    // Deliberately fail on the second SOE row; PostgreSQL must roll back
    // the first ledger/log insert and the vault update in the same statement.
    await owner.query("UPDATE public.soe_dividend_harvest_receipts SET period_started_at=period_started_at-interval '2 hours' WHERE period_started_at >= date_trunc('hour',now())");
    await owner.query("UPDATE public.state_enterprise_dividend_logs SET created_at=created_at-interval '2 hours' WHERE created_at >= date_trunc('hour',now())");
    await owner.query(`CREATE FUNCTION public.ci_soe_fail_midway() RETURNS trigger
      LANGUAGE plpgsql AS $$ BEGIN
        IF NEW.enterprise_id = (SELECT id FROM public.state_enterprises
          WHERE status='ACTIVE' ORDER BY id OFFSET 1 LIMIT 1) THEN
          RAISE EXCEPTION 'isolated injected SOE failure';
        END IF;
        RETURN NEW;
      END $$`);
    await owner.query(`CREATE TRIGGER ci_soe_fail_midway
      BEFORE INSERT ON public.state_enterprise_dividend_logs
      FOR EACH ROW EXECUTE FUNCTION public.ci_soe_fail_midway()`);
    try {
      await assert.rejects(app1.query(query, [actor, randomUUID()]), { code: 'P0001' });
      const afterFailure = (await owner.query(`
        SELECT (SELECT balance_wld::text FROM public.system_treasury_vaults WHERE code='VAULT_MAIN') AS balance,
               (SELECT count(*)::int FROM public.soe_dividend_harvest_receipts) AS receipts,
               (SELECT count(*)::int FROM public.state_enterprise_dividend_logs) AS logs,
               (SELECT count(*)::int FROM public.system_treasury_ledger) AS ledger
      `)).rows[0];
      assert.deepEqual(afterFailure, {
        balance: secondTotals.balance, receipts: secondTotals.receipts,
        logs: secondTotals.logs, ledger: secondTotals.ledger,
      }, 'injected mid-operation failure must leave no partial financial writes');
    } finally {
      await owner.query('DROP TRIGGER IF EXISTS ci_soe_fail_midway ON public.state_enterprise_dividend_logs');
      await owner.query('DROP FUNCTION IF EXISTS public.ci_soe_fail_midway()');
    }
    return { ok: true, sameKeyParallel: 2, differentKeyParallel: 2, uniqueCommittedPeriods: 2,
      injectedRollback: true, appDirectDividendLogInsert: false };
  } finally {
    await Promise.allSettled([app1.end(), app2.end(), owner.end()]);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  runConcurrencyProbe().then((result) => console.log(JSON.stringify(result)))
    .catch((error) => { console.error('SOE isolated CI concurrency BLOCKED/FAIL:', error.code ?? error.message); process.exitCode = 1; });
}
