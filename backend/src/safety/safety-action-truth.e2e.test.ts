import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SafetyController } from './safety.controller';
import { SafetyRepository } from './safety.repository';
import { SafetyService } from './safety.service';

describe('chat moderation HTTP status-only receipt with simulated authorized session', () => {
  let app: INestApplication;
  const record = vi.fn().mockResolvedValue(true);
  const actorId = '11111111-1111-4111-8111-111111111111';
  const reportId = '22222222-2222-4222-8222-222222222222';

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const builder = Test.createTestingModule({
      controllers: [SafetyController],
      providers: [
        SafetyService,
        { provide: SafetyRepository, useValue: { adminActionChatReport: record } },
      ],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue(allow);
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: actorId };
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  beforeEach(() => record.mockClear());
  afterAll(async () => app?.close());

  it.each(['ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'])(
    'returns only a persisted decision receipt for %s, never enforcement proof',
    async (action) => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/safety/chat-reports/' + reportId + '/action')
        .send({ action, note: 'evidence reviewed' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true, reportId, newStatus: action,
        effect: 'report_status_only', enforcementApplied: false, notificationSent: false,
      });
      expect(record).toHaveBeenCalledWith(actorId, reportId, action, 'evidence reviewed');
    },
  );

  it('rejects invalid action before any database write', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/admin/safety/chat-reports/' + reportId + '/action')
      .send({ action: 'ACCOUNT_BANNED', note: 'invalid' });
    expect(res.status).toBe(400);
    expect(record).not.toHaveBeenCalled();
  });
});
