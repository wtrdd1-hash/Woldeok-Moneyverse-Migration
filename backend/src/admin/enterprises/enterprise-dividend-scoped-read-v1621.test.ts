import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL(
  '../../../../packages/database/migrations/324-soe-admin-dividend-history-scoped-read.sql',
  import.meta.url,
), 'utf8');
const repoSource = readFileSync(new URL('./enterprise.repository.ts', import.meta.url), 'utf8');

describe('v1621 SOE historical read least privilege contract', () => {
  it('requires a current database-backed administrator for history reads', () => {
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain("u.status = 'active'::public.user_status");
    expect(migration).toContain('JOIN public.user_roles');
    expect(migration).toContain("ERRCODE='42501'");
    expect(migration).toContain('p_limit > 100');
  });

  it('grants only the bounded read function to the application role', () => {
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.admin_soe_dividend_history_read(uuid, integer)');
    expect(migration).toContain('REVOKE ALL ON TABLE public.state_enterprise_dividend_logs FROM moneyverse_app');
    expect(migration).not.toMatch(/GRANT\s+SELECT\s+ON\s+(?:TABLE\s+)?public\.state_enterprise_dividend_logs/i);
    expect(migration).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|TRUNCATE)\s+public\.state_enterprise_dividend_logs\b/i);
  });

  it('does not directly select historical dividends with application credentials', () => {
    expect(repoSource).toContain('public.admin_soe_dividend_history_read($1::uuid, $2::integer)');
    expect(repoSource).not.toMatch(/FROM\s+public\.state_enterprise_dividend_logs/i);
  });
});
