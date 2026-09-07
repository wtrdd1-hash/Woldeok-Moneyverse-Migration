import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)(
  'the admin shop boundary against a real database',
  () => {
    let app: Pool;
    let migrator: Pool;

    beforeAll(() => {
      app = new Pool({ connectionString: DATABASE_URL, max: 1 });
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await app.end();
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    const admin = async (client: PoolClient, role: 'operator' | 'approver' | 'superadmin'): Promise<string> => {
      const actor = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
      await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [actor, role]);
      return actor;
    };

    const firstItem = async (client: PoolClient): Promise<string> => {
      const row = await client.query<{ id: string }>(
        'SELECT id::text FROM public.shop_catalog ORDER BY code LIMIT 1',
      );
      const id = row.rows[0]?.id;
      if (!id) throw new Error('shop catalog was not seeded');
      return id;
    };

    it('keeps the catalog table unreadable and unwritable by the application role', async () => {
      for (const privilege of ['SELECT', 'UPDATE']) {
        const row = await app.query<{ allowed: boolean }>(
          `SELECT has_table_privilege(current_user, 'public.shop_catalog', $1) AS allowed`,
          [privilege],
        );
        expect(row.rows[0]?.allowed).toBe(false);
      }
    });

    it('refuses a member without an administrator role', async () => {
      await rolledBack(async (client) => {
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_shop_items($1)', [actor]),
        );
        expect(code(error)).toBe('42501');
      });
    });

    it('lets an administrator inspect the catalog', async () => {
      await rolledBack(async (client) => {
        const approver = await admin(client, 'approver');
        const listed = await client.query<{ id: string }>(
          'SELECT id::text FROM public.admin_shop_items($1)',
          [approver],
        );
        expect(listed.rowCount).toBeGreaterThan(0);
      });
    });

    it('refuses catalog mutation from a non-operator administrator', async () => {
      await rolledBack(async (client) => {
        const approver = await admin(client, 'approver');
        const itemId = await firstItem(client);
        const denied = await rejectionOf(() =>
          client.query(
            'SELECT * FROM public.admin_shop_update_item($1,$2,99,true,NULL,true,false,false)',
            [approver, itemId],
          ),
        );
        expect(code(denied)).toBe('42501');
      });
    });

    it('updates a price without losing bigint precision', async () => {
      await rolledBack(async (client) => {
        const operator = await admin(client, 'operator');
        const itemId = await firstItem(client);
        const exact = '9007199254740993';
        const changed = await client.query<{ base_price: string }>(
          `SELECT base_price::text FROM public.admin_shop_update_item(
             $1,$2,$3::bigint,NULL,NULL,true,false,false
           )`,
          [operator, itemId, exact],
        );
        expect(changed.rows[0]?.base_price).toBe(exact);
      });
    });

    it('rejects negative stock', async () => {
      await rolledBack(async (client) => {
        const operator = await admin(client, 'operator');
        const itemId = await firstItem(client);
        const negative = await rejectionOf(() =>
          client.query(
            'SELECT * FROM public.admin_shop_update_item($1,$2,NULL,NULL,-1,false,false,true)',
            [operator, itemId],
          ),
        );
        expect(code(negative)).toBe('22023');
      });
    });

    it('rejects stock above a limited item maximum', async () => {
      await rolledBack(async (client) => {
        const operator = await admin(client, 'operator');
        const limited = await client.query<{ id: string; max_stock: number }>(
          `SELECT id::text, max_stock
           FROM public.shop_catalog
           WHERE is_limited AND max_stock IS NOT NULL
           ORDER BY code LIMIT 1`,
        );
        const row = limited.rows[0];
        if (!row) throw new Error('no limited catalog item was seeded');
        const above = await rejectionOf(() =>
          client.query(
            'SELECT * FROM public.admin_shop_update_item($1,$2,NULL,NULL,$3,false,false,true)',
            [operator, row.id, row.max_stock + 1],
          ),
        );
        expect(code(above)).toBe('22023');
      });
    });
  },
);
