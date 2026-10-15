import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { MintBureauService } from './mint-bureau.service';

const url = process.env.V653_TEST_DATABASE_URL;
const enabled = process.env.V653_DB_ISOLATED === 'yes';
if (enabled && (!url || !url.startsWith('postgresql://moneyverse_migrator@127.0.0.1:5580/wdmv_fix_v653'))) {
  throw new Error('refusing to run on any database except isolated v653');
}

describe.runIf(enabled)('real PG cancelled monetary order', () => {
  it('refuses cancelled policy and limits approved retirement to 100 WLD', async () => {
    const pool = new Pool({ connectionString: url, max: 1 });
    const user = randomUUID(), rejected = randomUUID(), allowed = randomUUID();
    try {
      await pool.query('BEGIN');
      // CI-schema-only source lacks migration 244: build transaction-local
      // table fixtures instead of touching any Production database.
      await pool.query(`CREATE TABLE IF NOT EXISTS public.monetary_policy_orders (
        id uuid PRIMARY KEY, order_type text, target_envelope text,
        max_amount_wld text, executed_amount_wld text, status text,
        reason text, expires_at timestamptz, updated_at timestamptz)`);
      await pool.query(`CREATE TABLE IF NOT EXISTS public.retirement_certificates (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_order_id uuid REFERENCES public.monetary_policy_orders(id),
        amount_wld text, source_type text, actor_id uuid, reason text,
        idempotency_key text UNIQUE)`);
      await pool.query('INSERT INTO public.users (id) VALUES ($1)', [user]);
      await pool.query(
        `INSERT INTO public.monetary_policy_orders
           (id,order_type,target_envelope,max_amount_wld,executed_amount_wld,status,reason,expires_at)
         VALUES ($1,'RETIRE','HARD_SINK_PURGE','100','0','CANCELLED','Synthetic cancelled policy for test',now()+interval '1 day'),
                ($2,'RETIRE','HARD_SINK_PURGE','100','0','APPROVED','Synthetic approved policy for test',now()+interval '1 day')`,
        [rejected, allowed],
      );
      const service = new MintBureauService(pool);
      await expect(service.retireAuthorizedAmount(user,rejected,'50','HARD_SINK_PURGE','Cancelled order must be rejected',randomUUID())).rejects.toThrow(ForbiddenException);
      const first = await service.retireAuthorizedAmount(user,allowed,'30','HARD_SINK_PURGE','First approved retirement',randomUUID());
      expect(first.amount_wld).toBe('30');
      await expect(service.retireAuthorizedAmount(user,allowed,'90','HARD_SINK_PURGE','Insufficient remaining limit',randomUUID())).rejects.toThrow(ForbiddenException);
      const state = await pool.query('SELECT status,executed_amount_wld FROM public.monetary_policy_orders WHERE id=$1',[allowed]);
      expect(state.rows[0]).toMatchObject({status:'APPROVED',executed_amount_wld:'30'});
      await service.retireAuthorizedAmount(user,allowed,'70','HARD_SINK_PURGE','Remaining approved retirement',randomUUID());
      const done = await pool.query('SELECT status,executed_amount_wld FROM public.monetary_policy_orders WHERE id=$1',[allowed]);
      expect(done.rows[0]).toMatchObject({status:'EXECUTED',executed_amount_wld:'100'});
      const refused = await pool.query('SELECT count(*)::int AS n FROM public.retirement_certificates WHERE policy_order_id=$1',[rejected]);
      expect(refused.rows[0].n).toBe(0);
    } finally {
      await pool.query('ROLLBACK');
      await pool.end();
    }
  });
});
