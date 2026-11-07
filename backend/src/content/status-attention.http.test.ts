import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';

/** The public Android and web clients must use the real versioned Nest route. */
describe('public status attention HTTP contract', () => {
  let app: INestApplication;
  const serviceStatus = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [{ provide: ContentService, useValue: { serviceStatus } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .overrideGuard(ReauthGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('keeps unfiltered and attention-only reads distinct at /api/v1/status', async () => {
    await request(app.getHttpServer()).get('/api/v1/status').expect(200);
    expect(serviceStatus).toHaveBeenLastCalledWith({ attentionOnly: false });
    await request(app.getHttpServer()).get('/api/v1/status?attentionOnly=1').expect(200);
    expect(serviceStatus).toHaveBeenLastCalledWith({ attentionOnly: true });
  });

  it('rejects duplicate, unknown and malformed filters at the HTTP boundary', async () => {
    serviceStatus.mockClear();
    for (const suffix of ['?attentionOnly=0', '?attentionOnly=1&attentionOnly=1', '?other=1']) {
      await request(app.getHttpServer()).get('/api/v1/status' + suffix).expect(400);
    }
    expect(serviceStatus).not.toHaveBeenCalled();
  });
});
