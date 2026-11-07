import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';
import { ContentService } from './content.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

describe('public gallery caption order HTTP integration', () => {
  let app: INestApplication;
  const publicPhotos = vi.fn(async () => []);
  beforeAll(async () => {
    let builder = Test.createTestingModule({
      controllers: [ContentController, AppContentController],
      providers: [{ provide: ContentService, useValue: { publicPhotos } }],
    });
    // Only public GET /photos is under test. Unrelated admin write guards
    // need no real session, CSRF, or operator configuration in this harness.
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard,
      ReauthGuard, AdminGuard, AdminSessionGuard]) {
      builder = builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const testingModule = await builder.compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('accepts an optional caption order without a session or DB write', async () => {
    const response = await request(app.getHttpServer()).get('/photos?sort=caption');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ photos: [] });
    expect(publicPhotos).toHaveBeenCalledWith({ sort: 'caption' });
  });
  it('also supports the documented /content/photos alias over HTTP', async () => {
    expect((await request(app.getHttpServer()).get('/content/photos?sort=caption')).status).toBe(200);
    expect((await request(app.getHttpServer()).get('/content/photos?sort=caption&sort=caption')).status).toBe(400);
  });
  it.each(['?sort=caption&sort=caption', '?sort=recent', '?q=private'])(
    'rejects unsupported query %s with HTTP 400', async (query) => {
      expect((await request(app.getHttpServer()).get(`/photos${query}`)).status).toBe(400);
    },
  );
});
