import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const disposable = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
if (disposable && !migratorUrl) throw new Error('Disposable treasury core acceptance requires MIGRATOR_DATABASE_URL');

describe('Treasury Core funded NPS real PostgreSQL acceptance', () => {
  it.skipIf(!disposable || !migratorUrl)(
    'conserves supply, 95-5 withdrawal, repeated idempotency, app ACL and full rollback', () => {
      const url = new URL(migratorUrl!);
      if (!['postgres:', 'postgresql:'].includes(url.protocol)
        || !['127.0.0.1','localhost'].includes(url.hostname)
        || (url.port !== '' && url.port !== '5432')
        || url.username !== 'moneyverse_migrator'
        || url.pathname !== '/woldeok_moneyverse_dev') {
        throw new Error('Treasury Core fixture requires exact disposable local CI PostgreSQL');
      }
      const fixture = join(__dirname,'fixtures','treasury-core-nps-v1618.sql');
      const r = spawnSync('psql',['-X','-v','ON_ERROR_STOP=1','-f',fixture],{
        encoding:'utf8',timeout:30000,
        env:{...process.env,PGHOST:url.hostname,PGPORT:url.port||'5432',
          PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),
          PGDATABASE:decodeURIComponent(url.pathname.slice(1))},
      });
      if(r.error) throw new Error(`Disposable Treasury Core SQL unavailable (${r.error.name})`);
      expect(r.status, r.stderr.slice(-3000)).toBe(0);
      expect(r.stdout).toContain('TREASURY_CORE_NPS_FUNDED_DOUBLE_ENTRY_REPLAY_ROLLBACK_PASS');
      expect(r.stdout).toContain('ROLLBACK');
    },
  );
});
