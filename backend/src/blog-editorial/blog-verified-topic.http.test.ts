import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlogVerifiedPublicController } from './blog-verified.controller';
import { BlogVerifiedRepository } from './blog-verified.repository';

describe('GET /api/v1/blog/verified public subject HTTP contract', () => {
  let app: INestApplication | undefined;
  const list = vi.fn().mockResolvedValue([
    { slug: '2026-10-28-cn-coding-5', topic: 'CODING', status: 'PUBLISHED' },
    { slug: '2026-10-28-kr-economy-0', topic: 'ECONOMY', status: 'PUBLISHED' },
  ]);
  async function start() {
    const moduleRef = await Test.createTestingModule({
      controllers: [BlogVerifiedPublicController],
      providers: [{ provide: BlogVerifiedRepository, useValue: { list } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  }
  afterEach(async () => { await app?.close(); app = undefined; list.mockClear(); });

  it('serves filtered verified publications over the actual public route', async () => {
    await start();
    const res = await request(app!.getHttpServer()).get('/api/v1/blog/verified?topic=CODING');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, count: 1, scope: 'LATEST_150_PUBLISHED' });
    expect(res.body.posts).toEqual([{ slug: '2026-10-28-cn-coding-5', topic: 'CODING', status: 'PUBLISHED' }]);
    expect(list).toHaveBeenCalledExactlyOnceWith('CODING');
  });

  it('rejects repeated and unsupported filters at the HTTP boundary', async () => {
    await start();
    for (const query of ['?topic=CODING&topic=ECONOMY', '?topic=coding', '?topic=CODING&admin=1']) {
      const res = await request(app!.getHttpServer()).get('/api/v1/blog/verified' + query);
      expect(res.status).toBe(400);
    }
    expect(list).not.toHaveBeenCalled();
  });
});
