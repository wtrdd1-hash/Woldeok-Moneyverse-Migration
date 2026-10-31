#!/usr/bin/env node
/**
 * v1552. Read-only historical Treasury provenance inventory.
 * Amount/date proximity is never a receipt, ledger posting, or approval to pay.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const COUNT_KEYS = Object.freeze([
  'legacy_total', 'legacy_unlinked', 'legacy_linked',
  'invalid_wld', 'canonical_transactions', 'canonical_postings',
]);
const CANDIDATE_KEYS = Object.freeze(['no_candidate', 'one_candidate', 'multiple_candidates']);
const VALID_IDENTITY = Object.freeze({
  database: 'woldeok_moneyverse_dev', role: 'moneyverse_app',
});
function validCount(v) {
  return Number.isSafeInteger(v) && v >= 0;
}
export function evaluateTreasuryProvenance(input) {
  const deny = () => ({
    monetaryReleaseAuthorized: false,
    status: 'BLOCKED_UNVERIFIED_AUDIT_INPUT',
    warning: 'Invalid or incomplete evidence cannot certify monetary transactions.',
  });
  if (!input || !input.identity || input.identity.database !== VALID_IDENTITY.database ||
      input.identity.role !== VALID_IDENTITY.role || !input.summary ||
      !COUNT_KEYS.every(k => validCount(input.summary[k])) ||
      !input.correlation || !CANDIDATE_KEYS.every(k => validCount(input.correlation[k])) ||
      !Array.isArray(input.types) ||
      !input.types.every(x => x && typeof x.type === 'string' &&
        /^[A-Z][A-Z0-9_]{0,63}$/.test(x.type) && validCount(x.count)) ||
      new Set(input.types.map(x => x.type)).size !== input.types.length) {
    return deny();
  }
  const s = input.summary, c = input.correlation;
  const totalByType = input.types.reduce((v, x) => v + x.count, 0);
  if (!Number.isSafeInteger(totalByType) || s.legacy_unlinked + s.legacy_linked !== s.legacy_total ||
      c.no_candidate + c.one_candidate + c.multiple_candidates !== s.legacy_unlinked ||
      totalByType !== s.legacy_total || s.invalid_wld > s.legacy_total) {
    return deny();
  }
  if (s.invalid_wld > 0) return deny();
  const unresolved = s.legacy_unlinked > 0;
  return {
    status: unresolved ? 'BLOCKED_LEGACY_TREASURY_PROVENANCE' : 'INDEPENDENT_RECONCILIATION_CERTIFICATION_REQUIRED',
    monetaryReleaseAuthorized: false,
    database: input.identity.database,
    legacyTotalCount: s.legacy_total,
    legacyUnlinkedCount: s.legacy_unlinked,
    legacyLinkedCount: s.legacy_linked,
    canonicalTransactionCount: s.canonical_transactions,
    canonicalPostingCount: s.canonical_postings,
    byType: input.types.map(({ type, count }) => ({ type, count })),
    coincidenceOnly: {
      noCandidate: c.no_candidate,
      oneCandidate: c.one_candidate,
      multipleCandidates: c.multiple_candidates,
    },
    warning: 'Same amount and time are not evidence of source, posting, beneficiary, or idempotency. This is a legacy event inventory, not a Treasury balance or payment certification. Do not create synthetic links or replay payments.',
  };
}

const SUMMARY_SQL = [
  'SELECT (SELECT COUNT(*)::int FROM public.system_treasury_ledger) AS legacy_total,',
  ' (SELECT COUNT(*)::int FROM public.system_treasury_ledger WHERE ledger_transaction_id IS NULL) AS legacy_unlinked,',
  ' (SELECT COUNT(*)::int FROM public.system_treasury_ledger WHERE ledger_transaction_id IS NOT NULL) AS legacy_linked,',
  " (SELECT COUNT(*)::int FROM public.system_treasury_ledger WHERE amount_wld !~ '^-?[0-9]+$') AS invalid_wld,",
  ' (SELECT COUNT(*)::int FROM public.ledger_transactions) AS canonical_transactions,',
  ' (SELECT COUNT(*)::int FROM public.ledger_postings) AS canonical_postings',
].join('\n');
const TYPE_SQL = [
  'SELECT tx_type AS type, COUNT(*)::int AS count',
  'FROM public.system_treasury_ledger',
  'GROUP BY tx_type ORDER BY COUNT(*) DESC, tx_type',
].join('\n');
const CORRELATION_SQL = [
  'WITH debit_totals AS (',
  ' SELECT t.id, t.created_at, SUM(CASE WHEN p.direction::text = \'debit\' THEN p.amount ELSE 0 END) AS debit_wld',
  ' FROM public.ledger_transactions t LEFT JOIN public.ledger_postings p ON p.transaction_id=t.id',
  ' GROUP BY t.id',
  '), coincidences AS (',
  ' SELECT l.id, COUNT(t.id)::int AS n',
  ' FROM public.system_treasury_ledger l',
  ' LEFT JOIN debit_totals t ON',
  "  l.created_at BETWEEN t.created_at - INTERVAL '5 minutes' AND t.created_at + INTERVAL '5 minutes'",
  "  AND t.debit_wld > 0 AND t.debit_wld = CASE WHEN l.amount_wld ~ '^-?[0-9]+$'",
  '    THEN ABS(l.amount_wld::numeric) ELSE NULL END',
  ' WHERE l.ledger_transaction_id IS NULL',
  ' GROUP BY l.id',
  ') SELECT',
  ' COUNT(*) FILTER (WHERE n=0)::int AS no_candidate,',
  ' COUNT(*) FILTER (WHERE n=1)::int AS one_candidate,',
  ' COUNT(*) FILTER (WHERE n>1)::int AS multiple_candidates',
  ' FROM coincidences',
].join('\n');

export async function readTreasuryProvenanceSnapshot(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '10000ms'");
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role')).rows[0];
    const summary = (await client.query(SUMMARY_SQL)).rows[0];
    const types = (await client.query(TYPE_SQL)).rows;
    const correlation = (await client.query(CORRELATION_SQL)).rows[0];
    return { identity, summary, types, correlation };
  } finally {
    await client.query('ROLLBACK');
  }
}
function readDatabaseUrl(file) {
  const match = fs.readFileSync(file, 'utf8').match(/^DATABASE_URL=(.*)$/m);
  if (!match || !match[1]?.trim()) throw new Error('DATABASE_URL is not present in approved operator environment');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--env-file' || !args[1].startsWith('/')) {
    throw new Error('Usage: node scripts/release/audit-treasury-provenance.mjs --env-file /absolute/approved/runtime.env');
  }
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: readDatabaseUrl(args[1]),
    max: 1, connectionTimeoutMillis: 4000,
    application_name: 'moneyverse_readonly_treasury_provenance_audit',
  });
  try {
    const client = await pool.connect();
    try {
      const output = evaluateTreasuryProvenance(await readTreasuryProvenanceSnapshot(client));
      console.log(JSON.stringify(output, null, 2));
      if (output.monetaryReleaseAuthorized !== true) process.exitCode = 2;
    } finally { client.release(); }
  } finally { await pool.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(JSON.stringify({ status: 'BLOCKED_UNVERIFIED_AUDIT_INPUT', code: error.code ?? 'operator_audit_failed' }));
    process.exitCode = 2;
  });
}
