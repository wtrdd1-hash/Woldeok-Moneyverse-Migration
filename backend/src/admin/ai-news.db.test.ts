import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 135, executed: the newsroom's tables stay behind functions, an
 * operator is required, a batch survives a reload, and the continuity
 * guard holds.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the AI newsroom against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the settings, batches and scenarios unreadable by the application role', async () => {
    for (const table of ['ai_news_settings', 'ai_news_batches', 'ai_news_scenarios', 'ai_news_runs']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('refuses every function to a caller with no operator role', async () => {
    const settings = await rejectionOf(() => pool.query('SELECT * FROM public.ai_news_settings_get($1)', [UNKNOWN]));
    expect(code(settings)).toBe('42501');
    const credential = await rejectionOf(() => pool.query('SELECT * FROM public.ai_news_settings_credential($1)', [UNKNOWN]));
    expect(code(credential)).toBe('42501');
    const context = await rejectionOf(() => pool.query('SELECT public.ai_news_context($1)', [UNKNOWN]));
    expect(code(context)).toBe('42501');
    const latest = await rejectionOf(() => pool.query('SELECT * FROM public.ai_news_batch_latest($1)', [UNKNOWN]));
    expect(code(latest)).toBe('42501');
    const run = await rejectionOf(() => pool.query('SELECT * FROM public.ai_news_run_latest($1)', [UNKNOWN]));
    expect(code(run)).toBe('42501');
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what an operator can do', () => {
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

    const operator = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'operator')", [id]);
      return id;
    };

    const listing = async (client: PoolClient, symbol: string): Promise<string> => {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO public.virtual_stocks (symbol, name, description, initial_price, current_price, day_open_price)
         VALUES ($1, 'Newsroom test', '', 1000, 1000, 1000) RETURNING id`,
        [symbol],
      );
      return rows[0]!.id;
    };

    const dynamics = async (client: PoolClient, stockId: string): Promise<void> => {
      await client.query(
        `INSERT INTO public.virtual_stock_dynamics (stock_id, price_exact, fair_value, trend_bps, vol_bps)
         VALUES ($1, 1000, 1000, 0, 300)`,
        [stockId],
      );
    };

    const scenarios = (symbol: string) => [
      {
        effects: [{ stock_symbol: symbol, direction: 'up', strength: 2 }],
        hours: 6,
        headline: '신제품 발표',
        body: '기대가 높다.',
        rationale: '지난 흐름을 잇는다.',
      },
      {
        effects: [{ stock_symbol: null, direction: 'down', strength: 1 }],
        hours: 12,
        headline: '시장 전체 관망세',
        body: '',
        rationale: '',
      },
    ];

    it('keeps one run at a time and closes it with a batch or a reason (149)', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const key = randomUUID();
        const begin = async (idempotencyKey: string) =>
          (await client.query<{ run_id: string; started: boolean }>(
            'SELECT run_id::text AS run_id, started FROM public.ai_news_run_begin($1,$2,$3)',
            [idempotencyKey, actor, '조용하게'],
          )).rows[0];

        const first = await begin(key);
        expect(first?.started).toBe(true);
        // The same key is the same run, and a different key while one is open
        // joins it rather than starting a second.
        expect(await begin(key)).toMatchObject({ run_id: first!.run_id, started: false });
        expect(await begin(randomUUID())).toMatchObject({ run_id: first!.run_id, started: false });

        const open = await client.query<{ running: boolean; batch_id: string | null }>(
          'SELECT running, batch_id::text AS batch_id FROM public.ai_news_run_latest($1)',
          [actor],
        );
        expect(open.rows[0]).toMatchObject({ running: true, batch_id: null });

        const closed = await client.query<{ finished: boolean }>(
          'SELECT public.ai_news_run_finish($1,$2,$3,$4,$5) AS finished',
          [actor, first!.run_id, null, 'ai_news_model_unreachable', 'nothing answered at that address'],
        );
        expect(closed.rows[0]?.finished).toBe(true);

        const after = await client.query<{ running: boolean; failure_code: string; failure_detail: string }>(
          'SELECT running, failure_code, failure_detail FROM public.ai_news_run_latest($1)',
          [actor],
        );
        expect(after.rows[0]).toMatchObject({
          running: false,
          failure_code: 'ai_news_model_unreachable',
          failure_detail: 'nothing answered at that address',
        });

        // Closing a closed run is a replay, not a second close.
        const twice = await client.query<{ finished: boolean }>(
          'SELECT public.ai_news_run_finish($1,$2,$3,$4,$5) AS finished',
          [actor, first!.run_id, null, 'ai_news_model_unusable', ''],
        );
        expect(twice.rows[0]?.finished).toBe(false);
      });
    });

    it('stores the settings without the key in the clear and reads them back masked', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        await client.query('SELECT public.ai_news_settings_set($1,$2,$3,$4,$5,$6,$7)', [
          randomUUID(), actor, 'https://api.example', 'gpt-4o-mini', 'c2VhbGVk', 'test', '9876',
        ]);
        const { rows } = await client.query<{ api_base_url: string; has_key: boolean; api_key_hint: string }>(
          'SELECT api_base_url, has_key, api_key_hint FROM public.ai_news_settings_get($1)',
          [actor],
        );
        expect(rows[0]).toMatchObject({ api_base_url: 'https://api.example', has_key: true, api_key_hint: '9876' });

        // The address changes and the key stays.
        await client.query('SELECT public.ai_news_settings_set($1,$2,$3,$4,$5,$6,$7)', [
          randomUUID(), actor, 'https://proxy.example', 'gpt-4o-mini', null, null, null,
        ]);
        const again = await client.query<{ api_key_sealed: string; api_base_url: string }>(
          'SELECT api_key_sealed, api_base_url FROM public.ai_news_settings_credential($1)',
          [actor],
        );
        expect(again.rows[0]).toEqual({ api_key_sealed: 'c2VhbGVk', api_base_url: 'https://proxy.example' });
      });
    });

    it('builds a context that names every listed stock and the clock', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const symbol = `N${randomUUID().slice(0, 6).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        await listing(client, symbol);
        const { rows } = await client.query<{ context: { stocks: { symbol: string }[]; now_seoul: string } }>(
          'SELECT public.ai_news_context($1) AS context',
          [actor],
        );
        expect(rows[0]?.context.stocks.map((stock) => stock.symbol)).toContain(symbol);
        expect(rows[0]?.context.now_seoul).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      });
    });

    it('keeps a batch across reads, supersedes the last one on the next, and refuses an unknown symbol', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const symbol = `N${randomUUID().slice(0, 6).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        await listing(client, symbol);

        const first = await client.query<{ batch_id: string; replayed: boolean }>(
          'SELECT batch_id, replayed FROM public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)',
          [randomUUID(), actor, '조용하게', 'gpt-4o-mini', '{}', JSON.stringify(scenarios(symbol))],
        );
        expect(first.rows[0]?.replayed).toBe(false);

        const latest = await client.query<{ batch_id: string; scenarios: { ordinal: number; symbol: string | null; status: string }[] }>(
          'SELECT batch_id, scenarios FROM public.ai_news_batch_latest($1)',
          [actor],
        );
        expect(latest.rows[0]?.batch_id).toBe(first.rows[0]?.batch_id);
        expect(latest.rows[0]?.scenarios.map((s) => [s.ordinal, s.symbol, s.status])).toEqual([
          [1, symbol, 'proposed'],
          [2, null, 'proposed'],
        ]);

        const second = await client.query<{ batch_id: string }>(
          'SELECT batch_id FROM public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)',
          [randomUUID(), actor, '', 'gpt-4o-mini', '{}', JSON.stringify(scenarios(symbol).slice(0, 1))],
        );
        const old = await client.query<{ status: string }>(
          'SELECT status FROM public.ai_news_scenarios WHERE batch_id = $1',
          [first.rows[0]?.batch_id],
        );
        expect(old.rows.map((row) => row.status)).toEqual(['superseded', 'superseded']);
        const now = await client.query<{ batch_id: string }>('SELECT batch_id FROM public.ai_news_batch_latest($1)', [actor]);
        expect(now.rows[0]?.batch_id).toBe(second.rows[0]?.batch_id);

        await client.query('SAVEPOINT unknown_symbol');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [
            randomUUID(), actor, '', 'gpt-4o-mini', '{}', JSON.stringify(scenarios('NOPE')),
          ]),
        );
        expect(code(error)).toBe('22023');
        await client.query('ROLLBACK TO SAVEPOINT unknown_symbol');
      });
    });

    it('publishes a chosen scenario as an AI-sourced event with the values the operator settled on, once', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const symbol = `N${randomUUID().slice(0, 6).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        const stock = await listing(client, symbol);
        await dynamics(client, stock);
        await client.query('SELECT public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [
          randomUUID(), actor, '', 'gpt-4o-mini', '{}', JSON.stringify(scenarios(symbol)),
        ]);
        const { rows } = await client.query<{ scenarios: { id: string }[] }>('SELECT scenarios FROM public.ai_news_batch_latest($1)', [actor]);
        const chosen = rows[0]!.scenarios[0]!.id;
        const legs = JSON.stringify([{ stock_id: stock, direction: 'up', strength: 1 }]);

        const key = randomUUID();
        const published = await client.query<{ event_id: string; published: number; replayed: boolean }>(
          'SELECT event_id, published, replayed FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7::jsonb)',
          [key, actor, chosen, 3, '다듬은 제목', '다듬은 본문', legs],
        );
        expect(published.rows[0]).toMatchObject({ published: 1, replayed: false });
        const again = await client.query<{ event_id: string; published: number; replayed: boolean }>(
          'SELECT event_id, published, replayed FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7::jsonb)',
          [key, actor, chosen, 3, '다듬은 제목', '다듬은 본문', legs],
        );
        expect(again.rows[0]).toEqual({ event_id: published.rows[0]?.event_id, published: 1, replayed: true });

        const event = await client.query<{ source: string; strength: number; headline: string }>(
          'SELECT source, strength, headline FROM public.virtual_stock_market_events WHERE id = $1',
          [published.rows[0]?.event_id],
        );
        expect(event.rows[0]).toEqual({ source: 'ai', strength: 1, headline: '다듬은 제목' });

        // And it landed: 소폭 is 80 basis points on a 1,000 WLD stock (152).
        const priced = await client.query<{ current_price: string }>(
          'SELECT current_price FROM public.virtual_stocks WHERE id = $1',
          [stock],
        );
        expect(Number(priced.rows[0]?.current_price)).toBe(1_008);

        const running = await client.query<{ id: string }>('SELECT id FROM public.stock_market_events_active()');
        expect(running.rows.map((row) => row.id)).toContain(published.rows[0]?.event_id);
      });
    });

    it('publishes one event per stock a story moves, and none for the ones it only names (153)', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const winner = `W${randomUUID().slice(0, 5).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        const loser = `L${randomUUID().slice(0, 5).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        const winnerId = await listing(client, winner);
        const loserId = await listing(client, loser);
        await dynamics(client, winnerId);
        await dynamics(client, loserId);

        await client.query('SELECT public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [
          randomUUID(), actor, '', 'gpt-4o-mini', '{}', JSON.stringify([{
            effects: [
              { stock_symbol: winner, direction: 'up', strength: 2 },
              { stock_symbol: loser, direction: 'down', strength: 1 },
              { stock_symbol: null, direction: 'none', strength: 1 },
            ],
            hours: 6,
            headline: '원자재 값이 내렸다',
            body: '사는 쪽은 웃고 파는 쪽은 운다.',
            rationale: '어제의 공급 소식을 잇는다.',
          }]),
        ]);

        const { rows } = await client.query<{
          scenarios: { id: string; effects: { symbol: string | null; direction: string; strength: number }[] }[];
        }>('SELECT scenarios FROM public.ai_news_batch_latest($1)', [actor]);
        const scenario = rows[0]!.scenarios[0]!;
        expect(scenario.effects.map((effect) => [effect.symbol, effect.direction, effect.strength])).toEqual([
          [winner, 'up', 2],
          [loser, 'down', 1],
          [null, 'none', 1],
        ]);

        const published = await client.query<{ event_id: string; published: number }>(
          'SELECT event_id, published FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7::jsonb)',
          [randomUUID(), actor, scenario.id, 6, '원자재 값이 내렸다', '', JSON.stringify([
            { stock_id: winnerId, direction: 'up', strength: 2 },
            { stock_id: loserId, direction: 'down', strength: 1 },
            { stock_id: null, direction: 'none', strength: 1 },
          ])],
        );
        expect(published.rows[0]?.published).toBe(2);

        // Two events under one headline, one each way, and the third stock
        // untouched -- 153's whole point.
        const events = await client.query<{ stock_id: string; direction: string }>(
          `SELECT stock_id::text AS stock_id, direction FROM public.virtual_stock_market_events
           WHERE headline = '원자재 값이 내렸다' ORDER BY direction`,
        );
        expect(events.rows).toEqual([
          { stock_id: loserId, direction: 'down' },
          { stock_id: winnerId, direction: 'up' },
        ]);

        const prices = await client.query<{ id: string; current_price: string }>(
          'SELECT id::text AS id, current_price FROM public.virtual_stocks WHERE id = ANY($1::uuid[]) ORDER BY id',
          [[winnerId, loserId]],
        );
        const priced = new Map(prices.rows.map((row) => [row.id, Number(row.current_price)]));
        expect(priced.get(winnerId)).toBe(1_025);
        expect(priced.get(loserId)).toBe(992);

        const legs = await client.query<{ published: number }>(
          `SELECT count(published_event_id)::integer AS published
           FROM public.ai_news_scenario_effects WHERE scenario_id = $1`,
          [scenario.id],
        );
        expect(legs.rows[0]?.published).toBe(2);
      });
    });

    it('refuses a strong reversal within six hours of the opposite news, and discards once', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const symbol = `N${randomUUID().slice(0, 6).replace(/[^0-9a-f]/g, '').toUpperCase()}`;
        const stock = await listing(client, symbol);
        await client.query('SELECT public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)', [
          randomUUID(), actor, stock, 'down', 2, 3, '악재가 났다', '', 'operator',
        ]);
        await client.query('SELECT public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [
          randomUUID(), actor, '', 'gpt-4o-mini', '{}', JSON.stringify(scenarios(symbol)),
        ]);
        const { rows } = await client.query<{ scenarios: { id: string }[] }>('SELECT scenarios FROM public.ai_news_batch_latest($1)', [actor]);
        const [first, second] = rows[0]!.scenarios;

        await client.query('SAVEPOINT reversal');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7::jsonb)', [
            randomUUID(), actor, first!.id, 6, '강력 반전', '',
            JSON.stringify([{ stock_id: stock, direction: 'up', strength: 3 }]),
          ]),
        );
        expect(code(error)).toBe('22023');
        expect(String((error as { message?: string }).message)).toContain('reversal');
        await client.query('ROLLBACK TO SAVEPOINT reversal');

        // A gentler follow-up is allowed.
        const gentle = await client.query<{ event_id: string }>(
          'SELECT event_id FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7::jsonb)',
          [randomUUID(), actor, first!.id, 6, '조심스러운 반등', '',
           JSON.stringify([{ stock_id: stock, direction: 'up', strength: 1 }])],
        );
        expect(gentle.rows[0]?.event_id).toBeTruthy();

        const discarded = await client.query<{ d: boolean }>('SELECT public.ai_news_scenario_discard($1,$2,$3) AS d', [randomUUID(), actor, second!.id]);
        expect(discarded.rows[0]?.d).toBe(true);
        const twice = await client.query<{ d: boolean }>('SELECT public.ai_news_scenario_discard($1,$2,$3) AS d', [randomUUID(), actor, second!.id]);
        expect(twice.rows[0]?.d).toBe(false);
      });
    });
  });
});
