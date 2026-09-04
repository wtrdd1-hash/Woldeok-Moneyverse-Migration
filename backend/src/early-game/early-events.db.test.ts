import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 103, executed, and the four things it must not get wrong.
 *
 * The feature is a daily draw with a reward behind it, so every way it could
 * be farmed is a way a member could mint. The cases below are those ways:
 * re-reading until the event changes, claiming twice, claiming an event the
 * hash did not deal, and having a gift recorded as a purchase -- which would
 * fill 101's 초보 도구 도감 and award the title behind it.
 *
 * The catalogue is narrowed inside the transaction where a specific event is
 * needed. That is what makes these deterministic: with one active row the
 * draw has one answer, and the test is about the claim rather than about
 * which of seven rows a uuid happened to hash to.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL)('the early game events against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * 103 works around the revoke rather than relaxing it, so the revoke is
   * what this asserts first. A later change that made the screen easier by
   * granting SELECT on the claims would let one injection read who claimed
   * what, and granting it on the catalogue would publish the draw's inputs.
   */
  it('keeps the event tables unreadable by the application role', async () => {
    for (const table of ['early_event_catalog', 'early_event_claims', 'early_first_day_steps']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('grants the two reads and the claim, and never the draw', async () => {
    const granted = await pool.query<{ signature: string; has: boolean }>(
      `SELECT signature, has_function_privilege('moneyverse_app', signature, 'EXECUTE') AS has
       FROM unnest($1::text[]) AS signature`,
      [
        [
          'public.early_event_today(uuid)',
          'public.early_event_claim(uuid, uuid, date)',
          'public.early_first_day_flow(uuid)',
          'public.early_event_draw(uuid, date)',
        ],
      ],
    );
    const held = new Map(granted.rows.map((row) => [row.signature, row.has]));
    expect(held.get('public.early_event_today(uuid)')).toBe(true);
    expect(held.get('public.early_event_claim(uuid, uuid, date)')).toBe(true);
    expect(held.get('public.early_first_day_flow(uuid)')).toBe(true);
    // The draw takes a date. Granted, it would answer "what does this member
    // get tomorrow", and a member who knows that has a reason to wait.
    expect(held.get('public.early_event_draw(uuid, date)')).toBe(false);
  });

  /**
   * The claim's signature is the anti-abuse property, so it is asserted as a
   * signature. An event argument added later would compile, deploy and read
   * perfectly well, and would hand a member the choice this whole design
   * exists to withhold.
   */
  it('takes no event argument on the claim', async () => {
    const signature = await pool.query<{ args: string }>(
      `SELECT pg_get_function_arguments(function_row.oid) AS args
       FROM pg_catalog.pg_proc AS function_row
       JOIN pg_catalog.pg_namespace AS schema_row ON schema_row.oid = function_row.pronamespace
       WHERE schema_row.nspname = 'public' AND function_row.proname = 'early_event_claim'`,
    );
    expect(signature.rows[0]?.args).toBe('p_key uuid, p_actor uuid, p_event_date date');
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what a member can and cannot do with it', () => {
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

    /** An active member with the cash account the claim mints into. */
    const member = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [id],
      );
      return id;
    };

    /** The day the functions mean, named by the database rather than by Node. */
    const seoulToday = async (client: PoolClient): Promise<string> => {
      const day = await client.query<{ day: string }>(
        `SELECT (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text AS day`,
      );
      const value = day.rows[0]?.day;
      if (value === undefined) throw new Error('the database did not answer with a Seoul date');
      return value;
    };

    /** Narrows the catalogue to one event, so the draw has one answer. */
    const onlyEvent = async (client: PoolClient, code: string): Promise<void> => {
      await client.query('UPDATE public.early_event_catalog SET active = (code = $1)', [code]);
    };

    /** A job to receive experience -- what a paid work receipt would have left. */
    const withJob = async (client: PoolClient, actor: string): Promise<void> => {
      await client.query(
        `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
         VALUES ($1, 'carrier', 40, 1)`,
        [actor],
      );
    };

    it('deals the same event however many times the screen is read', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const read = async (): Promise<string | undefined> => {
          const board = await client.query<{ event_code: string }>(
            'SELECT event_code FROM public.early_event_today($1)',
            [actor],
          );
          return board.rows[0]?.event_code;
        };
        const first = await read();
        expect(first).toBeDefined();
        expect(await read()).toBe(first);
        expect(await read()).toBe(first);
      });
    });

    // The other half of the same property: stable within a day, but not the
    // same event for ever, or the feature is one event with a date on it.
    it('deals a different event on other days', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const drawn = await client.query<{ code: string }>(
          `SELECT public.early_event_draw($1, day::date) AS code
           FROM generate_series(date '2026-01-01', date '2026-01-21', interval '1 day') AS day`,
          [actor],
        );
        expect(new Set(drawn.rows.map((row) => row.code)).size).toBeGreaterThan(1);
      });
    });

    it('pays the drawn event through the ledger and records the receipt', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await onlyEvent(client, 'lost_and_found');
        const today = await seoulToday(client);

        const receipt = await client.query<{
          event_code: string;
          reward_amount: string;
          transaction_id: string | null;
          replayed: boolean;
        }>(
          `SELECT event_code, reward_amount::text, transaction_id::text, replayed
           FROM public.early_event_claim($1, $2, $3::date)`,
          [randomUUID(), actor, today],
        );

        expect(receipt.rows[0]?.event_code).toBe('lost_and_found');
        expect(receipt.rows[0]?.reward_amount).toBe('40');
        expect(receipt.rows[0]?.replayed).toBe(false);

        const balance = await client.query<{ balance: string }>(
          `SELECT balance_row.available_amount::text AS balance
           FROM public.account_balances AS balance_row
           JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
           WHERE account_row.owner_user_id = $1`,
          [actor],
        );
        expect(balance.rows[0]?.balance).toBe('40');

        const stored = await client.query<{ transaction_id: string | null }>(
          'SELECT transaction_id::text FROM public.early_event_claims WHERE user_id = $1',
          [actor],
        );
        expect(stored.rows[0]?.transaction_id).toBe(receipt.rows[0]?.transaction_id);
      });
    });

    it('pays once when the same request arrives twice', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await onlyEvent(client, 'rainy_day');
        const today = await seoulToday(client);
        const key = randomUUID();

        await client.query('SELECT * FROM public.early_event_claim($1, $2, $3::date)', [
          key,
          actor,
          today,
        ]);
        const replay = await client.query<{ replayed: boolean; reward_amount: string }>(
          `SELECT replayed, reward_amount::text FROM public.early_event_claim($1, $2, $3::date)`,
          [key, actor, today],
        );

        expect(replay.rows[0]?.replayed).toBe(true);
        expect(replay.rows[0]?.reward_amount).toBe('30');

        const balance = await client.query<{ balance: string }>(
          `SELECT balance_row.available_amount::text AS balance
           FROM public.account_balances AS balance_row
           JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
           WHERE account_row.owner_user_id = $1`,
          [actor],
        );
        expect(balance.rows[0]?.balance).toBe('30');
      });
    });

    it('refuses a second claim on the same day, and keeps the first', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await onlyEvent(client, 'rainy_day');
        const today = await seoulToday(client);

        await client.query('SELECT * FROM public.early_event_claim($1, $2, $3::date)', [
          randomUUID(),
          actor,
          today,
        ]);

        // The savepoint is taken BEFORE the statement that raises. A raise
        // aborts the transaction, and a savepoint taken afterwards fails with
        // 25P02 -- that exact bug shipped here once already.
        await client.query('SAVEPOINT second_claim');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.early_event_claim($1, $2, $3::date)', [
            randomUUID(),
            actor,
            today,
          ]),
        );
        await client.query('ROLLBACK TO SAVEPOINT second_claim');

        expect((error as { code?: string }).code).toBe('23505');

        const claims = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.early_event_claims WHERE user_id = $1',
          [actor],
        );
        expect(claims.rows[0]?.count).toBe('1');
      });
    });

    it('refuses a day that is not today in Seoul', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const error = await rejectionOf(() =>
          client.query(
            `SELECT * FROM public.early_event_claim($1, $2,
               ((clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date + 1))`,
            [randomUUID(), actor],
          ),
        );
        expect((error as { code?: string }).code).toBe('22023');
      });
    });

    /**
     * The gift that must not look like a purchase. 101 fills the 초보 도구
     * 도감 from `shop_purchases` and a trigger awards the title when the last
     * page lands, so an item handed over here has to reach `user_items` and
     * nothing else.
     */
    it('hands over an item without recording a purchase', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await onlyEvent(client, 'lucky_box');
        const today = await seoulToday(client);

        await client.query('SELECT * FROM public.early_event_claim($1, $2, $3::date)', [
          randomUUID(),
          actor,
          today,
        ]);

        const held = await client.query<{ code: string; quantity: number }>(
          `SELECT item_row.code, holding_row.quantity
           FROM public.user_items AS holding_row
           JOIN public.shop_catalog AS item_row ON item_row.id = holding_row.catalog_id
           WHERE holding_row.user_id = $1`,
          [actor],
        );
        expect(held.rows).toHaveLength(1);
        expect(held.rows[0]?.code).toBe('energy_drink');
        expect(held.rows[0]?.quantity).toBe(2);

        const purchases = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.shop_purchases WHERE user_id = $1',
          [actor],
        );
        expect(purchases.rows[0]?.count).toBe('0');
      });
    });

    it('refuses an experience-only event until work has been paid, then pays it', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await onlyEvent(client, 'bulk_order');
        const today = await seoulToday(client);

        await client.query('SAVEPOINT before_any_work');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.early_event_claim($1, $2, $3::date)', [
            randomUUID(),
            actor,
            today,
          ]),
        );
        await client.query('ROLLBACK TO SAVEPOINT before_any_work');

        expect((error as { code?: string }).code).toBe('22023');

        const board = await client.query<{ claim_block: string | null }>(
          'SELECT claim_block FROM public.early_event_today($1)',
          [actor],
        );
        expect(board.rows[0]?.claim_block).toBe('needs_work');

        await withJob(client, actor);
        const receipt = await client.query<{ experience_amount: string }>(
          `SELECT experience_amount::text FROM public.early_event_claim($1, $2, $3::date)`,
          [randomUUID(), actor, today],
        );
        expect(receipt.rows[0]?.experience_amount).toBe('20');

        const progress = await client.query<{ experience: string }>(
          `SELECT experience::text FROM public.user_job_progress
           WHERE user_id = $1 AND job_type = 'carrier'`,
          [actor],
        );
        expect(progress.rows[0]?.experience).toBe('60');
      });
    });

    it('refuses a board and a flow for anyone but an active member', async () => {
      await rolledBack(async (client) => {
        for (const call of ['early_event_today', 'early_first_day_flow']) {
          await client.query(`SAVEPOINT stranger_${call}`);
          const error = await rejectionOf(() =>
            client.query(`SELECT * FROM public.${call}($1)`, [randomUUID()]),
          );
          await client.query(`ROLLBACK TO SAVEPOINT stranger_${call}`);
          expect((error as { code?: string }).code, call).toBe('28000');
        }
      });
    });

    /**
     * 16.1 asks for five job trials and 070 seeds four jobs' worth of tasks,
     * so the step asks for what the catalogue can actually produce. A target
     * nobody could reach is the failure 101 dropped a collection page over.
     */
    it('asks the job-trial step for no more trials than the catalogue can offer', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const flow = await client.query<{
          step_code: string;
          step_verified: boolean;
          step_target: string;
        }>(
          'SELECT step_code, step_verified, step_target::text FROM public.early_first_day_flow($1)',
          [actor],
        );
        const jobs = await client.query<{ count: string }>(
          `SELECT count(DISTINCT job_type)::text AS count
           FROM public.work_task_catalog WHERE active`,
        );

        expect(flow.rows).toHaveLength(7);
        expect(flow.rows.filter((row) => !row.step_verified)).toHaveLength(2);
        // The step's own target is 16.1's five (103 seeds it so), clamped to
        // what the catalogue can offer. It equalled the catalogue's count only
        // while the catalogue had fewer than five careers; 115 seeds ten, and
        // five of ten is the step asking for what was always meant.
        expect(flow.rows.find((row) => row.step_code === 'job_sampler')?.step_target).toBe(
          String(Math.min(5, Number(jobs.rows[0]?.count))),
        );
      });
    });
  });
});
