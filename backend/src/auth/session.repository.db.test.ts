import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AdminRolesRepository } from './admin-roles.repository';
import { SessionRepository } from './session.repository';

/**
 * The only tests in this repository that touch a real PostgreSQL server.
 *
 * Everything else runs against deliberately partial test doubles, which prove
 * the logic but not that the SQL matches the schema — a column renamed in a
 * migration, or a function whose argument list moved, is invisible to a
 * double. These close that gap.
 *
 * They skip without DATABASE_URL rather than failing, because the development
 * machine has no local PostgreSQL. A skipped test is never reported as a
 * passing one.
 */
function databaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Convenience for local runs: packages/database/.env is gitignored and
  // holds the scratch database's URL.
  try {
    const text = readFileSync(
      join(__dirname, '../../../packages/database/.env'),
      'utf8',
    );
    return /^DATABASE_URL=(.+)$/m.exec(text)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('connects as the least-privileged application role', async () => {
    const { rows } = await pool.query<{ current_user: string }>('SELECT current_user');
    expect(rows[0]?.current_user).toBe('moneyverse_app');
  });

  // The guarantee the whole design rests on. If this ever starts succeeding,
  // someone has granted the application role table-level DML and a full
  // application compromise can move money directly.
  it('cannot update a balance directly', async () => {
    await expect(
      pool.query('UPDATE account_balances SET available_amount = available_amount + 1'),
    ).rejects.toThrow(/permission denied/i);
  });

  it('cannot delete an audit row', async () => {
    await expect(pool.query('DELETE FROM audit_logs')).rejects.toThrow(/permission denied/i);
  });

  it('cannot insert an identity directly', async () => {
    await expect(
      pool.query(
        "INSERT INTO identities(user_id, provider, provider_subject, display_name) VALUES (gen_random_uuid(), 'discord', 'x', 'x')",
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  describe('SessionRepository', () => {
    it('creates a session whose SQL matches the auth_sessions schema', async () => {
      const created = await new SessionRepository(pool).create();
      expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(created.user_id).toBeNull();
      expect(created.token).not.toBe(created.csrfToken);
    });

    it('finds the session it just created by token', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      const found = await repository.get(created.token);
      expect(found?.id).toBe(created.id);
    });

    it('does not find a session by a token that was never issued', async () => {
      const repository = new SessionRepository(pool);
      await repository.create();
      expect(await repository.get('n'.repeat(64))).toBeNull();
    });

    it('verifies the CSRF token it issued and rejects another', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      expect(await repository.verifyCsrf(created.id, created.csrfToken)).toBe(true);
      expect(await repository.verifyCsrf(created.id, 'n'.repeat(64))).toBe(false);
    });

    it('rotates the CSRF token, invalidating the previous one', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      const rotated = await repository.rotateCsrf(created.id);
      expect(await repository.verifyCsrf(created.id, rotated)).toBe(true);
      expect(await repository.verifyCsrf(created.id, created.csrfToken)).toBe(false);
    });

    it('stops finding a session once revoked', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      await repository.revoke(created.id);
      expect(await repository.get(created.token)).toBeNull();
    });

    it('reports no current consent for a fresh pre-login session', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      expect(await repository.hasCurrentUserConsent(created.id)).toBe(false);
      expect(await repository.hasCurrentPreloginConsent(created.id)).toBe(false);
    });

    it('reports no recent reauthentication for a fresh session', async () => {
      const repository = new SessionRepository(pool);
      const created = await repository.create();
      expect(await repository.hasRecentReauthentication(created.id)).toBe(false);
    });

    // Exercises the real function signature; a double cannot catch an
    // argument list that moved in a migration.
    it('reads the current consent version through the real table', async () => {
      const version = await new SessionRepository(pool).currentConsentVersion();
      if (version !== null) {
        expect(typeof version.terms_version).toBe('string');
        expect(typeof version.privacy_version).toBe('string');
      }
    });
  });

  describe('AdminRolesRepository', () => {
    it('calls admin_current_roles with the signature the migration declares', async () => {
      const repository = new AdminRolesRepository(pool);
      const roles = await repository.currentRoles('00000000-0000-4000-8000-000000000000');
      expect(Array.isArray(roles)).toBe(true);
    });
  });
});
