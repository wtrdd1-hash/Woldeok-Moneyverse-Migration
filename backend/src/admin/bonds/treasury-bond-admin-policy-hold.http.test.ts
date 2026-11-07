import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { type INestApplication } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import type { Pool } from 'pg';
import request from 'supertest';
import { DiscordAlertService } from '../../discord/discord-alert.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SessionRepository } from '../../auth/session.repository';
import type { RequestWithSession } from '../../auth/session.context';
import { AdminTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondRepository } from './treasury-bond.repository';
import { TreasuryBondService } from './treasury-bond.service';

const BOND_ID = '00000000-0000-4000-8000-000000000031';

describe('admin bond policy write safety', () => {
  const updateBondStatus = vi.fn().mockResolvedValue(true);
  const listBonds = vi.fn().mockResolvedValue([]);
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryBondController],
      providers: [
        TreasuryBondService,
        { provide: DiscordAlertService, useValue: {} },
        { provide: TreasuryBondRepository, useValue: { updateBondStatus, listBonds } },
        { provide: SessionRepository, useValue: { verifyCsrf: vi.fn(async (id: string, token: string) => id === 's1' && token === 'valid-csrf') } },
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: RequestWithSession, _res: unknown, next: () => void) => {
      req.session = { id: 's1', user_id: 'admin-1' } as RequestWithSession['session'];
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('requires session-bound CSRF for admin status/rate updates and manual coupon POST', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryBondController) as unknown[];
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
  });

  it('rejects missing and invalid CSRF before invoking any bond mutation', async () => {
    updateBondStatus.mockClear();
    for (const token of [undefined, 'invalid']) {
      const req = request(app.getHttpServer()).put(`/admin/bonds/${BOND_ID}/status`).send({ status: 'TRADING', annualCouponRateBps: 999 });
      if (token) req.set('x-csrf-token', token);
      await req.expect(403);
    }
    await request(app.getHttpServer()).post('/admin/bonds/distribute-coupons').expect(403);
    expect(updateBondStatus).not.toHaveBeenCalled();
  });

  it('rejects even authenticated bond status/rate writes until a privileged DB contract exists', async () => {
    updateBondStatus.mockClear();
    await request(app.getHttpServer()).put(`/admin/bonds/${BOND_ID}/status`)
      .set('x-csrf-token', 'valid-csrf')
      .send({ status: 'TRADING', annualCouponRateBps: 999 }).expect(503);
    expect(updateBondStatus).not.toHaveBeenCalled();
  });

  it('retains the read-only administrator bond listing without CSRF', async () => {
    await request(app.getHttpServer()).get('/admin/bonds/list').expect(200);
    expect(listBonds).toHaveBeenCalled();
  });
});

describe('bond status policy cannot bypass HTTP through the service or repository', () => {
  it('rejects direct service calls without invoking repository writes', async () => {
    const updateBondStatus = vi.fn().mockResolvedValue(true);
    const service = new TreasuryBondService({ updateBondStatus } as never);
    await expect(service.updateBondStatus(BOND_ID, 'TRADING', 999)).rejects.toMatchObject({ status: 503 });
    expect(updateBondStatus).not.toHaveBeenCalled();
  });

  it('rejects direct repository calls before obtaining a DB client', async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 1 });
    const repository = new TreasuryBondRepository({ query } as unknown as Pool);
    await expect(repository.updateBondStatus(BOND_ID, 'TRADING', 999)).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
});
