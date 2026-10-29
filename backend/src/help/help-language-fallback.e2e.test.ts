import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';

describe('verified help bilingual HTTP API', () => {
  let app: INestApplication;
  const search = vi.fn();
  beforeAll(async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const moduleRef = await Test.createTestingModule({
      controllers: [HelpController],
      providers: [{ provide: HelpRepository, useValue: { search } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); vi.unstubAllEnvs(); });
  it('returns a verified alternate-language result only after an explicit boolean opt-in', async () => {
    search.mockReset().mockResolvedValueOnce([]).mockResolvedValueOnce([{ article_id: 'x', locale: 'en', slug: 'backup', title: 'Backup' }]);
    const response = await request(app.getHttpServer()).post('/api/v1/help/search')
      .send({ locale: 'ko', query: 'backup', fallbackToOtherLocale: true });
    expect(response.status).toBe(201);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toMatchObject({ fallbackUsed: true, requestedLocale: 'ko', resultLocale: 'en' });
    expect(search.mock.calls.map(args => args[0])).toEqual(['ko', 'en']);
  });
  it('rejects string boolean and unknown properties before any DB access', async () => {
    search.mockReset();
    for (const body of [{ locale: 'ko', fallbackToOtherLocale: 'true' }, { locale: 'ko', fallbackToOtherLocale: true, userId: 'forged' }]) {
      const response = await request(app.getHttpServer()).post('/api/v1/help/search').send(body);
      expect(response.status).toBe(400);
    }
    expect(search).not.toHaveBeenCalled();
  });
});
