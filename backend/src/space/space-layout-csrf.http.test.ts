import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';

const actor = '1bc922db-9bc4-4d35-951c-8b2c17ebd892';
const spaceId = 'c45b5d83-54ab-4971-9ca5-f10c671ac94a';
const updateSpaceLayout = vi.fn().mockResolvedValue(true);
const verifyCsrf = vi.fn().mockImplementation(async (_session: string, token: string) => token === 'valid-token');

describe('space owner layout HTTP CSRF', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        { provide: SpaceService, useValue: { updateSpaceLayout } },
        { provide: SessionRepository, useValue: { verifyCsrf } },
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { id: 'session-1', user_id: actor };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = mod.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => { vi.clearAllMocks(); });
  it('rejects missing and invalid tokens before the layout service is invoked', async () => {
    await request(app.getHttpServer()).put(`/spaces/${spaceId}/layout`).send({ layout: { theme: 'safe' } }).expect(403);
    await request(app.getHttpServer()).put(`/spaces/${spaceId}/layout`).set('x-csrf-token', 'invalid').send({ layout: { theme: 'safe' } }).expect(403);
    expect(updateSpaceLayout).not.toHaveBeenCalled();
  });
  it('allows only a verified same-session token and preserves owner binding', async () => {
    await request(app.getHttpServer()).put(`/spaces/${spaceId}/layout`).set('x-csrf-token', 'valid-token').send({ layout: { theme: 'safe' } }).expect(200, { ok: true });
    expect(updateSpaceLayout).toHaveBeenCalledExactlyOnceWith(actor, spaceId, { theme: 'safe' });
    expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'valid-token');
  });
});
