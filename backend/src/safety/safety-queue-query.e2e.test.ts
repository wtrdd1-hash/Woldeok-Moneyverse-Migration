import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';

describe('moderation queue HTTP contract with simulated authorized session', () => {
  let app: INestApplication;
  const adminListTakedowns = vi.fn().mockResolvedValue({ items: [], count: 0 });
  const adminListChatReports = vi.fn().mockResolvedValue({ items: [], count: 0 });

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const builder = Test.createTestingModule({
      controllers: [SafetyController],
      providers: [{ provide: SafetyService, useValue: { adminListTakedowns, adminListChatReports } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue(allow);
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-1111-4111-8111-111111111111' };
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => app?.close());

  it.each(['/api/v1/admin/safety/takedowns', '/api/v1/admin/safety/chat-reports'])(
    '%s rejects malformed pagination with HTTP 400 and no repository call',
    async (path) => {
      adminListTakedowns.mockClear();
      adminListChatReports.mockClear();
      const response = await request(app.getHttpServer()).get(path).query({ limit: '50bad', offset: '0' });
      expect(response.status).toBe(400);
      expect(adminListTakedowns).not.toHaveBeenCalled();
      expect(adminListChatReports).not.toHaveBeenCalled();
    },
  );

  it('preserves the valid takedown filter and page through the HTTP boundary', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/safety/takedowns')
      .query({ status: 'TRIAGED', limit: '20', offset: '40' });
    expect(response.status).toBe(200);
    expect(adminListTakedowns).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111', 'TRIAGED', 20, 40,
    );
  });
});
