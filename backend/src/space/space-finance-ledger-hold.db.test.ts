import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresSpaceRepository } from './space.repository';

const url = process.env.SPACE_HOLD_TEST_DATABASE_URL;
const actor = '11111111-2222-4333-8444-555555555555';
const target = '22222222-3333-4444-8555-666666666666';
const key = '33333333-4444-4555-8666-777777777777';

describe.skipIf(!url)('P0 isolated PostgreSQL: space finance API containment', () => {
  const pool = new Pool({ connectionString: url, max: 2 });
  const repo = new PostgresSpaceRepository(pool);

  beforeAll(async () => {
    await pool.query('CREATE TABLE public.space_finance_probe (id integer PRIMARY KEY, calls integer NOT NULL DEFAULT 0)');
    await pool.query('INSERT INTO public.space_finance_probe (id) VALUES (1)');
    await pool.query(`CREATE FUNCTION public.space_purchase(uuid,text,text,uuid)
      RETURNS TABLE(space_id uuid,space_type text,name text,created_at timestamptz)
      LANGUAGE plpgsql AS $$ BEGIN UPDATE public.space_finance_probe SET calls=calls+1;
      RETURN QUERY SELECT gen_random_uuid(), 'SPACE_STUDIO'::text, 'test'::text, now(); END $$`);
    await pool.query(`CREATE FUNCTION public.city_project_contribute(uuid,uuid,numeric,uuid)
      RETURNS TABLE(contribution_id uuid,accepted_amount numeric,project_current_wld text,project_status text)
      LANGUAGE plpgsql AS $$ BEGIN UPDATE public.space_finance_probe SET calls=calls+1;
      RETURN QUERY SELECT gen_random_uuid(), 1::numeric, '1'::text, 'active'::text; END $$`);
    await pool.query(`CREATE FUNCTION public.space_pay_property_tax(uuid,uuid,integer,uuid)
      RETURNS TABLE(receipt_id uuid,space_id uuid,days_paid integer,total_wld numeric,new_paid_until timestamptz,paid_at timestamptz)
      LANGUAGE plpgsql AS $$ BEGIN UPDATE public.space_finance_probe SET calls=calls+1;
      RETURN QUERY SELECT gen_random_uuid(), $2, $3, 1::numeric, now(), now(); END $$`);
  });

  afterAll(async () => { await pool.end(); });

  it('does not invoke even executable legacy SQL mutation functions', async () => {
    await expect(repo.purchaseSpace(actor, 'SPACE_STUDIO', 'test', key)).rejects.toMatchObject({ status: 503 });
    await expect(repo.contributeCityProject(actor, target, 1, key)).rejects.toMatchObject({ status: 503 });
    await expect(repo.payPropertyTax(actor, target, 1, key)).rejects.toMatchObject({ status: 503 });
    const result = await pool.query<{ calls: number }>('SELECT calls FROM public.space_finance_probe WHERE id=1');
    expect(result.rows[0]?.calls).toBe(0);
  });
});
