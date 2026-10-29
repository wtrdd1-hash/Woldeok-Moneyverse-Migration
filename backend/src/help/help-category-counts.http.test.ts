import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';

describe('verified help category HTTP locale and no-store contract', () => {
  let app: INestApplication;
  const categoryCounts = vi.fn();
  beforeAll(async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const moduleRef = await Test.createTestingModule({
      controllers: [HelpController],
      providers: [{ provide: HelpRepository, useValue: { categoryCounts } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); vi.unstubAllEnvs(); });
  it('serves English approved counts as decimal strings without caching', async () => {
    categoryCounts.mockResolvedValue(['account', 'wallet', 'shop', 'community', 'support'].map(category => ({ category, article_count: category === 'wallet' ? '9007199254740993' : '0' })));
    const response = await request(app.getHttpServer()).get('/api/v1/help/categories?locale=en');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toMatchObject({ locale: 'en', counts: { wallet: '9007199254740993' } });
    expect(categoryCounts).toHaveBeenCalledWith('en');
  });
  it('rejects an unsupported locale and never calls SQL', async () => {
    categoryCounts.mockClear();
    const response = await request(app.getHttpServer()).get('/api/v1/help/categories?locale=ja');
    expect(response.status).toBe(400);
    expect(categoryCounts).not.toHaveBeenCalled();
  });
});
