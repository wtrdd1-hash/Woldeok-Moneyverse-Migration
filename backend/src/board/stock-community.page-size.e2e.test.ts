import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const publicList = vi.fn(async () => []);

describe('public board page size HTTP contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicStockCommunityController],
      providers: [{ provide: StockCommunityService, useValue: { publicList } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('preserves the legacy response shape without a limit', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/board/public/stock-posts');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [] });
  });
  it('returns verified bounded metadata for an explicit display size', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/board/public/stock-posts?limit=25&q=hello');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ posts: [], limitApplied: 25, sourceWindow: 50 });
    expect(publicList).toHaveBeenCalledWith(undefined, 'hello', 25);
  });
  it.each(['limit=0', 'limit=10&limit=25', 'limit=10&page=2'])(
    'rejects invalid or ambiguous display selection %s with HTTP 400', async (query) => {
      const response = await request(app.getHttpServer()).get(`/api/v1/board/public/stock-posts?${query}`);
      expect(response.status).toBe(400);
    },
  );
});
