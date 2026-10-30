import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = '11111111-1111-4111-8111-111111111111';

describe('owner support status filter HTTP contract', () => {
  let app: INestApplication | undefined;
  const myThreads = vi.fn(async () => [{ thread_id: actor, subject: 'owner thread', status: 'resolved' }]);

  async function start(authorized = true) {
    const moduleRef = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: SupportRepository, useValue: { myThreads } }],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
          ctx.switchToHttp().getRequest().session = { user_id: actor };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => authorized })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => authorized })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  }

  afterEach(async () => { await app?.close(); app = undefined; myThreads.mockClear(); });

  it('binds approved status to authenticated owner and never caches the response', async () => {
    await start();
    const response = await request(app!.getHttpServer()).get('/api/v1/support/threads?status=resolved').expect(200);
    expect(response.body.threads).toHaveLength(1);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(myThreads).toHaveBeenCalledWith(actor, 'resolved');
  });

  it.each(['status=', 'status=closed', 'status=open&status=resolved'])(
    'rejects invalid status query %s before any owner read', async (query) => {
      await start();
      await request(app!.getHttpServer()).get(`/api/v1/support/threads?${query}`).expect(400);
      expect(myThreads).not.toHaveBeenCalled();
    },
  );

  it('preserves the unfiltered default and refuses unauthenticated access', async () => {
    await start();
    await request(app!.getHttpServer()).get('/api/v1/support/threads').expect(200);
    expect(myThreads).toHaveBeenCalledWith(actor, null);
    await app!.close(); app = undefined; myThreads.mockClear();
    await start(false);
    await request(app!.getHttpServer()).get('/api/v1/support/threads?status=resolved').expect(403);
    expect(myThreads).not.toHaveBeenCalled();
  });
});
