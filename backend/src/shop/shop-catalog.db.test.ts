import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { ShopCatalogRepository } from './shop.repository';

/**
 * Migrations 071-075, executed.
 *
 * Two of these functions raised 42702 on their first table-touching statement
 * before this suite existed, which means neither had ever run. Every case
 * below calls the real function; that alone is most of the value.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the shop catalogue against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the catalogue tables unreadable by the application role', async () => {
    for (const table of [
      'shop_catalog',
      'shop_inventory',
      'shop_purchases',
      'user_items',
      'item_effect_receipts',
      'shop_maintenance_receipts',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(
        String((error as { message?: string }).message),
        `${table} must be reachable only through a function`,
      ).toMatch(/permission denied/i);
    }
  });

  /**
   * The four functions the API calls, called the way the API calls them:
   * through `moneyverse_app`, with the SQL text `ShopCatalogRepository`
   * ships. A renamed OUT parameter or a dropped GRANT is invisible to every
   * unit test in this module -- a test double does not read the SQL string --
   * and only shows up here.
   */
  describe('the read models the application role calls', () => {
    const UNKNOWN_MEMBER = '00000000-0000-4000-8000-000000000000';
    const catalogue = (): ShopCatalogRepository => new ShopCatalogRepository(pool);

    it('lists the seeded catalogue with every amount still a string', async () => {
      const rows = await catalogue().catalog(UNKNOWN_MEMBER);
      expect(rows.length, 'migration 073 seeds the catalogue').toBeGreaterThan(0);

      const gloves = rows.find((row) => row.code === 'work_gloves');
      expect(gloves, 'work_gloves is seeded by 073').toBeDefined();
      expect(gloves?.category).toBe('general');
      expect(gloves?.purchase_limit).toBe('once');
      expect(gloves?.effect_kind).toBe('convenience');
      expect(gloves?.quantity, '073 seeds every line with unlimited stock').toBeNull();
      expect(gloves?.maintenance_cost).toBe('0');
      // A bigint that lost its ::text cast arrives as a JavaScript number and
      // rounds silently once the economy grows past a safe integer.
      expect(typeof gloves?.price, 'price must survive as a string').toBe('string');
      expect(BigInt(gloves?.price ?? '0') > 0n).toBe(true);
    });

    it('carries the weekly upkeep 075 attaches to a vehicle', async () => {
      const rows = await catalogue().catalog(UNKNOWN_MEMBER);
      const bicycle = rows.find((row) => row.code === 'used_bicycle');
      expect(bicycle, 'used_bicycle is seeded by 073').toBeDefined();
      expect(typeof bicycle?.maintenance_cost, 'upkeep must survive as a string').toBe('string');
      expect(
        BigInt(bicycle?.maintenance_cost ?? '0') > 0n,
        '075 gives the vehicles and leases an upkeep',
      ).toBe(true);
    });

    it('answers a member who holds nothing with an empty list', async () => {
      await expect(catalogue().holdings(UNKNOWN_MEMBER)).resolves.toEqual([]);
    });

    it('is refused by the purchase function itself, never by a missing grant', async () => {
      const error = await rejectionOf(() =>
        catalogue().purchase(randomUUID(), UNKNOWN_MEMBER, randomUUID(), 1),
      );
      expect(isMissingGrant(error), 'shop_purchase_catalog lost its grant').toBe(false);
      expect(code(error), 'a stranger buying nothing is a refused request').toBe('22023');
    });

    it('is refused by the consumption function itself, never by a missing grant', async () => {
      const error = await rejectionOf(() =>
        catalogue().use(randomUUID(), UNKNOWN_MEMBER, randomUUID()),
      );
      expect(isMissingGrant(error), 'shop_use_item lost its grant').toBe(false);
      expect(code(error), 'consuming an item nobody owns is a refused request').toBe('22023');
    });
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('buying and using', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
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

    /** A member with accounts, funded from the mint so they can buy anything. */
    const buyer = async (client: PoolClient, funds: number): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id)
         VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [id],
      );
      const { rows } = await client.query<{ cash: string; mint: string }>(
        `SELECT
           (SELECT id::text FROM public.accounts
            WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
           (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
        [id],
      );
      await client.query(
        `SELECT public.economy_post_transaction(
           $1, 'ADMIN_ADJUSTMENT', $2, NULL,
           jsonb_build_array(
             jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
           ),
           'test.funded', '{}'::jsonb)`,
        [randomUUID(), id, rows[0]?.mint, rows[0]?.cash, funds],
      );
      return id;
    };

    const item = async (client: PoolClient, itemCode: string): Promise<string> => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id::text FROM public.shop_catalog WHERE code = $1',
        [itemCode],
      );
      const id = rows[0]?.id;
      if (!id) throw new Error(`${itemCode} was not seeded`);
      return id;
    };

    const cash = async (client: PoolClient, actor: string): Promise<string> => {
      const { rows } = await client.query<{ available_amount: string }>(
        `SELECT balance_row.available_amount::text
         FROM public.account_balances AS balance_row
         JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
         WHERE account_row.owner_user_id = $1
           AND account_row.account_type = 'USER_CASH'::public.account_type`,
        [actor],
      );
      return rows[0]?.available_amount ?? '0';
    };

    it('takes the price, hands over the item and writes a receipt', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const gloves = await item(client, 'work_gloves'); // 150, limit `once`

        const { rows } = await client.query<{ amount: string; transaction_id: string }>(
          `SELECT purchase.amount::text, purchase.transaction_id::text
           FROM public.shop_purchase_catalog($1, $2, $3, 1) AS purchase`,
          [randomUUID(), actor, gloves],
        );
        expect(rows[0]?.amount).toBe('150');
        expect(rows[0]?.transaction_id).toBeTruthy();
        expect(await cash(client, actor)).toBe('850');

        const { rows: held } = await client.query<{ quantity: number }>(
          'SELECT quantity FROM public.user_items WHERE user_id = $1 AND catalog_id = $2',
          [actor, gloves],
        );
        expect(held[0]?.quantity).toBe(1);
      });
    });

    it('reports the stored amount on a replay, not the quantity the caller repeated', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit'); // 80, limit `unlimited`
        const key = randomUUID();

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 2)', [
          key,
          actor,
          kit,
        ]);
        const { rows } = await client.query<{ amount: string; replayed: boolean }>(
          `SELECT purchase.amount::text, purchase.replayed
           FROM public.shop_purchase_catalog($1, $2, $3, 5) AS purchase`,
          [key, actor, kit],
        );
        expect(rows[0]?.replayed).toBe(true);
        expect(rows[0]?.amount, 'a replay must report what was charged').toBe('160');
        expect(await cash(client, actor)).toBe('840');
      });
    });

    it('refuses a stranger reusing a receipt key', async () => {
      await rolledBack(async (client) => {
        const owner = await buyer(client, 1000);
        const stranger = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit');
        const key = randomUUID();

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          key,
          owner,
          kit,
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
            key,
            stranger,
            kit,
          ]),
        );
        expect(code(error)).toBe('28000');
      });
    });

    it('holds a once-only item to one', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const gloves = await item(client, 'work_gloves');

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          randomUUID(),
          actor,
          gloves,
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
            randomUUID(),
            actor,
            gloves,
          ]),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('holds a daily item to its daily count', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const drink = await item(client, 'energy_drink'); // 40, limit `daily_2`

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 2)', [
          randomUUID(),
          actor,
          drink,
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
            randomUUID(),
            actor,
            drink,
          ]),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('consumes one of a convenience item, once per key', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit');
        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 3)', [
          randomUUID(),
          actor,
          kit,
        ]);

        const key = randomUUID();
        const { rows } = await client.query<{ remaining_quantity: number }>(
          `SELECT used.remaining_quantity FROM public.shop_use_item($1, $2, $3) AS used`,
          [key, actor, kit],
        );
        expect(rows[0]?.remaining_quantity).toBe(2);

        const { rows: replay } = await client.query<{
          remaining_quantity: number;
          replayed: boolean;
        }>(`SELECT used.remaining_quantity, used.replayed FROM public.shop_use_item($1, $2, $3) AS used`, [
          key,
          actor,
          kit,
        ]);
        expect(replay[0]?.replayed).toBe(true);
        expect(replay[0]?.remaining_quantity).toBe(2);
      });
    });

    it('refuses to consume a decoration', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const tag = await item(client, 'profile_tag'); // decoration
        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          randomUUID(),
          actor,
          tag,
        ]);

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.shop_use_item($1, $2, $3)', [
            randomUUID(),
            actor,
            tag,
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('rejects a forbidden effect key however deeply it is nested', async () => {
      await rolledBack(async (client) => {
        // `?|` looked only at the top level, so this shape walked through the
        // constraint that exists to stop it.
        const error = await rejectionOf(() =>
          client.query(
            `UPDATE public.shop_catalog
             SET effect = '{"bonus": {"casinoOdds": 2}}'::jsonb
             WHERE code = 'work_gloves'`,
          ),
        );
        expect(code(error)).toBe('23514');
      });
    });

    it('lists a bought item under its buyer and under nobody else', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const stranger = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit');

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 2)', [
          randomUUID(),
          actor,
          kit,
        ]);

        const { rows } = await client.query<{ code: string; quantity: number }>(
          'SELECT held.code, held.quantity FROM public.shop_my_items($1) AS held',
          [actor],
        );
        expect(rows).toHaveLength(1);
        expect(rows[0]?.code).toBe('repair_kit');
        expect(rows[0]?.quantity).toBe(2);

        const { rows: theirs } = await client.query(
          'SELECT * FROM public.shop_my_items($1) AS held',
          [stranger],
        );
        expect(theirs, 'shop_my_items filters by the actor it is given').toHaveLength(0);
      });
    });

    it('drops an item from the holdings when the last one is consumed', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit');
        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          randomUUID(),
          actor,
          kit,
        ]);
        await client.query('SELECT * FROM public.shop_use_item($1, $2, $3)', [
          randomUUID(),
          actor,
          kit,
        ]);

        // The row survives at quantity zero; the read model is what hides it,
        // so a page never offers a member an item they have already used up.
        const { rows } = await client.query('SELECT * FROM public.shop_my_items($1) AS held', [
          actor,
        ]);
        expect(rows).toHaveLength(0);
      });
    });

    it('hides an item the catalogue has switched off', async () => {
      await rolledBack(async (client) => {
        await client.query(
          "UPDATE public.shop_catalog SET active = false WHERE code = 'work_gloves'",
        );
        const { rows } = await client.query(
          `SELECT * FROM public.shop_catalog_list($1) AS listing WHERE listing.code = 'work_gloves'`,
          [randomUUID()],
        );
        expect(rows).toHaveLength(0);
      });
    });

    it('hides an item whose sale window has closed, and refuses to sell it', async () => {
      await rolledBack(async (client) => {
        const actor = await buyer(client, 1000);
        const kit = await item(client, 'repair_kit');
        await client.query(
          `UPDATE public.shop_inventory
           SET ends_at = clock_timestamp() - interval '1 day'
           WHERE catalog_id = $1`,
          [kit],
        );

        const { rows } = await client.query(
          `SELECT * FROM public.shop_catalog_list($1) AS listing WHERE listing.code = 'repair_kit'`,
          [actor],
        );
        expect(rows).toHaveLength(0);

        // The listing and the purchase must agree. An item the catalogue no
        // longer shows and the purchase still sells is the worse of the two
        // failures, because only the second one takes money.
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
            randomUUID(),
            actor,
            kit,
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });
  });
});
