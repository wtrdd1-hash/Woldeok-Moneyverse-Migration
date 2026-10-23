import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Only inspect effective permissions in a disposable CI database. Never
// introspect Production or mutate the running application's privileges here.
export const PROTECTED_TABLES = Object.freeze([
  'account_balances', 'accounts', 'audit_logs', 'daily_rewards',
  'identities', 'ledger_postings', 'ledger_transactions',
  'outbox_events', 'user_consents', 'users',
]);

export function assertDisposableCiDatabase(value, env = process.env) {
  let url;
  try { url = new URL(value); } catch { throw new Error('refuse non-disposable database target'); }
  if (env.CI !== 'true' || env.GITHUB_ACTIONS !== 'true'
    || !['postgres:', 'postgresql:'].includes(url.protocol)
    || !['localhost', '127.0.0.1'].includes(url.hostname)
    || (url.port && url.port !== '5432')
    || decodeURIComponent(url.username) !== 'moneyverse_migrator'
    || url.pathname !== '/woldeok_moneyverse_dev'
    || url.search || url.hash) {
    throw new Error('refuse non-disposable database target');
  }
  return url;
}

export function assessPrivileges(output) {
  const seen = new Set();
  const violations = [];
  for (const line of output.trim().split(/\r?\n/).filter(Boolean)) {
    const fields = line.split('|');
    if (fields.length !== 4) throw new Error('invalid privilege evidence');
    const [table, insert, update, remove] = fields;
    if (!PROTECTED_TABLES.includes(table) || [insert, update, remove].some((v) => v !== 't' && v !== 'f')) {
      throw new Error('invalid privilege evidence');
    }
    if (seen.has(table)) throw new Error(`duplicate privilege evidence for ${table}`);
    seen.add(table);
    for (const [permission, value] of [['INSERT', insert], ['UPDATE', update], ['DELETE', remove]]) {
      if (value === 't') violations.push(`${table}:${permission}`);
    }
  }
  if (seen.size !== PROTECTED_TABLES.length) throw new Error('missing or incomplete privilege evidence');
  return violations;
}

const sql = `SELECT v.name,
  has_table_privilege('moneyverse_app', c.oid, 'INSERT'),
  has_table_privilege('moneyverse_app', c.oid, 'UPDATE'),
  has_table_privilege('moneyverse_app', c.oid, 'DELETE')
FROM unnest(ARRAY[${PROTECTED_TABLES.map((t) => `'${t}'`).join(', ')}]) AS v(name)
LEFT JOIN pg_catalog.pg_class c ON c.oid = pg_catalog.to_regclass('public.' || v.name)
ORDER BY v.name;`;

export function runGuard(env = process.env) {
  const url = assertDisposableCiDatabase(env.MIGRATOR_DATABASE_URL, env);
  const result = spawnSync('psql', ['-X', '-A', '-t', '-F', '|', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    encoding: 'utf8', timeout: 30000,
    env: { ...env, PGHOST: url.hostname, PGPORT: url.port || '5432',
      PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: decodeURIComponent(url.pathname.slice(1)) },
  });
  if (result.error || result.status !== 0) throw new Error('disposable PostgreSQL privilege check unavailable');
  const violations = assessPrivileges(result.stdout);
  if (violations.length) throw new Error(`P0 unsafe direct app-role DML: ${violations.join(', ')}`);
  process.stdout.write('APP_ROLE_PROTECTED_DML_DENIED_PASS\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { runGuard(); } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : 'privilege check failed'}\n`);
    process.exitCode = 1;
  }
}
