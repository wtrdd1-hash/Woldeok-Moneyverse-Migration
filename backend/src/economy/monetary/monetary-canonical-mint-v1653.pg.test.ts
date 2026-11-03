import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';

const ownerUrl = process.env.V1653_TEST_DATABASE_URL;
const appUrl = process.env.V1653_TEST_APP_URL;
const isolated = process.env.V1653_DB_ISOLATED === 'yes';
const only = '127.0.0.1:5583/v1653_schema';
if (isolated && (!ownerUrl?.endsWith(only) || !appUrl?.endsWith(only)
  || !ownerUrl.includes('moneyverse_migrator@') || !appUrl.includes('moneyverse_app@'))) {
  throw new Error('only the disposable v1653 local PostgreSQL is allowed');
}

describe.runIf(isolated)('v1653 real PG isolated canonical Mint', () => {
  it('writes one canonical balanced transaction with strict two-person approval and idempotency', async () => {
    const owner = new Pool({ connectionString: ownerUrl!, max: 2 });
    const app = new Pool({ connectionString: appUrl!, max: 2 });
    const issuer = randomUUID(), proposer = randomUUID(), independent = randomUUID(), recipient = randomUUID();
    const order = randomUUID(), key = randomUUID();
    try {
      for (const id of [issuer, proposer, independent, recipient]) {
        await owner.query('INSERT INTO public.users(id) VALUES($1)', [id]);
      }
      await owner.query("INSERT INTO public.user_roles(user_id,role) VALUES ($1,'approver'),($2,'operator'),($3,'approver')",
        [issuer, proposer, independent]);
      await owner.query("INSERT INTO public.accounts(account_type,owner_user_id) VALUES ('USER_CASH',$1)", [recipient]);
      await owner.query('INSERT INTO public.account_balances(account_id) SELECT id FROM public.accounts WHERE owner_user_id=$1', [recipient]);
      await owner.query("INSERT INTO public.economy_policies(version,effective_at,status,payload) VALUES ('v1653-isolated-mint',now(),'active','{}')");
      await owner.query("INSERT INTO public.monetary_policy_orders(id,order_type,target_envelope,max_amount_wld,proposed_by,reason,expires_at) VALUES ($1,'MINT','WORK_REWARD','1000',$2,'Isolated two-person core mint authorization',now()+interval '2 hours')",
        [order, proposer]);
      await expect(owner.query('SELECT * FROM public.monetary_approve_policy_order($1,$2)',
        [proposer, order])).rejects.toMatchObject({ code: '42501' });
      const approval = await app.query('SELECT * FROM public.monetary_approve_policy_order($1::uuid,$2::uuid)',
        [independent, order]);
      expect(approval.rows[0]).toMatchObject({ status: 'APPROVED', approved_by: independent });

      const mint = async (actor: string, amount: string, replayKey: string, policyId = order) =>
        app.query('SELECT * FROM public.monetary_execute_canonical_mint($1::uuid,$2::uuid,$3::text,$4::uuid,$5::uuid)',
          [actor, policyId, amount, recipient, replayKey]);
      await expect(mint(recipient, '1000', randomUUID())).rejects.toMatchObject({ code: '42501' });
      const first = (await mint(issuer, '1000', key)).rows[0];
      expect(first).toMatchObject({ policy_order_id: order, recipient_user_id: recipient,
        actor_id: issuer, amount_wld: '1000', idempotency_key: key, replayed: false });
      expect(first.ledger_transaction_id).toMatch(/^[0-9a-f-]{36}$/);
      expect(first.evidence_digest).toMatch(/^[0-9a-f]{64}$/);
      const replay = (await mint(issuer, '1000', key)).rows[0];
      expect(replay).toMatchObject({ id: first.id, ledger_transaction_id: first.ledger_transaction_id,
        replayed: true });
      await expect(mint(issuer, '999', key)).rejects.toMatchObject({ code: '22023' });
      await expect(mint(issuer, '1', randomUUID())).rejects.toMatchObject({ code: '42501' });

      const receipt = await owner.query(
        "SELECT (SELECT count(*)::int FROM public.mint_certificates WHERE policy_order_id=$1) certificates,(SELECT count(*)::int FROM public.ledger_transactions WHERE type='MONETARY_APPROVED_MINT') mint_transactions,(SELECT count(*)::int FROM public.ledger_postings WHERE transaction_id=$2) postings,(SELECT coalesce(sum(CASE WHEN direction='debit' THEN amount ELSE -amount END),0)::text FROM public.ledger_postings WHERE transaction_id=$2) balanced",
        [order, first.ledger_transaction_id]);
      expect(receipt.rows[0]).toEqual({ certificates: 1, mint_transactions: 1, postings: 2, balanced: '0' });
      const balances = await owner.query(
        "SELECT a.account_type,ab.available_amount::text AS amount FROM public.accounts a JOIN public.account_balances ab ON ab.account_id=a.id WHERE a.owner_user_id=$1 OR a.system_key='mint' ORDER BY a.account_type",
        [recipient]);
      expect(balances.rows).toEqual([
        { account_type: 'USER_CASH', amount: '1000' }, { account_type: 'MINT', amount: '-1000' },
      ]);
      await expect(owner.query('UPDATE public.mint_certificates SET amount_wld=$1 WHERE id=$2',
        ['1001', first.id])).rejects.toMatchObject({ code: '55000' });
      await expect(app.query("INSERT INTO public.mint_certificates(policy_order_id,amount_wld,source_envelope,recipient_user_id,idempotency_key,actor_id) VALUES ($1,'1','WORK_REWARD',$2,$3,$4)",
        [order, recipient, randomUUID(), issuer])).rejects.toMatchObject({ code: '42501' });

      // Two separate requests for a single policy are serialized at its order
      // row: one may claim the capacity; the other cannot create extra WLD.
      const racingOrder = randomUUID();
      await owner.query("INSERT INTO public.monetary_policy_orders(id,order_type,target_envelope,max_amount_wld,proposed_by,reason,expires_at) VALUES ($1,'MINT','WORK_REWARD','600',$2,'Distinct concurrent issuance capacity test',now()+interval '2 hours')",
        [racingOrder, proposer]);
      await app.query('SELECT * FROM public.monetary_approve_policy_order($1::uuid,$2::uuid)',
        [independent, racingOrder]);
      const concurrent = await Promise.allSettled([
        mint(issuer,'400',randomUUID(),racingOrder),
        mint(issuer,'400',randomUUID(),racingOrder),
      ]);
      expect(concurrent.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
      const denied = concurrent.filter((item) => item.status === 'rejected') as PromiseRejectedResult[];
      expect(denied).toHaveLength(1);
      expect(denied[0]?.reason.code).toBe('42501');
      const raceState = await owner.query(
        "SELECT executed_amount_wld,status FROM public.monetary_policy_orders WHERE id=$1",
        [racingOrder],
      );
      expect(raceState.rows[0]).toMatchObject({ executed_amount_wld: '400', status: 'APPROVED' });

      const frozenOrder = randomUUID();
      await owner.query("INSERT INTO public.monetary_policy_orders(id,order_type,target_envelope,max_amount_wld,proposed_by,reason,expires_at) VALUES ($1,'MINT','WORK_REWARD','200',$2,'Frozen issuance must reject all new money',now()+interval '2 hours')",
        [frozenOrder, proposer]);
      await app.query('SELECT * FROM public.monetary_approve_policy_order($1::uuid,$2::uuid)',
        [independent, frozenOrder]);
      await owner.query('UPDATE public.monetary_system_status SET is_issuance_frozen=true WHERE id=1');
      await expect(mint(issuer,'100',randomUUID(),frozenOrder))
        .rejects.toMatchObject({ code: '42501' });
      await owner.query('UPDATE public.monetary_system_status SET is_issuance_frozen=false WHERE id=1');

      // A deliberate certificate-storage exception must undo the prior
      // double-entry posting and policy reservation in the SAME SQL statement.
      const abortOrder = randomUUID();
      const abortKey = randomUUID();
      await owner.query("INSERT INTO public.monetary_policy_orders(id,order_type,target_envelope,max_amount_wld,proposed_by,reason,expires_at) VALUES ($1,'MINT','WORK_REWARD','100',$2,'Atomic certificate failure must rollback money',now()+interval '2 hours')",
        [abortOrder, proposer]);
      await app.query('SELECT * FROM public.monetary_approve_policy_order($1::uuid,$2::uuid)',
        [independent, abortOrder]);
      const beforeAbort = (await owner.query(
        "SELECT count(*)::int AS n FROM public.ledger_transactions WHERE type='MONETARY_APPROVED_MINT'",
      )).rows[0]?.n;
      await owner.query("CREATE FUNCTION public.v1653_abort_mint_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'v1653 isolated deliberate certificate abort'; END; $$");
      await owner.query('CREATE TRIGGER v1653_test_abort BEFORE INSERT ON public.mint_certificates FOR EACH ROW EXECUTE FUNCTION public.v1653_abort_mint_insert()');
      try {
        await expect(mint(issuer,'50',abortKey,abortOrder))
          .rejects.toMatchObject({ code: 'P0001' });
      } finally {
        await owner.query('DROP TRIGGER v1653_test_abort ON public.mint_certificates');
        await owner.query('DROP FUNCTION public.v1653_abort_mint_insert()');
      }
      const afterAbort = await owner.query(
        "SELECT (SELECT count(*)::int FROM public.ledger_transactions WHERE type='MONETARY_APPROVED_MINT') txs,(SELECT executed_amount_wld FROM public.monetary_policy_orders WHERE id=$1) reserved,(SELECT count(*)::int FROM public.mint_certificates WHERE policy_order_id=$1) certs",
        [abortOrder],
      );
      expect(afterAbort.rows[0]).toEqual({ txs: beforeAbort, reserved:'0', certs:0 });

    } finally {
      await app.end(); await owner.end();
    }
  });
});
