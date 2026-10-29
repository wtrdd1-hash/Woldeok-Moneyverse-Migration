import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';
import { WorkRepository } from './work.repository';

const migratorUrl = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!databaseUrl() || !migratorUrl)('career switch receipts against isolated PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: migratorUrl, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('persists only the requested active job and returns the same owner profile', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
      const repo = new WorkRepository(client);
      const first = await repo.switchActiveJob(actor, 'developer') as Record<string, unknown>;
      expect(first).toMatchObject({ job_type: 'developer', is_active: true });
      const second = await repo.switchActiveJob(actor, 'trader') as Record<string, unknown>;
      expect(second).toMatchObject({ job_type: 'trader', is_active: true });
      const profile = await repo.jobProfile(actor) as {
        active_job: { job_type: string };
        all_jobs: { job_type: string; is_active: boolean }[];
      };
      expect(profile.active_job.job_type).toBe('trader');
      expect(profile.all_jobs.filter((job) => job.is_active).map((job) => job.job_type)).toEqual(['trader']);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
