import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminTreasuryBondController } from './treasury-bond.controller';

describe('Treasury bond admin financial mutation boundary', () => {
  it.each(['distributeCoupons', 'updateStatus'] as const)(
    '%s requires CSRF and recent reauthentication',
    (method) => {
      const guards = (Reflect.getMetadata(
        GUARDS_METADATA,
        AdminTreasuryBondController.prototype[method],
      ) as unknown[] | undefined) ?? [];
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );
});
