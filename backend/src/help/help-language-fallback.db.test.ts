import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import { databaseUrl } from '../testing/database';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';

const url = databaseUrl();
const describeDb = url ? describe : describe.skip;
describeDb('isolated PostgreSQL verified bilingual help search', () => {
  let pool: Pool;
  let controller: HelpController;
  beforeAll(() => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    pool = new Pool({ connectionString: url, max: 2 });
    controller = new HelpController(new HelpRepository(pool));
  });
  afterAll(async () => { await pool?.end(); vi.unstubAllEnvs(); });

  it('falls back only to independently approved, unexpired English help', async () => {
    const result = await controller.search({ locale: 'ko', query: 'Backup', fallbackToOtherLocale: true });
    expect(result).toMatchObject({ requestedLocale: 'ko', resultLocale: 'en', fallbackUsed: true });
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]?.slug).toBe('backup-help');
  });
  it('does not disclose English documents when fallback is not requested', async () => {
    expect(await controller.search({ locale: 'ko', query: 'Backup' })).toMatchObject({ articles: [], fallbackUsed: false });
  });
  it('does not allow the app role to read private help tables directly', async () => {
    await expect(pool.query('SELECT id FROM public.help_article_revisions LIMIT 1'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
