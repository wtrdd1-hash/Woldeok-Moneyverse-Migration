import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const disposableCi = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
if (disposableCi && !migratorUrl) {
  throw new Error('P0 charter ledger acceptance requires disposable MIGRATOR_DATABASE_URL');
}

function disposableDbEnv(): NodeJS.ProcessEnv {
  const url = new URL(migratorUrl!);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
    || !['localhost', '127.0.0.1'].includes(url.hostname)
    || (url.port !== '' && url.port !== '5432')
    || url.username !== 'moneyverse_migrator'
    || url.pathname !== '/woldeok_moneyverse_dev') {
    throw new Error('charter ledger acceptance requires exact disposable CI database contract');
  }
  return {
    ...process.env,
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
  };
}

function runSql(sql: string, env: NodeJS.ProcessEnv): string {
  const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', sql], {
    encoding: 'utf8', timeout: 30000, env,
  });
  if (result.error || result.status !== 0) {
    throw new Error('disposable charter SQL setup or assertion failed');
  }
  return result.stdout.trim();
}

function runConcurrentSql(sql: string, env: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', sql], {
      env, timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    // Avoid leaking connection credentials through raw psql error output.
    child.stderr.resume();
    child.on('error', () => reject(new Error('concurrent charter psql unavailable')));
    child.on('close', (code) => {
      if (code !== 0) reject(new Error('concurrent charter SQL failed'));
      else resolve(stdout.trim());
    });
  });
}

describe('P0 club charter ledger (disposable CI PostgreSQL)', () => {
  it.skipIf(!disposableCi || !migratorUrl)('preserves ledger, replay, ACL and rollback invariants', () => {
    const env = disposableDbEnv();
    const script = join(__dirname, 'fixtures', 'club-charter-ledger-v557.sql');
    const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-f', script], {
      encoding: 'utf8', timeout: 45000, env,
    });
    if (result.error || result.status !== 0) {
      throw new Error('disposable charter SQL fixture failed');
    }
    expect(result.stdout).toContain('CLUB_CHARTER_LEDGER_REPLAY_ROLE_GUARDS_PASS');
    expect(result.stdout).toContain('ROLLBACK');
  });

  it.skipIf(!disposableCi || !migratorUrl)('settles exactly one charter across 100 concurrent requests', async () => {
    const env = disposableDbEnv();
    const actor = randomUUID();
    const cash = randomUUID();
    const key = randomUUID();
    runSql(`INSERT INTO public.users(id) VALUES('${actor}');
      INSERT INTO public.accounts(id,account_type,owner_user_id)
      VALUES('${cash}','USER_CASH','${actor}');
      INSERT INTO public.account_balances(account_id,available_amount)
      VALUES('${cash}',2000000);`, env);
    const sql = `SET ROLE moneyverse_app; SELECT club_id FROM public.club_create(
      '${actor}','CONCUR','Concurrent charter test','','','public','${key}');`;
    const results: string[] = [];
    for (let wave = 0; wave < 5; wave++) {
      results.push(...await Promise.all(Array.from({ length: 20 }, () => runConcurrentSql(sql, env))));
    }
    expect(results).toHaveLength(100);
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toMatch(/^[0-9a-f-]{36}$/);
    const counts = runSql(`SELECT
      (SELECT count(*) FROM public.clubs WHERE owner_id='${actor}'),
      (SELECT count(*) FROM public.ledger_transactions WHERE idempotency_key='${key}'),
      (SELECT count(*) FROM public.ledger_postings p JOIN public.ledger_transactions t
        ON t.id=p.transaction_id WHERE t.idempotency_key='${key}'),
      (SELECT available_amount FROM public.account_balances WHERE account_id='${cash}');`, env);
    expect(counts).toBe('1|1|2|1990000');
  });
});
