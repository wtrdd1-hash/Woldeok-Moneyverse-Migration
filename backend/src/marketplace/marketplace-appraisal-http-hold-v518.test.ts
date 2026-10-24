import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

const issueCertificate = vi.fn().mockResolvedValue({ certId: 'FORGED' });
const readCertificates = vi.fn().mockResolvedValue([{ certId: 'PREVIOUS' }]);

describe('authenticated marketplace appraisal HTTP containment', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [{ provide: MarketplaceService, useValue: {
        requestAppraisal: issueCertificate,
        listAppraisals: readCertificates,
      } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: { user_id: string } }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-1111-4111-8111-111111111111' };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns 503 for a forged authenticated certificate request without calling the issuance service', async () => {
    const result = await request(app.getHttpServer()).post('/api/v1/marketplace/appraisals')
      .send({ itemId: 'unowned_item', itemName: 'Forged', rarity: 'LEGENDARY' });
    expect(result.status).toBe(503);
    expect(result.body.message).toContain('ownership verification');
    expect(issueCertificate).not.toHaveBeenCalled();
  });

  it('keeps owner certificate reads available', async () => {
    const result = await request(app.getHttpServer()).get('/api/v1/marketplace/appraisals');
    expect(result.status).toBe(200);
    expect(result.body).toEqual([{ certId: 'PREVIOUS' }]);
    expect(readCertificates).toHaveBeenCalled();
  });
});
