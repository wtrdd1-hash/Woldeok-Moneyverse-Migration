import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppContentController } from './app-content.controller';
import { ContentService } from './content.service';

describe('published announcement image search HTTP contract', () => {
  let app: INestApplication;
  const publicAnnouncements = vi.fn().mockResolvedValue([]);
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AppContentController],
      providers: [{ provide: ContentService, useValue: { publicAnnouncements } }],
    }).compile();
    app = testingModule.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  for (const path of ['/api/v1/content/announcements']) {
    it('serves a bounded literal query at ' + path, async () => {
      const result = await request(app.getHttpServer()).get(path).query({ imageAlt: '제주 %_' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ announcements: [] });
      expect(publicAnnouncements).toHaveBeenCalledWith({ imageAlt: '제주 %_' });
    });
    it('rejects duplicate and unknown parameters at ' + path, async () => {
      const duplicate = await request(app.getHttpServer()).get(path + '?imageAlt=foo&imageAlt=bar');
      const unknown = await request(app.getHttpServer()).get(path + '?imageAlt=foo&owner=other');
      expect(duplicate.status).toBe(400);
      expect(unknown.status).toBe(400);
    });
  }
});
