import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const publicList = vi.fn(async () => []);

describe('public board text-only real HTTP routing', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicStockCommunityController],
      providers: [{ provide: StockCommunityService, useValue: { publicList } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('accepts a combined public text-only query with verified-empty proof', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/board/public/stock-posts?stock=WDX&q=hello&media=text');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [], filterApplied: 'text' });
    expect(publicList).toHaveBeenCalledWith('WDX', 'hello', 'text');
  });

  it('rejects duplicate or unknown media filters before calling the service', async () => {
    const count = publicList.mock.calls.length;
    for (const query of ['media=image', 'media=text&media=text', 'media=TEXT']) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/board/public/stock-posts?${query}`);
      expect(response.status).toBe(400);
    }
    expect(publicList).toHaveBeenCalledTimes(count);
  });

  it('preserves the unfiltered public response shape', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/board/public/stock-posts');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
  });
});
