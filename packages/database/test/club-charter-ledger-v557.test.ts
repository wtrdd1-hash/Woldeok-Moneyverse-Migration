import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(join(__dirname, '..', 'migrations', '280-club-charter-ledger-idempotency.sql'), 'utf8');
const createBody = sql.split('CREATE OR REPLACE FUNCTION public.club_create(')[1]?.split('$club_create$;')[0] ?? '';

describe('P0 club charter ledger and replay contract', () => {
  it('keeps a durable actor/payload-bound receipt under a key lock', () => {
    expect(sql).toMatch(/CREATE TABLE public\.club_charter_receipts/);
    expect(createBody).toMatch(/pg_advisory_xact_lock/);
    expect(createBody).toMatch(/v_receipt\.actor_id\s*<>\s*p_actor/);
    expect(createBody).toMatch(/v_receipt\.payload\s*<>\s*v_payload/);
    expect(createBody).toMatch(/INSERT INTO public\.club_charter_receipts/);
  });
  it('settles through the balanced immutable ledger primitive, never direct balance edits', () => {
    expect(createBody).toMatch(/public\.economy_post_transaction\(/);
    expect(createBody).toMatch(/'SINK_CLUB_CHARTER'/);
    expect(createBody).not.toMatch(/UPDATE public\.account_balances/);
    expect(createBody).not.toMatch(/ON CONFLICT[^;]+DO NOTHING/s);
  });
  it('revokes direct receipt writes and fails closed for unposted project funding', () => {
    expect(sql).toMatch(/REVOKE ALL ON TABLE public\.club_charter_receipts FROM PUBLIC, moneyverse_app/);
    expect(sql).toMatch(/REVOKE INSERT, UPDATE, DELETE ON TABLE public\.clubs FROM moneyverse_app/);
    expect(sql).toMatch(/GRANT UPDATE\(member_count\) ON TABLE public\.clubs TO moneyverse_app/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.club_create\(uuid, text, text, text, text, text, uuid\) FROM PUBLIC/);
    expect(sql).toMatch(/club project contribution is disabled until ledger settlement is verified/);
  });
});
