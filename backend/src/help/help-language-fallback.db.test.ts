import { readFileSync } from 'node:fs';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { databaseUrl } from '../testing/database';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';

// This test writes synthetic articles ONLY inside a rolled-back transaction on
// a loopback disposable PostgreSQL instance. Never seed live DEV/Test/Production.
const appUrl = databaseUrl();
const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const isolated = process.env.GITHUB_ACTIONS === 'true' || process.env.MONEYVERSE_ISOLATED_DB_TEST === '1';
function isLocalDatabase(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) &&
      parsed.pathname === '/woldeok_moneyverse_dev';
  } catch {
    return false;
  }
}
const describeDb = isolated && isLocalDatabase(appUrl) && isLocalDatabase(migratorUrl)
  ? describe : describe.skip;

const fixture = readFileSync(
  new URL('../../../packages/database/test/fixtures/help-language-fallback-fixture.sql', import.meta.url),
  'utf8',
).replace(/^BEGIN;\s*$/m, '').replace(/^COMMIT;\s*$/m, '');

describeDb('isolated PostgreSQL verified bilingual help search', () => {
  let migrator: Pool;
  beforeAll(() => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    migrator = new Pool({ connectionString: migratorUrl, max: 1 });
  });
  afterAll(async () => { await migrator?.end(); vi.unstubAllEnvs(); });

  async function rolledBackAppRole(assertions: (client: PoolClient) => Promise<void>): Promise<void> {
    const client = await migrator.connect();
    try {
      await client.query('BEGIN');
      await client.query(fixture);
      // Test the real least-privilege application role, while retaining
      // visibility of uncommitted fixture rows on the same connection.
      await client.query('SET LOCAL ROLE moneyverse_app');
      const role = await client.query<{ role: string }>('SELECT current_user AS role');
      expect(role.rows[0]?.role).toBe('moneyverse_app');
      await assertions(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  it('falls back only to independently approved, unexpired English help', async () => {
    await rolledBackAppRole(async (client) => {
      const controller = new HelpController(new HelpRepository(client));
      const result = await controller.search({ locale: 'ko', query: 'Backup', fallbackToOtherLocale: true });
      expect(result).toMatchObject({ requestedLocale: 'ko', resultLocale: 'en', fallbackUsed: true });
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0]?.slug).toBe('backup-help');
    });
  });
  it('does not disclose English documents when fallback is not requested', async () => {
    await rolledBackAppRole(async (client) => {
      const controller = new HelpController(new HelpRepository(client));
      expect(await controller.search({ locale: 'ko', query: 'Backup' }))
        .toMatchObject({ articles: [], fallbackUsed: false });
    });
  });
  it('does not allow the app role to read private help tables directly', async () => {
    await rolledBackAppRole(async (client) => {
      await expect(client.query('SELECT id FROM public.help_article_revisions LIMIT 1'))
        .rejects.toMatchObject({ code: '42501' });
    });
  });
});
