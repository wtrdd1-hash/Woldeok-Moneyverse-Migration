import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { GameCatalogController } from './game-catalog.controller';

function context(sessionId?: string): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => ({ session: sessionId ? { id: sessionId } : undefined }) }) } as unknown as ExecutionContext;
}

describe('market event existing backend reauthentication contract', () => {
  it.each(['publishMarketEvent', 'cancelMarketEvent'] as const)('%s retains CSRF and recent-auth guards', (method) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, GameCatalogController.prototype[method]) as unknown[];
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });

  it('retains administrator and administrator-console guards for both writes', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, GameCatalogController) as unknown[];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });

  it('rejects stale or missing recent reauthentication with the structured code', async () => {
    const sessions = { hasRecentReauthentication: vi.fn().mockResolvedValue(false) };
    const guard = new ReauthGuard(sessions as never);
    await expect(guard.canActivate(context('session-1'))).rejects.toMatchObject({
      response: { code: 'reauthentication_required' },
    });
    expect(sessions.hasRecentReauthentication).toHaveBeenCalledWith('session-1', 900);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts only a session with confirmed recent identity verification', async () => {
    const sessions = { hasRecentReauthentication: vi.fn().mockResolvedValue(true) };
    const guard = new ReauthGuard(sessions as never);
    await expect(guard.canActivate(context('verified-session'))).resolves.toBe(true);
  });
});
