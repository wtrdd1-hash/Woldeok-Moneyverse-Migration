import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sql = readFileSync('../packages/database/migrations/313-admin-swf-governance-scoped-update.sql', 'utf8');
describe('v1546 actor-scoped SWF governance SQL security', () => {
  it('keeps base-table grants revoked and checks approver before changing policy', () => {
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain("public.admin_role_holder(p_actor, 'approver'");
    expect(sql).toContain("ERRCODE='42501'");
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.admin_swf_update_config');
    expect(sql).toContain('REVOKE ALL PRIVILEGES ON TABLE public.treasury_swf_configs');
    expect(sql).not.toContain('GRANT UPDATE ON TABLE');
  });
  it('updates policy and audit atomically without SWF financial settlement', () => {
    expect(sql).toContain("UPDATE public.treasury_swf_configs");
    expect(sql).toContain("INSERT INTO public.treasury_swf_events");
    expect(sql).toContain("'settlement_executed',false");
    expect(sql).toContain("WHERE id='current'");
    expect(sql).not.toMatch(/INSERT INTO public\.ledger_transactions|UPDATE public\.account_balances|UPDATE public\.system_treasury_vaults/);
    expect(sql).toContain('FOR UPDATE');
  });
});
