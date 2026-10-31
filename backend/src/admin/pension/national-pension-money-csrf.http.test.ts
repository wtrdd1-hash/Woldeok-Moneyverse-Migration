import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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

const contribute = vi.fn().mockResolvedValue({ receipt: 'contribution' });
const liquidate = vi.fn().mockResolvedValue({ receipt: 'liquidation' });
const verifyCsrf = vi.fn().mockImplementation(async (_id: string, token: string) => token === 'valid-token');
const hasCurrentUserConsent = vi.fn().mockResolvedValue(true);

const writes = [
  { path: '/pension/contribute', body: { amountWld: '100' }, action: contribute, expected: ['member-1', '100', undefined] },
  { path: '/pension/liquidate', body: {}, action: liquidate, expected: ['member-1'] },
] as const;

describe('Member pension money-moving HTTP consent and CSRF boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [PublicNationalPensionController],
      providers: [
        { provide: NationalPensionService, useValue: { contribute, liquidate } },
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
  beforeEach(() => {
    vi.clearAllMocks();
    hasCurrentUserConsent.mockResolvedValue(true);
  });

  for (const { path, body, action, expected } of writes) {
    it(`${path} denies missing/invalid CSRF without executing a financial mutation`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'invalid').send(body).expect(403);
      expect(action).not.toHaveBeenCalled();
    });
    it(`${path} denies expired consent before executing a financial mutation`, async () => {
      hasCurrentUserConsent.mockResolvedValue(false);
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'valid-token').send(body).expect(428);
      expect(action).not.toHaveBeenCalled();
    });
    it(`${path} allows same-session CSRF and current consent`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'valid-token').send(body).expect(201);
      expect(action).toHaveBeenCalledExactlyOnceWith(...expected);
    });
  }
});
