import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { MonetaryController } from './monetary.controller';

const guards = (target: object, method?: keyof MonetaryController): unknown[] =>
  (Reflect.getMetadata(GUARDS_METADATA, method ? MonetaryController.prototype[method] : target) as unknown[]) ?? [];

describe('MonetaryController privileged financial authorization', () => {
  it('requires a live elevated administrator console session', () => {
    expect(guards(MonetaryController)).toContain(AdminSessionGuard);
    expect(guards(MonetaryController)).toContain(CsrfGuard);
  });

  it.each(['approveOrder', 'executeMint', 'freeze', 'unfreeze', 'runAutoRegulationManually'] as const)(
    'requires recent reauthentication for %s', (method) => {
      expect(guards(MonetaryController.prototype, method)).toContain(ReauthGuard);
    },
  );
});
