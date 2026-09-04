import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 127, executed: the newsroom's tables stay behind functions, an
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
    for (const table of ['ai_news_settings', 'ai_news_batches', 'ai_news_scenarios']) {
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

    const scenarios = (symbol: string) => [
      { stock_symbol: symbol, direction: 'up', strength: 2, hours: 6, headline: '신제품 발표', body: '기대가 높다.', rationale: '지난 흐름을 잇는다.' },
      { stock_symbol: null, direction: 'down', strength: 1, hours: 12, headline: '시장 전체 관망세', body: '', rationale: '' },
    ];

    it('stores the settings without the key in the clear and reads them back masked', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        await client.query('SELECT public.ai_news_settings_set($1,$2,$3,$4,$5,$6,$7)', [
          randomUUID(), actor, 'https://api.example', 'claude-opus-5', 'c2VhbGVk', 'test', '9876',
        ]);
        const { rows } = await client.query<{ api_base_url: string; has_key: boolean; api_key_hint: string }>(
          'SELECT api_base_url, has_key, api_key_hint FROM public.ai_news_settings_get($1)',
          [actor],
        );
        expect(rows[0]).toMatchObject({ api_base_url: 'https://api.example', has_key: true, api_key_hint: '9876' });

        // The address changes and the key stays.
        await client.query('SELECT public.ai_news_settings_set($1,$2,$3,$4,$5,$6,$7)', [
          randomUUID(), actor, 'https://proxy.example', 'claude-opus-5', null, null, null,
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
          [randomUUID(), actor, '조용하게', 'claude-opus-5', '{}', JSON.stringify(scenarios(symbol))],
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
          [randomUUID(), actor, '', 'claude-opus-5', '{}', JSON.stringify(scenarios(symbol).slice(0, 1))],
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
            randomUUID(), actor, '', 'claude-opus-5', '{}', JSON.stringify(scenarios('NOPE')),
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
        await listing(client, symbol);
        await client.query('SELECT public.ai_news_batch_create($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [
          randomUUID(), actor, '', 'claude-opus-5', '{}', JSON.stringify(scenarios(symbol)),
        ]);
        const { rows } = await client.query<{ scenarios: { id: string }[] }>('SELECT scenarios FROM public.ai_news_batch_latest($1)', [actor]);
        const chosen = rows[0]!.scenarios[0]!.id;

        const key = randomUUID();
        const published = await client.query<{ event_id: string; replayed: boolean }>(
          'SELECT event_id, replayed FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7,$8)',
          [key, actor, chosen, 'up', 1, 3, '다듬은 제목', '다듬은 본문'],
        );
        expect(published.rows[0]?.replayed).toBe(false);
        const again = await client.query<{ event_id: string; replayed: boolean }>(
          'SELECT event_id, replayed FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7,$8)',
          [key, actor, chosen, 'up', 1, 3, '다듬은 제목', '다듬은 본문'],
        );
        expect(again.rows[0]).toEqual({ event_id: published.rows[0]?.event_id, replayed: true });

        const event = await client.query<{ source: string; strength: number; headline: string }>(
          'SELECT source, strength, headline FROM public.virtual_stock_market_events WHERE id = $1',
          [published.rows[0]?.event_id],
        );
        expect(event.rows[0]).toEqual({ source: 'ai', strength: 1, headline: '다듬은 제목' });

        const running = await client.query<{ id: string }>('SELECT id FROM public.stock_market_events_active()');
        expect(running.rows.map((row) => row.id)).toContain(published.rows[0]?.event_id);
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
          randomUUID(), actor, '', 'claude-opus-5', '{}', JSON.stringify(scenarios(symbol)),
        ]);
        const { rows } = await client.query<{ scenarios: { id: string }[] }>('SELECT scenarios FROM public.ai_news_batch_latest($1)', [actor]);
        const [first, second] = rows[0]!.scenarios;

        await client.query('SAVEPOINT reversal');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7,$8)', [
            randomUUID(), actor, first!.id, 'up', 3, 6, '강력 반전', '',
          ]),
        );
        expect(code(error)).toBe('22023');
        expect(String((error as { message?: string }).message)).toContain('reversal');
        await client.query('ROLLBACK TO SAVEPOINT reversal');

        // A gentler follow-up is allowed.
        const gentle = await client.query<{ event_id: string }>(
          'SELECT event_id FROM public.ai_news_scenario_publish($1,$2,$3,$4,$5,$6,$7,$8)',
          [randomUUID(), actor, first!.id, 'up', 1, 6, '조심스러운 반등', ''],
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
