import type { ExecutionContext } from '@nestjs/common';
import {
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../session.context';
import { AdminGuard } from './admin.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { ConsentGuard } from './consent.guard';
import { CsrfGuard } from './csrf.guard';
import { InternalTokenGuard } from './internal-token.guard';
import { ReauthGuard } from './reauth.guard';
import { SessionGuard } from './session.guard';

function contextFor(request: Partial<RequestWithSession>): ExecutionContext {
  const full = { headers: {}, method: 'GET', ...request } as RequestWithSession;
  return {
    switchToHttp: () => ({ getRequest: () => full }),
    getHandler: () => contextFor,
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

function requestOf(context: ExecutionContext): RequestWithSession {
  return context.switchToHttp().getRequest<RequestWithSession>();
}

const CONFIG_INSECURE = { cookieSecure: false, internalToken: 'i'.repeat(32) };
const CONFIG_PRODUCTION = { ...CONFIG_INSECURE, production: true };
const CONFIG_DEVELOPMENT = { ...CONFIG_INSECURE, production: false };
const REQUIRE_INTERNAL_TOKEN = { getAllAndOverride: () => false } as never;
const SKIP_INTERNAL_TOKEN = { getAllAndOverride: () => true } as never;

describe('SessionGuard', () => {
  it('reports the store unavailable rather than unauthorised when there is no repository', async () => {
    const guard = new SessionGuard(null, CONFIG_INSECURE as never);
    await expect(guard.canActivate(contextFor({}))).rejects.toThrow(ServiceUnavailableException);
  });

  it('attaches the resolved session to the request', async () => {
    const session = { id: 'session-id', user_id: null };
    const guard = new SessionGuard({ get: async () => session } as never, CONFIG_INSECURE as never);
    const context = contextFor({ headers: { cookie: `mv_session=${'a'.repeat(64)}` } });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(requestOf(context).session).toBe(session);
  });

  it('rejects when no session matches the token', async () => {
    const guard = new SessionGuard({ get: async () => null } as never, CONFIG_INSECURE as never);
    await expect(guard.canActivate(contextFor({}))).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthenticatedGuard', () => {
  it('rejects a pre-login session that has no user', () => {
    const context = contextFor({ session: { id: 'session-id', user_id: null } as never });
    expect(() => new AuthenticatedGuard().canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects when no guard has resolved a session at all', () => {
    expect(() => new AuthenticatedGuard().canActivate(contextFor({}))).toThrow(
      UnauthorizedException,
    );
  });

  it('accepts a session bound to a user', () => {
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    expect(new AuthenticatedGuard().canActivate(context)).toBe(true);
  });
});

describe('ConsentGuard', () => {
  // 428 Precondition Required, not 403: the request is well formed and the
  // caller is authenticated, but the current policy version has not been
  // accepted. A 403 would suggest the action is never permitted.
  it('rejects with 428 when the current policy version is not accepted', async () => {
    const guard = new ConsentGuard({ hasCurrentUserConsent: async () => false } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: 428 });
  });

  it('accepts when consent is current', async () => {
    const guard = new ConsentGuard({ hasCurrentUserConsent: async () => true } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

describe('CsrfGuard', () => {
  it('lets a safe method through without a token', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => false } as never);
    await expect(guard.canActivate(contextFor({ method: 'GET' }))).resolves.toBe(true);
  });

  it('rejects a state-changing request with no token header', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({ method: 'POST', session: { id: 'session-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('rejects a state-changing request whose token does not verify', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => false } as never);
    const context = contextFor({
      method: 'POST',
      headers: { 'x-csrf-token': 'c'.repeat(64) },
      session: { id: 'session-id' } as never,
    });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('rejects a token presented without a session', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({ method: 'POST', headers: { 'x-csrf-token': 'c'.repeat(64) } });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('accepts a verified token', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({
      method: 'POST',
      headers: { 'x-csrf-token': 'c'.repeat(64) },
      session: { id: 'session-id' } as never,
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  // The mechanical form of "state-changing routes are CSRF-protected without
  // exception": no verb gets an opt-out.
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('protects %s', async (method) => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({ method, session: { id: 'session-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});

describe('AdminGuard', () => {
  it('rejects a user with no roles', async () => {
    const guard = new AdminGuard({ currentRoles: async () => [] } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('rejects a session with no user without consulting the repository', async () => {
    let consulted = false;
    const guard = new AdminGuard({
      currentRoles: async () => {
        consulted = true;
        return ['operator'];
      },
    } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: null } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(consulted).toBe(false);
  });

  it('attaches the roles it resolved', async () => {
    const guard = new AdminGuard({ currentRoles: async () => ['operator'] } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(requestOf(context).adminRoles).toEqual(['operator']);
  });
});

describe('ReauthGuard', () => {
  it('rejects when the last reauthentication is older than the window', async () => {
    const guard = new ReauthGuard({ hasRecentReauthentication: async () => false } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: 401 });
  });

  it('names the refusal, because the caller is signed in and 401 alone reads as "log in"', async () => {
    const guard = new ReauthGuard({ hasRecentReauthentication: async () => false } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'reauthentication_required' },
    });
  });

  it('asks for the 900 second window', async () => {
    const seen: unknown[] = [];
    const guard = new ReauthGuard({
      hasRecentReauthentication: async (id: string, seconds: number) => {
        seen.push([id, seconds]);
        return true;
      },
    } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(seen[0]).toEqual(['session-id', 900]);
  });
});

describe('an offline session store', () => {
  it.each([
    ['ConsentGuard', () => new ConsentGuard(null)],
    ['ReauthGuard', () => new ReauthGuard(null)],
  ])('makes %s report 503 rather than crash', async (_name, build) => {
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(build().canActivate(context)).rejects.toThrow(ServiceUnavailableException);
  });

  it('makes CsrfGuard report 503 on a write but still allow a read', async () => {
    const guard = new CsrfGuard(null);
    await expect(guard.canActivate(contextFor({ method: 'GET' }))).resolves.toBe(true);
    await expect(guard.canActivate(contextFor({ method: 'POST' }))).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});

describe('InternalTokenGuard', () => {
  it('rejects a request without the shared token', () => {
    const guard = new InternalTokenGuard(CONFIG_PRODUCTION as never, REQUIRE_INTERNAL_TOKEN);
    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });

  it('rejects a token of the right length but the wrong value', () => {
    const guard = new InternalTokenGuard(CONFIG_PRODUCTION as never, REQUIRE_INTERNAL_TOKEN);
    const context = contextFor({ headers: { 'x-internal-token': 'j'.repeat(32) } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a token of the wrong length without throwing from timingSafeEqual', () => {
    const guard = new InternalTokenGuard(CONFIG_PRODUCTION as never, REQUIRE_INTERNAL_TOKEN);
    const context = contextFor({ headers: { 'x-internal-token': 'i'.repeat(31) } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('accepts the configured token', () => {
    const guard = new InternalTokenGuard(CONFIG_PRODUCTION as never, REQUIRE_INTERNAL_TOKEN);
    const context = contextFor({ headers: { 'x-internal-token': 'i'.repeat(32) } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a narrowly annotated public-internal endpoint without the token', () => {
    const guard = new InternalTokenGuard(CONFIG_PRODUCTION as never, SKIP_INTERNAL_TOKEN);
    expect(guard.canActivate(contextFor({}))).toBe(true);
  });

  it('does not turn the shared token into a local-development login', () => {
    const guard = new InternalTokenGuard(CONFIG_DEVELOPMENT as never, REQUIRE_INTERNAL_TOKEN);
    expect(guard.canActivate(contextFor({}))).toBe(true);
  });
});
