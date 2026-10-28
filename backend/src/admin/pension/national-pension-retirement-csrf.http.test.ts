import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';
import { PublicNationalPensionController } from './national-pension.controller';
import { NationalPensionService } from './national-pension.service';

describe('Member pension retirement toggle HTTP authorization boundary', () => {
  let app: INestApplication;
  const toggleRetirement = vi.fn().mockResolvedValue({ status: 'RETIRED_RECEIVING' });
  const verifyCsrf = vi.fn().mockImplementation(async (_id: string, token: string) => token === 'valid-token');
  const hasCurrentUserConsent = vi.fn().mockResolvedValue(true);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [PublicNationalPensionController],
      providers: [
        { provide: NationalPensionService, useValue: { toggleRetirement } },
        { provide: SessionRepository, useValue: { verifyCsrf, hasCurrentUserConsent } },
        CsrfGuard,
        ConsentGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { id: 'session-1', user_id: 'member-1' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('rejects absent and invalid CSRF tokens without changing retirement state', async () => {
    toggleRetirement.mockClear();
    await request(app.getHttpServer()).post('/pension/toggle-retire').expect(403);
    await request(app.getHttpServer()).post('/pension/toggle-retire').set('x-csrf-token', 'invalid').expect(403);
    expect(toggleRetirement).not.toHaveBeenCalled();
  });

  it('requires current consent before retirement state changes', async () => {
    toggleRetirement.mockClear();
    hasCurrentUserConsent.mockResolvedValueOnce(false);
    await request(app.getHttpServer()).post('/pension/toggle-retire').set('x-csrf-token', 'valid-token').expect(428);
    expect(toggleRetirement).not.toHaveBeenCalled();
  });

  it('accepts a valid same-session token with current consent', async () => {
    toggleRetirement.mockClear();
    await request(app.getHttpServer()).post('/pension/toggle-retire').set('x-csrf-token', 'valid-token').expect(201);
    expect(toggleRetirement).toHaveBeenCalledOnce();
    expect(toggleRetirement).toHaveBeenCalledWith('member-1');
  });
});
