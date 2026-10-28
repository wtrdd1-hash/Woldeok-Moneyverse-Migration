import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sqlPath = 'migrations/291-npc-order-replay-integrity.sql';

describe('NPC order replay integrity migration 291', () => {
  it('adds an immutable actor/NPC/command-bound acceptance receipt', () => {
    const sql = readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('CREATE TABLE public.engagement_npc_order_receipts');
    expect(sql).toContain('idempotency_key uuid PRIMARY KEY');
    expect(sql).toContain('accepted_affinity integer NOT NULL');
    expect(sql).toContain("command_type text NOT NULL DEFAULT 'npc_order'");
    expect(sql).toContain('engagement_npc_receipt_immutable');
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE public\.engagement_npc_order_receipts FROM PUBLIC, moneyverse_app/);
  });

  it('refuses borrowed, conflicting and provenance-unknown replay keys', () => {
    const sql = readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('v_receipt.user_id IS DISTINCT FROM p_actor');
    expect(sql).toContain('v_receipt.npc_code IS DISTINCT FROM p_npc_code');
    expect(sql).toContain('legacy engagement receipt has no NPC provenance');
    expect(sql).toContain('v_progress_replayed');
    expect(sql).toContain('FOR SHARE');
    expect(sql).toContain('accepted_affinity');
  });

  it('retains the function contract and denies public or direct app-table access', () => {
    const sql = readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.engagement_record_npc_order(');
    expect(sql).toContain('RETURNS TABLE(npc_code text, affinity integer, replayed boolean)');
    expect(sql).toContain('SET search_path = pg_catalog, pg_temp');
    expect(sql).toContain('ALTER FUNCTION public.engagement_record_npc_order(uuid, uuid, text) OWNER TO moneyverse_migrator');
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON FUNCTION public\.engagement_record_npc_order\(uuid, uuid, text\) FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.engagement_record_npc_order\(uuid, uuid, text\) TO moneyverse_app/);
  });
});
