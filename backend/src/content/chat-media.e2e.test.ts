import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionRepository } from '../auth/session.repository';
import { CONFIG } from '../core/config';
import { ChatImageStorage } from './chat-image-storage';
import { ChatUploadController } from './chat-upload.controller';

// The real guards run over HTTP; only the session store and filesystem are doubles.
describe('chat media HTTP privacy boundary', () => {
  let app: INestApplication;
  const bytes = Buffer.from('private image bytes');
  const read = vi.fn().mockResolvedValue({ buffer: bytes, mimeType: 'image/png' });
  const get = vi.fn(async (token: string | undefined) =>
    token === 'valid' ? { user_id: 'member-1' } : null,
  );

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatUploadController],
      providers: [
        { provide: ChatImageStorage, useValue: { read, save: vi.fn() } },
        { provide: SessionRepository, useValue: { get } },
        { provide: CONFIG, useValue: { cookieSecure: false } },
      ],
    }).compile();
    app = testingModule.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('refuses anonymous requests before looking up media bytes', async () => {
    read.mockClear();
    const response = await request(app.getHttpServer()).get('/api/v1/content/chat/media/chat_example.png');
    expect(response.status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it('refuses unknown sessions before reading the filesystem', async () => {
    read.mockClear();
    const response = await request(app.getHttpServer())
      .get('/api/v1/content/chat/media/chat_example.png')
      .set('cookie', 'mv_session=invalid');
    expect(response.status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it('serves logged-in requests without allowing public or browser caching', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/content/chat/media/chat_example.png')
      .set('cookie', 'mv_session=valid');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-type']).toMatch(/^image\/png/);
    expect(response.body).toEqual(bytes);
  });
});
