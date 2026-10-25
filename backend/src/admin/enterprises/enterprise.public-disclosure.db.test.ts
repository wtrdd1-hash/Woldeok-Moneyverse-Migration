import { Client } from 'pg';
import { describe, expect, it } from 'vitest';

// Never fall back to packages/database/.env: that can point at a live DB.
// Only an explicitly named, loopback-bound isolated test database is allowed.
const connectionString = process.env.MONEYVERSE_ISOLATED_PG_URL;
if (connectionString) {
  const url = new URL(connectionString);
  if (
    !['127.0.0.1', 'localhost'].includes(url.hostname) ||
    !url.pathname.endsWith('_isolated') ||
    ['5433', '5585'].includes(url.port) ||
    !url.port
  ) {
    throw new Error('MONEYVERSE_ISOLATED_PG_URL must name a dedicated loopback isolated database');
  }
}

async function readOnlyAs<T>(
  role: 'moneyverse_app' | 'untrusted_user',
  action: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query(`SET LOCAL ROLE ${role}`);
    return await action(client);
  } finally {
    await client.query('ROLLBACK').catch(() => undefined);
    await client.end();
  }
}

describe.skipIf(!connectionString)('isolated PostgreSQL enterprise public disclosure ACL', () => {
  it('returns bounded projection-only values through the app-role function', async () => {
    const result = await readOnlyAs('moneyverse_app', (client) =>
      client.query<{
        snapshot: {
          soes: unknown[];
          privateEnterprises: unknown[];
          financial_data_status: string;
          ledger_confirmed: boolean;
          overview: { hourly_soe_dividends_wld: string };
        };
      }>('SELECT public.enterprise_public_disclosure() AS snapshot'),
    );
    const snapshot = result.rows[0]?.snapshot;
    expect(snapshot?.financial_data_status).toBe('PROJECTION_ONLY_UNVERIFIED');
    expect(snapshot?.ledger_confirmed).toBe(false);
    expect(snapshot?.soes.length).toBeLessThanOrEqual(20);
    expect(snapshot?.privateEnterprises.length).toBeLessThanOrEqual(100);
    expect(snapshot?.overview.hourly_soe_dividends_wld).toMatch(/^\d+$/);
  });

  it.each(['state_enterprises', 'private_enterprises'])(
    'denies direct SELECT on %s',
    async (table) => {
      await expect(
        readOnlyAs('moneyverse_app', (client) =>
          client.query(`SELECT 1 FROM public.${table} LIMIT 1`),
        ),
      ).rejects.toMatchObject({ code: '42501' });
    },
  );

  it('denies untrusted roles EXECUTE on the disclosure function', async () => {
    await expect(
      readOnlyAs('untrusted_user', (client) =>
        client.query('SELECT public.enterprise_public_disclosure()'),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });
});
