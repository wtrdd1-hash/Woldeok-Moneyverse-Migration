import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CoreModule } from '../core/core.module';
import { AuthModule } from './auth.module';
import { AdminRolesRepository } from './admin-roles.repository';
import { AdminGuard } from './guards/admin.guard';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { ReauthGuard } from './guards/reauth.guard';
import { SecondFactorGuard } from './guards/second-factor.guard';
import { SessionGuard } from './guards/session.guard';
import { SecondFactorRepository } from './second-factor.repository';
import { SessionRepository } from './session.repository';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function compile() {
  process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
  process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
  delete process.env.DATABASE_URL;
  return Test.createTestingModule({ imports: [CoreModule, AuthModule] }).compile();
}

/**
 * The guard unit tests construct each guard directly, which proves the logic
 * but not the wiring. These resolve them through the Nest container, so a
 * provider that cannot be injected fails here rather than at the first
 * request in production.
 */
describe('AuthModule wiring', () => {
  it('resolves every guard through the container', async () => {
    const moduleRef = await compile();
    for (const guard of [
      SessionGuard,
      AuthenticatedGuard,
      ConsentGuard,
      CsrfGuard,
      AdminGuard,
      AdminSessionGuard,
      ReauthGuard,
      SecondFactorGuard,
      InternalTokenGuard,
    ]) {
      expect(moduleRef.get(guard), guard.name).toBeInstanceOf(guard);
    }
    await moduleRef.close();
  });

  it('yields a null session repository when no DATABASE_URL is configured', async () => {
    const moduleRef = await compile();
    expect(moduleRef.get(SessionRepository, { strict: false })).toBeNull();
    await moduleRef.close();
  });

  it('yields a null second factor repository when no DATABASE_URL is configured', async () => {
    const moduleRef = await compile();
    expect(moduleRef.get(SecondFactorRepository, { strict: false })).toBeNull();
    await moduleRef.close();
  });

  it('still resolves AdminRolesRepository with no pool, reporting no roles', async () => {
    const moduleRef = await compile();
    const repository = moduleRef.get(AdminRolesRepository);
    await expect(repository.currentRoles('user-id')).resolves.toEqual([]);
    await moduleRef.close();
  });
});
