import { GUARDS_METADATA } from '@nestjs/common/constants';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminFxController, PublicFxController } from '../admin/fx/fx.controller';
import { ChatController } from '../chat/chat.controller';
import { ChatService } from '../chat/chat.service';
import { ClubController } from '../club/club.controller';
import { WarfareController } from '../club/warfare.controller';
import { BurnEventController } from '../economy/burn-event.controller';
import { CollectionController } from '../collection/collection.controller';
import { SpaceController } from '../space/space.controller';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionRepository } from '../auth/session.repository';

function classGuards(target: unknown): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, target as object) as unknown[]) ?? [];
}

function methodGuards(target: { prototype: Record<string, unknown> }, method: string): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, target.prototype[method]) as unknown[]) ?? [];
}

describe('OWASP CSRF Defense Audit - Controller Guard Bindings', () => {
  it('enforces CsrfGuard at class level on ChatController', () => {
    expect(classGuards(ChatController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard at class level on ClubController', () => {
    expect(classGuards(ClubController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard at class level on WarfareController', () => {
    expect(classGuards(WarfareController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard at class level on CollectionController', () => {
    expect(classGuards(CollectionController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard at class level on SpaceController', () => {
    expect(classGuards(SpaceController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard at class level on AdminFxController', () => {
    expect(classGuards(AdminFxController)).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard on PublicFxController mutation endpoints', () => {
    expect(methodGuards(PublicFxController, 'createForwardContract')).toContain(CsrfGuard);
    expect(methodGuards(PublicFxController, 'swapWldToUsd')).toContain(CsrfGuard);
    expect(methodGuards(PublicFxController, 'swapUsdToWld')).toContain(CsrfGuard);
  });

  it('enforces CsrfGuard on BurnEventController participateBurnDraw endpoint', () => {
    expect(methodGuards(BurnEventController, 'participateBurnDraw')).toContain(CsrfGuard);
  });
});

describe('OWASP CSRF Defense Audit - HTTP Interception Behavior', () => {
  let app: INestApplication;
  const mockVerifyCsrf = vi.fn();
  const mockSessionRepo = {
    verifyCsrf: mockVerifyCsrf,
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: { markAsRead: vi.fn().mockResolvedValue({ lastReadSequence: '1' }) } },
        { provide: SessionRepository, useValue: mockSessionRepo },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();

    app = testingModule.createNestApplication();
    app.use((req: { session?: { id: string; user_id: string } }, _res: unknown, next: () => void) => {
      req.session = { id: 'test-session-1234', user_id: '11111111-1111-4111-8111-111111111111' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('blocks state-changing mutation with HTTP 403 when x-csrf-token is absent', async () => {
    mockVerifyCsrf.mockClear();
    const res = await request(app.getHttpServer())
      .post('/chat/conversations/22222222-2222-4222-8222-222222222222/read')
      .send({ sequence: '10' })
      .expect(403);

    expect(res.body.message).toBe('csrf token required');
    expect(mockVerifyCsrf).not.toHaveBeenCalled();
  });

  it('blocks state-changing mutation with HTTP 403 when x-csrf-token is invalid', async () => {
    mockVerifyCsrf.mockResolvedValueOnce(false);
    const res = await request(app.getHttpServer())
      .post('/chat/conversations/22222222-2222-4222-8222-222222222222/read')
      .set('x-csrf-token', 'attacker-forged-token')
      .send({ sequence: '10' })
      .expect(403);

    expect(res.body.message).toBe('csrf token rejected');
    expect(mockVerifyCsrf).toHaveBeenCalledWith('test-session-1234', 'attacker-forged-token');
  });

  it('allows state-changing mutation through when valid x-csrf-token is presented', async () => {
    mockVerifyCsrf.mockResolvedValueOnce(true);
    await request(app.getHttpServer())
      .post('/chat/conversations/22222222-2222-4222-8222-222222222222/read')
      .set('x-csrf-token', 'valid-csrf-token-token')
      .send({ sequence: '10' })
      .expect(201);

    expect(mockVerifyCsrf).toHaveBeenCalledWith('test-session-1234', 'valid-csrf-token-token');
  });
});
