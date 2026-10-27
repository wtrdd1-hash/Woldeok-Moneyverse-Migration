import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { TreasuryRepository } from './treasury.repository';

// This opt-in fixture only accepts an isolated, disposable local database.
const connectionString = process.env.MV_V571_ISOLATED_PG_URL;
const parsed = connectionString ? new URL(connectionString) : null;
const isolated = parsed?.hostname === '127.0.0.1' && parsed?.pathname === '/mv_v571_backup_test';

describe.skipIf(!isolated)('Treasury backup fail-closed against isolated PostgreSQL', () => {
  const pool = new Pool({ connectionString });
  afterAll(async () => pool.end());

  it('does not issue a fake backup receipt or modify the database', async () => {
    const db = await pool.query<{ current_database: string }>('SELECT current_database()');
    expect(db.rows[0]?.current_database).toBe('mv_v571_backup_test');
    await pool.query('CREATE TABLE IF NOT EXISTS backup_evidence_probe (id integer PRIMARY KEY)');
    const repository = new TreasuryRepository(pool);
    await expect(repository.createImmutableBackupSnapshot('00000000-0000-0000-0000-000000000001'))
      .rejects.toThrow('TREASURY_BACKUP_EVIDENCE_UNAVAILABLE');
    await expect(repository.getBackupStatus()).rejects.toThrow('TREASURY_BACKUP_EVIDENCE_UNAVAILABLE');
    const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM backup_evidence_probe');
    expect(result.rows[0]?.count).toBe('0');
  });
});
