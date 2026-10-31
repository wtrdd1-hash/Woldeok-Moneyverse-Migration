import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(join(process.cwd(), 'migrations/314-fx-public-scoped-read.sql'), 'utf8');

describe('FX public read migration least privilege', () => {
  it.each([
    'fx_public_reserve_status',
    'fx_public_rate_history',
    'fx_public_sdr_allocations',
    'fx_public_swap_agreements',
  ])('%s is read-only, SECURITY DEFINER, and app EXECUTE-only', (name) => {
    const definition = sql.match(new RegExp(`CREATE(?: OR REPLACE)? FUNCTION public\\.${name}\\([\\s\\S]*?\\$function\\$;`, 'i'))?.[0];
    expect(definition).toBeDefined();
    expect(definition).toMatch(/SECURITY DEFINER/i);
    expect(definition).toMatch(/SET search_path = pg_catalog, pg_temp/i);
    expect(definition).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE)\b/i);
    expect(sql).toContain(`GRANT EXECUTE ON FUNCTION public.${name}(`);
    expect(sql).toContain(`REVOKE ALL PRIVILEGES ON FUNCTION public.${name}(`);
  });
  it('keeps all FX source tables private from the application role', () => {
    for (const name of ['foreign_exchange_reserves', 'foreign_exchange_rates', 'foreign_exchange_asset_allocations', 'currency_swap_agreements']) {
      expect(sql).toContain(`public.${name}`);
    }
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE[\s\S]*FROM PUBLIC, moneyverse_app/i);
  });
});
