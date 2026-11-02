import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';
import { AdminTreasuryBondController, PublicTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondService } from './treasury-bond.service';

const verifyCsrf = vi.fn(async (_id: string, token: string) => token === 'session-bound');
const updateBondStatus = vi.fn(async () => true);
const toggleAutoRollover = vi.fn(async () => true);

vi.mock('../../auth/session.context', async (original) => ({
  ...(await original<typeof import('../../auth/session.context')>()),
  requireUserId: () => '11111111-1111-4111-8111-111111111111',
}));

describe('treasury bond state-changing HTTP CSRF boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminTreasuryBondController, PublicTreasuryBondController],
      providers: [
        { provide: SessionRepository, useValue: { verifyCsrf } },
        { provide: TreasuryBondService, useValue: { updateBondStatus, toggleAutoRollover } },
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (context: ExecutionContext) => {
        context.switchToHttp().getRequest().session = { id: 'active-session' };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => { vi.clearAllMocks(); });

  const writes = [
    { method: 'post' as const, path: '/admin/bonds/distribute-coupons', body: {}, expected: 503 },
    { method: 'put' as const, path: '/admin/bonds/bond-1/status', body: { status: 'CLOSED' }, expected: 200 },
    { method: 'put' as const, path: '/bonds/holdings/holding-1/rollover', body: { enabled: true }, expected: 200 },
  ];

  for (const { method, path, body, expected } of writes) {
    it(`${method.toUpperCase()} ${path} denies missing CSRF`, async () => {
      await request(app.getHttpServer())[method](path).send(body).expect(403);
      expect(verifyCsrf).not.toHaveBeenCalled();
      expect(updateBondStatus).not.toHaveBeenCalled();
      expect(toggleAutoRollover).not.toHaveBeenCalled();
    });
    it(`${method.toUpperCase()} ${path} denies wrong session CSRF`, async () => {
      await request(app.getHttpServer())[method](path).set('x-csrf-token', 'invalid').send(body).expect(403);
      expect(verifyCsrf).toHaveBeenCalledWith('active-session', 'invalid');
      expect(updateBondStatus).not.toHaveBeenCalled();
      expect(toggleAutoRollover).not.toHaveBeenCalled();
    });
    it(`${method.toUpperCase()} ${path} retains authorized behavior with valid CSRF`, async () => {
      await request(app.getHttpServer())[method](path).set('x-csrf-token', 'session-bound').send(body).expect(expected);
      expect(verifyCsrf).toHaveBeenCalledWith('active-session', 'session-bound');
    });
  }
});
