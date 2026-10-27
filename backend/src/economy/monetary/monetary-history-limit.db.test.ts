import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';

const url = process.env.MONEYVERSE_V596_ISOLATED_PG_URL;
const pool = url ? new Pool({ connectionString: url, max: 2 }) : null;
afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('v596 isolated PostgreSQL 17 app-role monetary history', () => {
  it('reads all four history sources with bound 1..50, without app DML', async () => {
    const db = pool!;
    const role = await db.query<{
      role_name: string; can_update: boolean; can_insert: boolean;
    }>(`SELECT current_user AS role_name,
      has_table_privilege(current_user, 'public.monetary_policy_orders', 'UPDATE') AS can_update,
      has_table_privilege(current_user, 'public.mint_certificates', 'INSERT') AS can_insert`);
    expect(role.rows[0]).toMatchObject({
      role_name: 'moneyverse_app', can_update: false, can_insert: false,
    });

    const central = new CentralBankService(db);
    const mint = new MintBureauService(db);
    const auto = new AutoMonetaryRegulationService(db, central);
    expect(await central.listPolicyOrders(50)).toHaveLength(1);
    expect(await mint.listMintCertificates(50)).toHaveLength(1);
    expect(await mint.listRetirementCertificates(50)).toHaveLength(1);
    expect(await auto.getRecentEvents(50)).toHaveLength(1);
    await expect(db.query('UPDATE public.monetary_policy_orders SET created_at = now()'))
      .rejects.toMatchObject({ code: '42501' });
  });

  it('rejects direct invalid pagination before SQL execution', async () => {
    const db = pool!;
    await expect(new CentralBankService(db).listPolicyOrders(51)).rejects.toMatchObject({ status: 400 });
    await expect(new MintBureauService(db).listMintCertificates(0)).rejects.toMatchObject({ status: 400 });
    await expect(new MintBureauService(db).listRetirementCertificates(NaN)).rejects.toMatchObject({ status: 400 });
    await expect(new AutoMonetaryRegulationService(db, new CentralBankService(db))
      .getRecentEvents(Infinity)).rejects.toMatchObject({ status: 400 });
  });
});
