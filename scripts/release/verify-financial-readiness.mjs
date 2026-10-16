#!/usr/bin/env node
/**
 * v2026.10.16.737. Fail-closed, snapshot-consistent financial release preflight.
 * Never edits data or changes grants. An unmatched projection is evidence of
 * an UNCERTIFIED opening balance, not automatically of missing/misappropriated WLD.
 * Before any release the operator must certify provenance (NOT plug a delta).
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export const PROTECTED_FINANCIAL_TABLES = Object.freeze([
  'account_balances', 'accounts', 'ledger_transactions',
  'ledger_postings', 'system_treasury_vaults',
]);

export function evaluateFinancialReadiness({ grants, ledger, identity }) {
  const blockers = [];
  const byTable = new Map(grants.map((entry) => [entry.name, entry]));
  for (const name of PROTECTED_FINANCIAL_TABLES) {
    const row = byTable.get(name);
    if (!row) blockers.push('missing_core_table:' + name);
    else if (row.can_insert || row.can_update || row.can_delete) {
      blockers.push('direct_application_financial_dml:' + name);
    }
  }
  if (!identity?.database || !identity?.role) blockers.push('unverified_database_identity');
  if (!ledger || !Number.isInteger(ledger.balance_rows) || ledger.balance_rows < 1) {
    blockers.push('missing_or_empty_balance_projection');
  } else {
    if (ledger.unexplained_account_count > 0) blockers.push('uncertified_account_opening_or_ledger_drift');
    if (ledger.unbalanced_transaction_count > 0) blockers.push('unbalanced_ledger_transaction');
    if (ledger.transactions_without_postings > 0) blockers.push('ledger_transaction_without_postings');
    if (ledger.unknown_posting_direction_count > 0) blockers.push('unknown_posting_direction');
  }
  return {
    ok: blockers.length === 0,
    status: blockers.length === 0 ? 'READY_FOR_OTHER_RELEASE_GATES' : 'BLOCKED',
    blockers,
    summary: {
      database: identity?.database ?? null,
      role: identity?.role ?? null,
      balanceRows: ledger?.balance_rows ?? null,
      unexplainedProjectionAccounts: ledger?.unexplained_account_count ?? null,
      unexplainedProjectionDeltaWld: ledger?.unexplained_delta_wld ?? null,
      unbalancedTransactions: ledger?.unbalanced_transaction_count ?? null,
      transactionsWithoutPostings: ledger?.transactions_without_postings ?? null,
      coreTablesWithAppDml: grants.filter(x => x.can_insert || x.can_update || x.can_delete)
        .map(x => x.name),
    },
    caveat: 'Opening-balance provenance and treasury/money-supply reconciliation are separate mandatory gates. A zero count here is not approval for Production.',
  };
}

const GRANTS_SQL = `
SELECT c.relname AS name,
       has_table_privilege('moneyverse_app', c.oid, 'INSERT') AS can_insert,
       has_table_privilege('moneyverse_app', c.oid, 'UPDATE') AS can_update,
       has_table_privilege('moneyverse_app', c.oid, 'DELETE') AS can_delete
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
  AND c.relname = ANY($1::text[])
ORDER BY c.relname
`;

const LEDGER_SQL = `
WITH account_net AS (
  SELECT account_id,
         SUM(CASE WHEN direction::text = 'debit' THEN amount
                  WHEN direction::text = 'credit' THEN -amount ELSE 0 END) AS net
  FROM public.ledger_postings GROUP BY account_id
), projection AS (
  SELECT COUNT(*)::int AS balance_rows,
         COUNT(*) FILTER (WHERE ab.available_amount IS DISTINCT FROM
                          COALESCE(n.net, 0))::int AS unexplained_account_count,
         COALESCE(SUM(ab.available_amount - COALESCE(n.net, 0)),0)::text
           AS unexplained_delta_wld
  FROM public.account_balances ab LEFT JOIN account_net n ON n.account_id=ab.account_id
), transactions AS (
  SELECT COUNT(*)::int AS unbalanced_transaction_count
  FROM (SELECT transaction_id
        FROM public.ledger_postings GROUP BY transaction_id
        HAVING SUM(CASE WHEN direction::text='debit' THEN amount
                        WHEN direction::text='credit' THEN -amount ELSE 0 END)<>0) as bad
), orphans AS (
  SELECT COUNT(*)::int AS transactions_without_postings
  FROM public.ledger_transactions t
  WHERE NOT EXISTS(SELECT 1 FROM public.ledger_postings p WHERE p.transaction_id=t.id)
), unknowns AS (
  SELECT COUNT(*)::int AS unknown_posting_direction_count
  FROM public.ledger_postings
  WHERE direction::text NOT IN ('debit','credit')
)
SELECT * FROM projection CROSS JOIN transactions CROSS JOIN orphans CROSS JOIN unknowns
`;

export async function readFinancialSnapshot(client) {
  // A repeatable-read snapshot prevents one table being read at a later ledger HWM
  // than another. Explicit READ ONLY also makes accidental future DML fail closed.
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '10000ms'");
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role')).rows[0];
    const grants = (await client.query(GRANTS_SQL, [PROTECTED_FINANCIAL_TABLES])).rows;
    const ledger = (await client.query(LEDGER_SQL)).rows[0];
    return { grants, ledger, identity };
  } finally {
    await client.query('ROLLBACK');
  }
}

function readDatabaseUrl(path) {
  const content = fs.readFileSync(path, 'utf8');
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error('DATABASE_URL not found in specified operator environment file');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--env-file' || !args[1].startsWith('/')) {
    throw new Error('Usage: node scripts/release/verify-financial-readiness.mjs --env-file /absolute/path/to/approved/runtime.env');
  }
  const url = readDatabaseUrl(args[1]);
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 4000,
    application_name: 'moneyverse_readonly_financial_release_gate' });
  try {
    const client = await pool.connect();
    try {
      const report = evaluateFinancialReadiness(await readFinancialSnapshot(client));
      console.log(JSON.stringify(report, null, 2));
      if (!report.ok) process.exitCode = 2;
    } finally { client.release(); }
  } finally { await pool.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(JSON.stringify({ status: 'BLOCKED', reason: error.code ?? error.message }));
    process.exitCode = 2;
  });
}
