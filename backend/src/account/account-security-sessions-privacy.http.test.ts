import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';

const OWNER = '00000000-0000-4000-8000-000000000011';
const SESSION = '00000000-0000-4000-8000-000000000012';
const OTHER = '00000000-0000-4000-8000-000000000013';

function expectPrivate(response: request.Response) {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('security sessions HTTP privacy contract', () => {
  let app: INestApplication;
  let authenticated = true;
  const repository = {
    activeSessions: vi.fn().mockResolvedValue([{ sessionId: OTHER, deviceLabel: 'Test device' }]),
    recentEvents: vi.fn().mockResolvedValue([]),
    revokeOtherSession: vi.fn().mockResolvedValue(true),
    revokeOtherSessions: vi.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AccountSecurityController],
      providers: [{ provide: AccountSecurityRepository, useValue: repository }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { id: SESSION, user_id: OWNER };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => authenticated })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .overrideGuard(ReauthGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('keeps active session metadata private', async () => {
    const response = await request(app.getHttpServer()).get('/account/security/sessions').expect(200);
    expectPrivate(response);
    expect(repository.activeSessions).toHaveBeenCalledWith(OWNER, SESSION);
  });

  it('keeps security event metadata private', async () => {
    expectPrivate(await request(app.getHttpServer()).get('/account/security/events').expect(200));
  });

  it('keeps single-session revocation receipt private', async () => {
    const response = await request(app.getHttpServer()).delete(`/account/security/sessions/${OTHER}`).expect(200);
    expectPrivate(response);
  });

  it('keeps bulk-session revocation receipt private', async () => {
    expectPrivate(await request(app.getHttpServer()).post('/account/security/sessions/revoke-others').expect(201));
  });

  it('keeps denied owner session access private', async () => {
    authenticated = false;
    try {
      expectPrivate(await request(app.getHttpServer()).get('/account/security/sessions').expect(403));
    } finally {
      authenticated = true;
    }
  });
});
