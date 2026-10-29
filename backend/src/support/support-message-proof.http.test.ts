import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ProblemFilter } from '../core/problem.filter';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const thread = '00000000-0000-4000-8000-000000000002';
const messageId = '00000000-0000-4000-8000-000000000003';
const route = `/api/v1/support/threads/${thread}/messages/${messageId}`;

describe('support exact receipt authenticated HTTP contract', () => {
  let app: INestApplication | undefined;
  const exactMessage = vi.fn();

  async function start(authorized = true) {
    const moduleRef = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: SupportRepository, useValue: { exactMessage } }],
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
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
    exactMessage.mockReset();
  });

  it('returns a no-store exact receipt and binds the authenticated owner', async () => {
    const persisted = { message_id: messageId, sender_kind: 'admin', body: 'reply', created_at: '2026-10-29T00:00:00Z' };
    exactMessage.mockResolvedValue(persisted);
    await start();
    const response = await request(app!.getHttpServer()).get(route).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.message).toEqual(persisted);
    expect(exactMessage).toHaveBeenCalledWith(actor, thread, messageId);
  });

  it('returns 404 on absent receipt without manufacturing success', async () => {
    exactMessage.mockResolvedValue(null);
    await start();
    await request(app!.getHttpServer()).get(route).expect(404);
  });

  it('rejects malformed UUID before querying a support record', async () => {
    await start();
    await request(app!.getHttpServer())
      .get(`/api/v1/support/threads/${thread}/messages/not-a-uuid`).expect(400);
    expect(exactMessage).not.toHaveBeenCalled();
  });

  it('does not query any receipt when member auth or consent is refused', async () => {
    await start(false);
    await request(app!.getHttpServer()).get(route).expect(403);
    expect(exactMessage).not.toHaveBeenCalled();
  });
});
