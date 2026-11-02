import { GUARDS_METADATA } from '@nestjs/common/constants';
import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ChatService } from '../chat/chat.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const guards = [SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard];

describe('admin broadcast delivery truth and replay safety', () => {
  let app: INestApplication;
  const users = vi.fn();
  const recordAudit = vi.fn();
  const openConversation = vi.fn();
  const sendMessage = vi.fn();

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: { users, recordAudit } },
        { provide: ChatService, useValue: { openConversation, sendMessage } },
      ],
    });
    for (const guard of guards) {
      builder.overrideGuard(guard).useValue(guard === SessionGuard
        ? { canActivate: (ctx: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
          ctx.switchToHttp().getRequest().session = { id: 'test-session', user_id: '00000000-0000-4000-8000-000000000001' };
          return true;
        } }
        : { canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('retains administrator, console session and CSRF protection on the route', () => {
    const controllerGuards = Reflect.getMetadata(GUARDS_METADATA, AdminController) as unknown[];
    const methodGuards = Reflect.getMetadata(GUARDS_METADATA, AdminController.prototype.broadcastMessage) as unknown[];
    expect(controllerGuards).toContain(AdminGuard);
    expect(methodGuards).toContain(AdminSessionGuard);
    expect(methodGuards).toContain(CsrfGuard);
  });

  it.each([2, 101])('does not report a successful broadcast for a %i-member cohort without durable fanout receipts', async (size) => {
    users.mockResolvedValue(Array.from({ length: size }, (_, i) => ({ user_id: `user-${i}` })));
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/messages/broadcast')
      .send({ title: 'Service update', body: 'This is an official update.' });
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('ADMIN_BROADCAST_DELIVERY_UNVERIFIED');
    expect(users).not.toHaveBeenCalled();
    expect(openConversation).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(recordAudit).not.toHaveBeenCalled();
  });
});
