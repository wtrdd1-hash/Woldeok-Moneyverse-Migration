import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(resolve(__dirname,
  '../../../../packages/database/migrations/329-mint-canonical-ledger-receipts.sql'), 'utf8');
describe('v1653 SQL canonical issuance boundary', () => {
  it('does not issue without independently approved capacity and nonfrozen policy', () => {
    expect(migration).toContain("public.admin_role_holder(p_actor, 'approver'::public.admin_role)");
    expect(migration).toContain('v_order.proposed_by = v_order.approved_by');
    expect(migration).toContain("v_order.status IS DISTINCT FROM 'APPROVED'");
    expect(migration).toContain('v_order.expires_at <= clock_timestamp()');
    expect(migration).toContain('v_order.executed_amount_wld::numeric + v_amount > v_order.max_amount_wld::numeric');
    expect(migration).toContain('m.is_issuance_frozen=false');
  });
  it('links each issued certificate to a balanced immutable canonical journal transaction', () => {
    expect(migration).toContain('SELECT public.economy_post_transaction(');
    expect(migration).toContain("'MONETARY_APPROVED_MINT'");
    expect(migration).toContain("'credit','amount',v_amount::text");
    expect(migration).toContain("'debit','amount',v_amount::text");
    expect(migration).toContain('ledger_transaction_id uuid UNIQUE');
    expect(migration).toContain('v_tx,v_digest');
    expect(migration).toContain('mint_certificate_immutable');
  });
  it('rejects idempotency collisions and grants only the dedicated function to app', () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended('CANONICAL_MINT:'");
    expect(migration).toContain('prior certificate lacks canonical ledger');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.monetary_execute_canonical_mint');
    expect(migration).toContain('REVOKE INSERT,UPDATE,DELETE,TRUNCATE ON public.mint_certificates');
  });
});
