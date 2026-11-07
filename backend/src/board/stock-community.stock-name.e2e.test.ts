import { VersioningType, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

describe('public stock-name discovery HTTP integration', () => {
  let app: INestApplication;
  const publicList = vi.fn(async () => []);
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
  afterAll(async () => { await app?.close(); });

  it('serves a bounded verified-empty name result and passes all normalized filters to DB service', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/board/public/stock-posts?stock=WDX&q=News&stockName=%EC%A0%9C%EC%A3%BC')
      .expect(200);
    expect(response.body).toEqual({ posts: [], stockNameFilter: '제주', sourceWindow: 50 });
    expect(publicList).toHaveBeenCalledWith('WDX', 'News', '제주');
  });
  it.each(['stockName=', 'stockName=%3Cscript%3E', 'stockName=A&stockName=B',
    'stockName=A&unexpected=1'])('rejects malformed query %s as HTTP 400', async (query) => {
    publicList.mockClear();
    await request(app.getHttpServer()).get(`/api/v1/board/public/stock-posts?${query}`).expect(400);
    expect(publicList).not.toHaveBeenCalled();
  });
});
