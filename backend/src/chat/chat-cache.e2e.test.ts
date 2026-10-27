import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionRepository } from '../auth/session.repository';
import { CONFIG } from '../core/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('private chat HTTP cache boundary', () => {
  let app: INestApplication;
  const get = vi.fn(async (token: string | undefined) => token === 'valid'
    ? { id: 'session-1', user_id: 'member-1' } : null);
  const hasCurrentUserConsent = vi.fn(async () => true);
  const listConversations = vi.fn(async () => []);
  const totalUnreadCount = vi.fn(async () => '0');

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: { listConversations, totalUnreadCount } },
        { provide: SessionRepository, useValue: { get, hasCurrentUserConsent } },
        { provide: CONFIG, useValue: { cookieSecure: false } },
      ],
    }).compile();
    app = testingModule.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each(['/api/v1/chat/conversations', '/api/v1/chat/unread-count'])(
    'prevents caching of authenticated member response %s', async (path) => {
      const res = await request(app.getHttpServer()).get(path).set('cookie', 'mv_session=valid');
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('private, no-store');
    },
  );
  it('does not disclose member data to anonymous callers', async () => {
    listConversations.mockClear();
    const res = await request(app.getHttpServer()).get('/api/v1/chat/conversations');
    expect(res.status).toBe(401);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(listConversations).not.toHaveBeenCalled();
  });
});
