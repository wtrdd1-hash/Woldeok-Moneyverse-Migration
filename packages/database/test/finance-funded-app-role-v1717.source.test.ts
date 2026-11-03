import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(__dirname, 'finance-funded-app-role-v1717.pg.sql'),
  'utf8',
);

describe('v1717: real-role funded pension acceptance on a disposable restore', () => {
  it('fails closed unless specifically invoked with the clone-only psql flag', () => {
    expect(source).toContain('\\set ON_ERROR_STOP on');
    expect(source).toContain('\\if :{?isolated_clone}');
    expect(source).toContain('SELECT 1/0;');
  });

  it('runs the two real financial commands as the web database principal', () => {
    expect(source).toContain('SET LOCAL ROLE moneyverse_app;');
    expect(source).toContain("treasury_core_post(a,k1,'NPS_FUND','1000')");
    expect(source).toContain("treasury_core_post(a,k2,'NPS_WITHDRAW','1000')");
    expect(source).toContain("x.currency='WLD'");
    expect(source).toContain("u.status='active'");
  });

  it('requires exact idempotency and the 95/5 pension withdrawal split', () => {
    expect(source).toContain('replay.ledger_transaction_id IS DISTINCT FROM fund.ledger_transaction_id');
    expect(source).toContain('replay_withdraw.ledger_transaction_id IS DISTINCT FROM withdrawn.ledger_transaction_id');
    expect(source).toContain("withdrawn.user_disbursement_wld <> '950'");
    expect(source).toContain("withdrawn.welfare_fee_wld <> '50'");
  });

  it('never creates unsupported currency or writes direct balance/journal rows', () => {
    expect(source).toContain('RESET ROLE;');
    expect(source).toMatch(/ROLLBACK;\s*SELECT/);
    expect(source).not.toMatch(/GRANT\s+(?:ALL|UPDATE|INSERT)/i);
    expect(source).not.toMatch(
      /(?:INSERT INTO|UPDATE|DELETE FROM)\s+public\.(?:ledger_transactions|ledger_postings|account_balances)/i,
    );
  });
});
