import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresSpaceRepository } from './space.repository';

const appUrl = process.env.SPACE_PRIVATE_READ_TEST_DATABASE_URL;
const migratorUrl = process.env.SPACE_PRIVATE_READ_TEST_MIGRATOR_URL;

// Only run against a disposable, isolated database provisioned for this test.
describe.skipIf(!appUrl || !migratorUrl)('P0 private space visibility against isolated PostgreSQL', () => {
  const app = new Pool({ connectionString: appUrl, max: 2 });
  const migrator = new Pool({ connectionString: migratorUrl, max: 2 });
  const repo = new PostgresSpaceRepository(app);
  const owner = randomUUID();
  const stranger = randomUUID();
  const privateId = randomUUID();
  const clubId = randomUUID();
  const publicId = randomUUID();

  beforeAll(async () => {
    await migrator.query('INSERT INTO public.users(id) VALUES ($1),($2)', [owner, stranger]);
    for (const [id, privacy, name] of [
      [privateId, 'private', 'PRIVATE_TEST_SPACE'],
      [clubId, 'club', 'CLUB_TEST_SPACE'],
      [publicId, 'public', 'PUBLIC_TEST_SPACE'],
    ]) {
      await migrator.query(
        `INSERT INTO public.user_spaces(id,user_id,space_type,name,privacy,created_at,tax_paid_until)
         VALUES ($1,$2,'SPACE_STUDIO',$3,$4,now()-interval '14 days',now()-interval '8 days')`,
        [id, owner, name, privacy],
      );
    }
  });

  afterAll(async () => {
    await app.end();
    await migrator.end();
  });

  it('lists only actor holdings', async () => {
    const own = await repo.listUserSpaces(owner);
    const other = await repo.listUserSpaces(stranger);
    expect(own.map((row) => row.id).sort()).toEqual([privateId, clubId, publicId].sort());
    expect(other).toEqual([]);
  });

  it('allows owner all, stranger only explicitly public detail', async () => {
    expect((await repo.getSpaceById(owner, privateId))?.id).toBe(privateId);
    expect((await repo.getSpaceById(owner, clubId))?.id).toBe(clubId);
    expect(await repo.getSpaceById(stranger, privateId)).toBeNull();
    expect(await repo.getSpaceById(stranger, clubId)).toBeNull();
    expect((await repo.getSpaceById(stranger, publicId))?.id).toBe(publicId);
  });

  it('does not expose another member tax status, even for public space', async () => {
    expect((await repo.getSpaceTaxStatus(owner, publicId)).spaceId).toBe(publicId);
    await expect(repo.getSpaceTaxStatus(stranger, publicId)).rejects.toThrow('space not found');
    await expect(repo.getSpaceTaxStatus(stranger, privateId)).rejects.toThrow('space not found');
  });

  it('only includes public space in delinquency list', async () => {
    const entries = await repo.listDelinquencies();
    const ids = entries.map((row) => row.spaceId);
    expect(ids).toContain(publicId);
    expect(ids).not.toContain(privateId);
    expect(ids).not.toContain(clubId);
  });

  it('keeps layout updates owner-only and does not mutate finance ledgers', async () => {
    const before = await migrator.query<{ n: string }>('SELECT count(*)::text AS n FROM public.ledger_transactions');
    await expect(repo.updateSpaceLayout(stranger, privateId, { theme: 'bad' })).rejects.toThrow();
    expect(await repo.updateSpaceLayout(owner, privateId, { theme: 'good' })).toBe(true);
    const after = await migrator.query<{ n: string }>('SELECT count(*)::text AS n FROM public.ledger_transactions');
    expect(after.rows[0]?.n).toBe(before.rows[0]?.n);
  });
});
