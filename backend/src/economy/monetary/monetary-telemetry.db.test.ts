import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { CentralBankService } from './central-bank.service';

const appUrl = process.env.MONETARY_TELEMETRY_PG_URL;
const deniedUrl = process.env.MONETARY_TELEMETRY_PG_DENIED_URL;

describe.skipIf(!appUrl || !deniedUrl)('monetary telemetry isolated PostgreSQL least privilege', () => {
  let app: Pool;
  let denied: Pool;
  beforeAll(() => {
    app = new Pool({ connectionString: appUrl });
    denied = new Pool({ connectionString: deniedUrl });
  });
  afterAll(async () => { await Promise.all([app?.end(), denied?.end()]); });

  it('reads actual money and counts with a read-only app role and no fabricated verification', async () => {
    const result = await new CentralBankService(app as unknown as Queryable).getMonetaryTelemetry();
    expect(result).toMatchObject({
      m_total: '300', m_treasury: '100', m_circulating: '200',
      is_issuance_frozen: true, active_policy_orders_count: 1,
      total_mint_certificates_count: 1, total_retirement_certificates_count: 0,
      m_bank_liquidity: null, m_locked: null, verified_invariant: false, last_reconciled_at: null,
    });
  });

  it('cannot mutate financial balances with the app role', async () => {
    await expect(app.query('UPDATE public.account_balances SET available_amount = 999'))
      .rejects.toMatchObject({ code: '42501' });
  });

  it('fails closed when count tables are not accessible', async () => {
    await expect(new CentralBankService(denied as unknown as Queryable).getMonetaryTelemetry())
      .rejects.toThrow(ServiceUnavailableException);
  });
});
