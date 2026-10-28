import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AiNewsController } from './ai-news.controller';
import { AiNewsService } from './ai-news.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('AI news HTTP publication consent', () => {
  let app: INestApplication;
  const autoGenerateAndPublish = vi.fn(async (_actor: string, _runtime: unknown, publish: boolean) => ({
    generated: 1, published: publish, batchId: '33333333-3333-4333-8333-333333333333',
    engine: 'test-model',
  }));

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [AiNewsController],
      providers: [{ provide: AiNewsService, useValue: { autoGenerateAndPublish } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard, ReauthGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: ACTOR };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('defaults an omitted checkbox to draft-only through HTTP', async () => {
    const response = await request(app.getHttpServer()).post('/admin/ai-news/auto-generate').send({});
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ generated: 1, published: false });
    expect(autoGenerateAndPublish).toHaveBeenLastCalledWith(ACTOR, undefined, false);
  });

  it('honors an explicit false checkbox through HTTP', async () => {
    const response = await request(app.getHttpServer()).post('/admin/ai-news/auto-generate').send({ publishImmediate: false });
    expect(response.status).toBe(201);
    expect(response.body.published).toBe(false);
    expect(autoGenerateAndPublish).toHaveBeenLastCalledWith(ACTOR, undefined, false);
  });

  it('honors explicit true through HTTP', async () => {
    const response = await request(app.getHttpServer()).post('/admin/ai-news/auto-generate').send({ publishImmediate: true });
    expect(response.status).toBe(201);
    expect(response.body.published).toBe(true);
    expect(autoGenerateAndPublish).toHaveBeenLastCalledWith(ACTOR, undefined, true);
  });

  it('rejects string truthiness instead of silently publishing', async () => {
    const before = autoGenerateAndPublish.mock.calls.length;
    const response = await request(app.getHttpServer()).post('/admin/ai-news/auto-generate').send({ publishImmediate: 'true' });
    expect(response.status).toBe(400);
    expect(autoGenerateAndPublish.mock.calls.length).toBe(before);
  });
});
