import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminTreasuryController } from './treasury.controller';
import { TreasurySettlementHoldGuard } from './treasury-settlement-hold.guard';

const FINANCIAL_WRITES = [
  'injectFunds', 'absorbFunds', 'disburseDividend', 'disburseTargetedSubsidy',
  'disburseGrant', 'distributeBudget', 'buybackBurn', 'executeWealthTax',
  'triggerSwfRebalance', 'liquidateSwfToTreasury', 'updateSwfConfig',
] as const;

describe('Treasury financially unsafe admin routes are held during reconciliation', () => {
  it.each(FINANCIAL_WRITES)('blocks %s before invoking legacy settlement', (method) => {
    const action = AdminTreasuryController.prototype[method];
    const guards = Reflect.getMetadata(GUARDS_METADATA, action) as unknown[] | undefined;
    expect(guards).toContain(TreasurySettlementHoldGuard);
  });
  it('never silently approves an unsettled operation', () => {
    expect(() => new TreasurySettlementHoldGuard().canActivate())
      .toThrow('국고 원장');
  });
});
