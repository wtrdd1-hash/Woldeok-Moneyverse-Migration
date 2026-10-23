import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminKdicController, PublicKdicController } from './kdic.controller';

const guardsOn = (target: object, method?: string): unknown[] =>
  (Reflect.getMetadata(GUARDS_METADATA, method ? (target as Record<string, unknown>)[method] : target) as unknown[]) ?? [];

describe('KDIC privileged route authorization', () => {
  it('requires an elevated administrator console session for every private KDIC route', () => {
    expect(guardsOn(AdminKdicController)).toContain(AdminSessionGuard);
  });

  it.each(['assessPremiums', 'injectLiquidity', 'executePayout'] as const)(
    'requires CSRF for money-moving %s',
    (method) => {
      const guards = guardsOn(AdminKdicController.prototype, method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );

  it('does not impose administrator console authorization on the public KDIC portal', () => {
    expect(guardsOn(PublicKdicController)).not.toContain(AdminSessionGuard);
  });
});
