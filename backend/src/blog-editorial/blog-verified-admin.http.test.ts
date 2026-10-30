import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BlogVerifiedAdminController } from './blog-verified-admin.controller';
import { BlogVerifiedRepository } from './blog-verified.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('GET /api/v1/admin/blog-verified HTTP actor and privacy boundary', () => {
  let app: INestApplication | undefined;
  async function start(allowed: boolean) {
    const listForAdmin = vi.fn().mockResolvedValue([{ slug: 'withdrawn-article', status: 'WITHDRAWN' }]);
    const moduleRef = await Test.createTestingModule({
      controllers: [BlogVerifiedAdminController],
      providers: [{ provide: BlogVerifiedRepository, useValue: { listForAdmin } }],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (context: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
          context.switchToHttp().getRequest().session = { user_id: ACTOR };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => allowed })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
    return listForAdmin;
  }
  afterEach(async () => { await app?.close(); app = undefined; });

  it('returns withdrawn admin entries with private no-store and noindex', async () => {
    const listForAdmin = await start(true);
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/blog-verified');
    expect(response.status).toBe(200);
    expect(response.body.posts).toEqual([{ slug: 'withdrawn-article', status: 'WITHDRAWN' }]);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.headers['x-robots-tag']).toContain('noindex');
    expect(listForAdmin).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });

  it('denies non-admin requests before any repository read', async () => {
    const listForAdmin = await start(false);
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/blog-verified');
    expect(response.status).toBe(403);
    expect(listForAdmin).not.toHaveBeenCalled();
  });
});
