import 'reflect-metadata';
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = 'a0000000-0000-4000-8000-000000000001';
const thread = 'b0000000-0000-4000-8000-000000000002';
const path = `/api/v1/support/threads/${thread}/transcript/text`;

describe('owner-private support TXT HTTP boundary', () => {
  let app: INestApplication | undefined;
  const messages = vi.fn();
  async function start(authorized = true) {
    const moduleRef = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: SupportRepository, useValue: { messages } }],
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
  afterEach(async () => { await app?.close(); app = undefined; messages.mockReset(); });

  it('serves only session-bound owner data with private/noindex headers', async () => {
    messages.mockResolvedValue([{ message_id: 'm1', sender_kind: 'admin', body: 'private reply', created_at: new Date('2026-10-28T00:00:00Z') }]);
    await start();
    const res = await request(app!.getHttpServer()).get(path).expect(200);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.body.threadId).toBe(thread);
    expect(res.body.text).toContain('private reply');
    expect(messages).toHaveBeenCalledWith(actor, thread, 500);
  });

  it('rejects malformed identifiers before PostgreSQL access', async () => {
    await start();
    await request(app!.getHttpServer()).get('/api/v1/support/threads/invalid/transcript/text').expect(400);
    expect(messages).not.toHaveBeenCalled();
  });

  it('does not read any private messages without member authentication and consent', async () => {
    await start(false);
    await request(app!.getHttpServer()).get(path).expect(403);
    expect(messages).not.toHaveBeenCalled();
  });
});
