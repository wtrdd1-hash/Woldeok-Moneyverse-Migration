import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminTreasuryController } from './treasury.controller';

const treasuryWrites = [
  'injectFunds', 'absorbFunds', 'disburseDividend', 'disburseTargetedSubsidy',
  'userDonate', 'disburseGrant', 'distributeBudget', 'buybackBurn',
  'executeWealthTax', 'createBackupSnapshot', 'triggerSwfRebalance',
  'liquidateSwfToTreasury', 'updateSwfConfig',
] as const;

describe('treasury operator authorization boundary', () => {
  it('requires an elevated administrator session for every treasury endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController) as unknown[];
    expect(guards).toContain(AdminSessionGuard);
  });

  it.each(treasuryWrites)('%s requires a one-time CSRF token', (method) => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController.prototype[method]) as unknown[]) ?? [];
    expect(guards).toContain(CsrfGuard);
  });

  it.each(treasuryWrites.filter((method) => method !== 'userDonate'))(
    '%s requires recent administrator reauthentication',
    (method) => {
      const guards = (Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController.prototype[method]) as unknown[]) ?? [];
      expect(guards).toContain(ReauthGuard);
    },
  );
});
