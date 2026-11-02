import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const list = vi.fn(async () => []);

describe('public author discovery HTTP boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [PublicStockCommunityController],
      providers: [{ provide: StockCommunityService, useValue: { publicList: list } }],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => list.mockClear());

  it('returns a normalized author filter proof even when zero matches', async () => {
    const res = await request(app.getHttpServer())
      .get('/board/public/stock-posts?author=%20%ED%99%8D%20&q=%20hello%20')
      .expect(200);
    expect(res.body).toEqual({ posts: [], authorFilter: '홍', sourceWindow: 50 });
    expect(list).toHaveBeenCalledWith(undefined, ' hello ', '홍');
  });
  it('preserves the legacy default response', async () => {
    const res = await request(app.getHttpServer()).get('/board/public/stock-posts').expect(200);
    expect(res.body).toEqual({ posts: [] });
    expect(list).toHaveBeenCalledWith(undefined, undefined);
  });
  it.each(['?author=a&author=b', '?author=', '?author=%3Cscript%3E', '?author=a&page=1'])(
    'rejects invalid author search %s before source access', async (suffix) => {
      await request(app.getHttpServer()).get(`/board/public/stock-posts${suffix}`).expect(400);
      expect(list).not.toHaveBeenCalled();
    },
  );
});
