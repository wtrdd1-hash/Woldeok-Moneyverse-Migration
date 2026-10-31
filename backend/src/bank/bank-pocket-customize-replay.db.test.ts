import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const DISPOSABLE = process.env.MONEYVERSE_DISPOSABLE_PG === '1';

type Receipt = {
  pocket_id: string;
  theme_color: string;
  icon_code: string;
  cost_wld: string;
  remaining_cash: string;
};

function errorCode(error: unknown): string | undefined {
  return error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

async function expectRejected(client: PoolClient, values: unknown[], code: string): Promise<void> {
  await client.query('SAVEPOINT expected_rejection');
  try {
    let failure: unknown;
    try {
      await client.query(
        'SELECT * FROM public.bank_customize_pocket($1::uuid,$2::uuid,$3::uuid,$4::text,$5::text)',
        values,
      );
    } catch (error) {
      failure = error;
    }
    expect(errorCode(failure)).toBe(code);
  } finally {
    await client.query('ROLLBACK TO SAVEPOINT expected_rejection');
    await client.query('RELEASE SAVEPOINT expected_rejection');
  }
}

async function fixture(client: PoolClient, balance = 20000): Promise<{ actor: string; pocket: string; cashId: string }> {
  const actor = randomUUID();
  const pocket = randomUUID();
  await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
  const cash = await client.query<{ id: string }>(
    `INSERT INTO public.accounts(account_type, owner_user_id) VALUES ('USER_CASH',$1) RETURNING id`, [actor],
  );
  const cashId = cash.rows[0]?.id;
  if (!cashId) throw new Error('missing test cash account');
  await client.query('INSERT INTO public.account_balances(account_id,available_amount) VALUES ($1,$2)', [cashId, balance]);
  await client.query('INSERT INTO public.bank_saving_pockets(id,user_id,name) VALUES ($1,$2,$3)', [pocket, actor, 'fixture']);
  return { actor, pocket, cashId };
}

async function customize(client: PoolClient, key: string, actor: string, pocket: string, theme: string, icon: string) {
  return client.query<Receipt>(
    'SELECT * FROM public.bank_customize_pocket($1::uuid,$2::uuid,$3::uuid,$4::text,$5::text)',
    [key, actor, pocket, theme, icon],
  );
}

describe.skipIf(!MIGRATOR_DATABASE_URL)('P0 pocket customization durable replay: PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 8 }); });
  afterAll(async () => { await pool.end(); });

  async function rolledBack(work: (client: PoolClient) => Promise<void>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await work(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  it('prevents direct application-role reads and writes to pocket/intent tables', async () => {
    await rolledBack(async (client) => {
      for (const table of ['bank_saving_pockets', 'bank_pocket_customization_intents']) {
        const grants = await client.query<{ sel: boolean; upd: boolean; ins: boolean; del: boolean }>(
          `SELECT has_table_privilege('moneyverse_app',$1,'SELECT') AS sel,
                  has_table_privilege('moneyverse_app',$1,'UPDATE') AS upd,
                  has_table_privilege('moneyverse_app',$1,'INSERT') AS ins,
                  has_table_privilege('moneyverse_app',$1,'DELETE') AS del`, [`public.${table}`],
        );
        expect(grants.rows[0]).toEqual({ sel: false, upd: false, ins: false, del: false });
      }
    });
  });

  it('returns the exact original receipt and charges only once for the same key and payload', async () => {
    await rolledBack(async (client) => {
      const { actor, pocket, cashId } = await fixture(client);
      const key = randomUUID();
      await client.query('SET LOCAL ROLE moneyverse_app');
      const first = (await customize(client, key, actor, pocket, 'ocean', 'star')).rows[0];
      const retry = (await customize(client, key, actor, pocket, 'ocean', 'star')).rows[0];
      await client.query('RESET ROLE');
      expect(first).toEqual(retry);
      expect(first?.cost_wld).toBe('100');
      expect(first?.remaining_cash).toBe('19900');
      const tx = await client.query<{ n: string; debit: string; credit: string }>(
        `SELECT count(DISTINCT t.id)::text AS n,
                coalesce(sum(CASE WHEN p.direction='debit' THEN p.amount ELSE 0 END),0)::text AS debit,
                coalesce(sum(CASE WHEN p.direction='credit' THEN p.amount ELSE 0 END),0)::text AS credit
         FROM public.ledger_transactions t JOIN public.ledger_postings p ON p.transaction_id=t.id
         WHERE t.idempotency_key=$1`, [key],
      );
      expect(tx.rows[0]).toEqual({ n: '1', debit: '100', credit: '100' });
      const cash = await client.query<{ amount: string }>(
        'SELECT available_amount::text AS amount FROM public.account_balances WHERE account_id=$1', [cashId],
      );
      expect(cash.rows[0]?.amount).toBe('19900');
    });
  });

  it('rejects changed intent under a used key without changing style or balance', async () => {
    await rolledBack(async (client) => {
      const { actor, pocket, cashId } = await fixture(client);
      const key = randomUUID();
      await client.query('SET LOCAL ROLE moneyverse_app');
      await customize(client, key, actor, pocket, 'ocean', 'star');
      await expectRejected(client, [key, actor, pocket, 'forest', 'star'], '22023');
      await client.query('RESET ROLE');
      const state = await client.query<{ theme_color: string; icon_code: string }>(
        'SELECT theme_color,icon_code FROM public.bank_saving_pockets WHERE id=$1', [pocket],
      );
      expect(state.rows[0]).toMatchObject({ theme_color: 'ocean', icon_code: 'star' });
      const cash = await client.query<{ amount: string }>(
        'SELECT available_amount::text AS amount FROM public.account_balances WHERE account_id=$1', [cashId],
      );
      expect(cash.rows[0]?.amount).toBe('19900');
    });
  });

  it('rejects cross-owner replay and nil keys before mutation', async () => {
    await rolledBack(async (client) => {
      const { actor, pocket } = await fixture(client);
      const other = (await fixture(client)).actor;
      const key = randomUUID();
      await client.query('SET LOCAL ROLE moneyverse_app');
      await customize(client, key, actor, pocket, 'ocean', 'star');
      await expectRejected(client, [key, other, pocket, 'ocean', 'star'], '28000');
      await expectRejected(client, ['00000000-0000-0000-0000-000000000000', actor, pocket, 'ocean', 'star'], '22023');
      await client.query('RESET ROLE');
    });
  });

  it.skipIf(!DISPOSABLE)('serializes simultaneous same-key calls and leaves one verified receipt', async () => {
    // Committed fixtures are permitted ONLY in a disposable isolated PostgreSQL container.
    const setup = await pool.connect();
    let actor = ''; let pocket = ''; let cashId = '';
    try {
      await setup.query('BEGIN');
      ({ actor, pocket, cashId } = await fixture(setup));
      await setup.query('COMMIT');
    } finally { setup.release(); }
    const key = randomUUID();
    const a = await pool.connect();
    const b = await pool.connect();
    try {
      await a.query('SET ROLE moneyverse_app');
      await b.query('SET ROLE moneyverse_app');
      const [one, two] = await Promise.all([
        customize(a, key, actor, pocket, 'ocean', 'star'),
        customize(b, key, actor, pocket, 'ocean', 'star'),
      ]);
      expect(one.rows[0]).toEqual(two.rows[0]);
    } finally {
      await a.query('RESET ROLE'); await b.query('RESET ROLE');
      a.release(); b.release();
    }
    const rows = await pool.query<{ n: string }>(
      'SELECT count(*)::text AS n FROM public.ledger_transactions WHERE idempotency_key=$1', [key],
    );
    expect(rows.rows[0]?.n).toBe('1');
    const cash = await pool.query<{ amount: string }>(
      'SELECT available_amount::text AS amount FROM public.account_balances WHERE account_id=$1', [cashId],
    );
    expect(cash.rows[0]?.amount).toBe('19900');
  });

  it('makes committed customization receipts append-only, even for a table owner', async () => {
    await rolledBack(async (client) => {
      const { actor, pocket } = await fixture(client);
      const key = randomUUID();
      await customize(client, key, actor, pocket, 'ocean', 'star');
      await client.query('SAVEPOINT immutable');
      let failure: unknown;
      try {
        await client.query(
          `UPDATE public.bank_pocket_customization_intents SET theme_color='tampered'
           WHERE idempotency_key=$1`, [key],
        );
      } catch (error) { failure = error; }
      expect(errorCode(failure)).toBe('55000');
      await client.query('ROLLBACK TO SAVEPOINT immutable');
      await client.query('RELEASE SAVEPOINT immutable');
    });
  });

  it('fails closed when a legacy ledger key has no original appearance receipt', async () => {
    await rolledBack(async (client) => {
      const { actor, pocket } = await fixture(client);
      const key = randomUUID();
      await client.query(
        `INSERT INTO public.ledger_transactions
         (idempotency_key, type, actor_user_id, request_hash, request_hash_version)
         VALUES ($1,'SINK_BANK_POCKET_CUSTOMIZE',$2,public.digest('legacy','sha256'),1)`,
        [key, actor],
      );
      await client.query('SET LOCAL ROLE moneyverse_app');
      await expectRejected(client, [key, actor, pocket, 'ocean', 'star'], '22023');
      await client.query('RESET ROLE');
      const state = await client.query<{ theme_color: string }>(
        'SELECT theme_color FROM public.bank_saving_pockets WHERE id=$1', [pocket],
      );
      expect(state.rows[0]?.theme_color).toBe('sky');
    });
  });

  it.skipIf(!DISPOSABLE)('preserves 100 independent charges and balanced postings under parallel keys', async () => {
    const setup = await pool.connect();
    let actor = ''; let pocket = ''; let cashId = '';
    try {
      await setup.query('BEGIN');
      ({ actor, pocket, cashId } = await fixture(setup));
      await setup.query('COMMIT');
    } finally { setup.release(); }
    const keys = Array.from({ length: 100 }, () => randomUUID());
    const outcomes = await Promise.all(keys.map((key) => pool.query<Receipt>(
      'SELECT * FROM public.bank_customize_pocket($1::uuid,$2::uuid,$3::uuid,$4::text,$5::text)',
      [key, actor, pocket, 'ocean', 'star'],
    )));
    expect(outcomes).toHaveLength(100);
    expect(outcomes.every((row) => row.rows[0]?.cost_wld === '100')).toBe(true);
    const tx = await pool.query<{ n: string; debit: string; credit: string }>(
      `SELECT count(DISTINCT t.id)::text AS n,
              coalesce(sum(CASE WHEN p.direction='debit' THEN p.amount ELSE 0 END),0)::text AS debit,
              coalesce(sum(CASE WHEN p.direction='credit' THEN p.amount ELSE 0 END),0)::text AS credit
       FROM public.ledger_transactions t JOIN public.ledger_postings p ON p.transaction_id=t.id
       WHERE t.idempotency_key=ANY($1::uuid[])`, [keys],
    );
    expect(tx.rows[0]).toEqual({ n: '100', debit: '10000', credit: '10000' });
    const cash = await pool.query<{ amount: string }>(
      'SELECT available_amount::text AS amount FROM public.account_balances WHERE account_id=$1', [cashId],
    );
    expect(cash.rows[0]?.amount).toBe('10000');
  });

});
