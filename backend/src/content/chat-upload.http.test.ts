import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChatUploadController } from './chat-upload.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

describe('chat media HTTP containment (no database, no storage)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const pass = { canActivate: () => true };
    const moduleRef = await Test.createTestingModule({ controllers: [ChatUploadController] })
      .overrideGuard(SessionGuard).useValue(pass)
      .overrideGuard(AuthenticatedGuard).useValue(pass)
      .overrideGuard(ConsentGuard).useValue(pass)
      .overrideGuard(CsrfGuard).useValue(pass)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns HTTP 503 for multipart upload and never issues a success receipt', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/content/chat/upload')
      .attach('file', Buffer.from('image'), 'test.png');
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ statusCode: 503 });
    expect(JSON.stringify(response.body)).not.toContain('storageKey');
  });

  it('returns HTTP 404 with no-store and no bytes for a legacy key', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/content/chat/media/chat_00000000-0000-0000-0000-000000000000.png');
    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.body).not.toHaveProperty('storageKey');
    expect(response.text).not.toContain('image/png');
  });
});
