import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

describe('marketplace appraisal HTTP issuance safety', () => {
  let app: INestApplication;
  const service = {
    listAppraisals: vi.fn(async () => []),
    requestAppraisal: vi.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [{ provide: MarketplaceService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (context: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
          context.switchToHttp().getRequest().session = {
            user_id: '11111111-1111-4111-8111-111111111111',
          };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns 503 for a forged item without issuing a fee or certificate', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/marketplace/appraisals')
      .send({ itemId: 'not-owned', itemName: 'Fake item', rarity: 'LEGENDARY' })
      .expect(503);
    expect(response.body).toMatchObject({ statusCode: 503 });
    expect(service.requestAppraisal).not.toHaveBeenCalled();
  });

  it('preserves owner-scoped GET contract and verified empty array', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/marketplace/appraisals')
      .expect(200);
    expect(response.body).toEqual([]);
    expect(service.listAppraisals).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });
});
