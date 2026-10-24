import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminEnterpriseController } from './enterprise.controller';

function methodGuards(method: 'harvestSoeDividends' | 'updateSoeStatus'): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminEnterpriseController.prototype[method]) as unknown[]) ?? [];
}

describe('state enterprise administrative mutation boundary', () => {
  it.each(['harvestSoeDividends', 'updateSoeStatus'] as const)(
    '%s requires CSRF and recent administrator reauthentication', (method) => {
      expect(methodGuards(method)).toContain(CsrfGuard);
      expect(methodGuards(method)).toContain(ReauthGuard);
    },
  );
});
