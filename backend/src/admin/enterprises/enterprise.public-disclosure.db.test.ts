import { Client } from 'pg';
import { describe, expect, it } from 'vitest';

// Only an explicitly named isolated loopback DB. Never use the shared DEV/Production URL.
const connectionString = process.env.MONEYVERSE_ISOLATED_PG_URL;
if (connectionString) {
  const url = new URL(connectionString);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) ||
      !url.pathname.endsWith('_isolated') || !url.port || ['5433', '5585'].includes(url.port)) {
    throw new Error('MONEYVERSE_ISOLATED_PG_URL must target a dedicated loopback isolated database');
  }
}

async function readOnlyAs<T>(action: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query('SET LOCAL ROLE moneyverse_app');
    return await action(client);
  } finally {
    await client.query('ROLLBACK').catch(() => undefined);
    await client.end();
  }
}

describe.skipIf(!connectionString)('isolated PostgreSQL public enterprise source ACL', () => {
  it('reads source-projected integer WLD and unverified settlement through one function', async () => {
    const result = await readOnlyAs((client) => client.query<{ disclosure: {
      overview: { hourly_soe_dividends_wld: string };
      soes: unknown[]; privateEnterprises: unknown[];
      financial_data_status: string; ledger_confirmed: boolean;
    } }>('SELECT public.enterprise_public_disclosure_v1() AS disclosure'));
    const row = result.rows[0]?.disclosure;
    expect(row?.financial_data_status).toBe('PROJECTION_ONLY_UNVERIFIED');
    expect(row?.ledger_confirmed).toBe(false);
    expect(row?.overview.hourly_soe_dividends_wld).toMatch(/^-?(?:0|[1-9][0-9]*)$/);
    expect(row?.soes.length).toBeLessThanOrEqual(100);
    expect(row?.privateEnterprises.length).toBeLessThanOrEqual(100);
  });

  it.each(['state_enterprises', 'private_enterprises'])(
    'denies app-role direct table SELECT on %s', async (table) => {
      await expect(readOnlyAs((client) => client.query(`SELECT 1 FROM public.${table} LIMIT 1`)))
        .rejects.toMatchObject({ code: '42501' });
    },
  );
});
