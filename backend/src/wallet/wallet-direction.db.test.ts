import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

/**
 * Run ONLY against a disposable local PostgreSQL database named mv_a_wallet_direction_*.
 * Never use the development or production database: this test creates synthetic tables.
 */
const url = process.env.WALLET_DIRECTION_DATABASE_URL;
const isolated = process.env.WALLET_DIRECTION_ISOLATED === '1'
  && !!url
  && (() => {
    const parsed = new URL(url);
    return parsed.hostname === '127.0.0.1' && parsed.pathname.startsWith('/mv_a_wallet_direction_');
  })();

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');

describe.skipIf(!isolated)('real PostgreSQL owner-scoped wallet direction filter', () => {
  const pool = new Pool({ connectionString: url, max: 2 });
  const repository = new PostgresWalletRepository(pool);

  beforeAll(async () => {
    await pool.query("CREATE TYPE public.posting_direction AS ENUM ('debit', 'credit')");
    await pool.query("CREATE TYPE public.account_type AS ENUM ('USER_CASH', 'USER_BANK')");
    await pool.query('CREATE TABLE public.accounts (id uuid PRIMARY KEY, owner_user_id uuid NOT NULL, account_type public.account_type NOT NULL)');
    await pool.query('CREATE TABLE public.ledger_transactions (id uuid PRIMARY KEY, type text NOT NULL, created_at timestamptz NOT NULL)');
    await pool.query('CREATE TABLE public.ledger_postings (id uuid PRIMARY KEY, transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id), account_id uuid NOT NULL REFERENCES public.accounts(id), direction public.posting_direction NOT NULL, amount numeric(38,0) NOT NULL)');
    await pool.query('INSERT INTO public.accounts VALUES ($1,$2,$3),($4,$5,$6),($7,$8,$9)', [id(1), OWNER, 'USER_CASH', id(2), OWNER, 'USER_BANK', id(3), OTHER, 'USER_CASH']);
    const add = async (n: number, account: string, sign: 'debit' | 'credit', amount: string, minutes: number) => {
      const tx = id(1000 + n);
      await pool.query("INSERT INTO public.ledger_transactions VALUES ($1,'TEST', CURRENT_TIMESTAMP - ($2::integer * INTERVAL '1 minute'))", [tx, minutes]);
      await pool.query('INSERT INTO public.ledger_postings VALUES ($1,$2,$3,$4,$5::numeric)', [id(2000 + n), tx, account, sign, amount]);
    };
    for (let i = 0; i < 55; i++) await add(i, id(1), 'credit', '7', i);
    await add(56, id(1), 'debit', '900719925474099312345', 100);
    await add(57, id(2), 'debit', '3', 101);
    await add(58, id(3), 'debit', '999999999999999999', 102);
    const tx = id(1059);
    await pool.query("INSERT INTO public.ledger_transactions VALUES ($1,'BANK_DEPOSIT', CURRENT_TIMESTAMP - INTERVAL '103 minute')", [tx]);
    await pool.query('INSERT INTO public.ledger_postings VALUES ($1,$2,$3,$4,$5::numeric),($6,$2,$7,$8,$5::numeric)', [id(2059), tx, id(1), 'credit', '12', id(2060), id(2), 'debit']);
  });

  afterAll(async () => { await pool.end(); });

  it('filters before the 50+1 cap and preserves exact huge integer strings', async () => {
    const incoming = await repository.recentTransactionsForUser(OWNER, 50, 7, 'in');
    expect(incoming.map((row) => row.net_amount)).toEqual(['900719925474099312345', '3']);
    const outgoing = await repository.recentTransactionsForUser(OWNER, 50, 7, 'out');
    expect(outgoing).toHaveLength(51);
    expect(outgoing.every((row) => row.net_amount === '-7')).toBe(true);
  });

  it('keeps zero-net internal movements separate and never returns another member', async () => {
    const neutral = await repository.recentTransactionsForUser(OWNER, 50, undefined, 'neutral');
    expect(neutral).toHaveLength(1);
    expect(neutral[0]?.net_amount).toBe('0');
    expect(neutral[0]?.cash_delta).toBe('-12');
    expect(neutral[0]?.bank_delta).toBe('12');
    const all = await repository.recentTransactionsForUser(OWNER, 50);
    expect(all.every((row) => row.net_amount !== '999999999999999999')).toBe(true);
  });
});
