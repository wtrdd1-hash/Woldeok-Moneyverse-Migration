import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

const OWNER = '00000000-0000-4000-8000-000000000001';
const IDENTITY = '00000000-0000-4000-8000-000000000002';

function expectPrivate(response: request.Response) {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
}

describe('owner account identity HTTP privacy headers', () => {
  let app: INestApplication;
  const account = {
    linkedIdentities: vi.fn().mockResolvedValue([{ id: IDENTITY, provider: 'discord' }]),
    unlinkIdentity: vi.fn().mockResolvedValue({ unlinked: true }),
    softDeleteAccount: vi.fn().mockResolvedValue({ status: 'scheduled' }),
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [{ provide: AccountService, useValue: account }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { user_id: OWNER };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .overrideGuard(ReauthGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('prevents caching and indexing of linked sign-in methods', async () => {
    const response = await request(app.getHttpServer()).get('/account/identities').expect(200);
    expectPrivate(response);
    expect(account.linkedIdentities).toHaveBeenCalledWith(OWNER);
  });

  it('prevents caching of an identity unlink receipt', async () => {
    const response = await request(app.getHttpServer()).delete('/account/identities/' + IDENTITY).expect(200);
    expectPrivate(response);
    expect(account.unlinkIdentity).toHaveBeenCalledWith(OWNER, { identityId: IDENTITY });
  });

  it('prevents caching of an account deletion acceptance receipt', async () => {
    const response = await request(app.getHttpServer()).delete('/account').expect(202);
    expectPrivate(response);
    expect(account.softDeleteAccount).toHaveBeenCalledWith(OWNER);
  });
});
