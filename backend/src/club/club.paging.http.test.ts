import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';

const clubId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const actor = '11111111-2222-4333-8444-555555555555';

describe('Club paging HTTP integration', () => {
  let app: INestApplication;
  const listClubMembers = vi.fn().mockResolvedValue([]);
  const listClubFeed = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ClubController],
      providers: [{ provide: ClubService, useValue: { listClubMembers, listClubFeed } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: actor };
      next();
    });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns 400 for malformed and duplicate roster pagination without service calls', async () => {
    listClubMembers.mockClear();
    await request(app.getHttpServer()).get(`/clubs/${clubId}/members?limit=2junk`).expect(400);
    await request(app.getHttpServer()).get(`/clubs/${clubId}/members?offset=1e2`).expect(400);
    await request(app.getHttpServer()).get(`/clubs/${clubId}/members?limit=1&limit=2`).expect(400);
    expect(listClubMembers).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed feed pagination and accepts valid roster page', async () => {
    listClubFeed.mockClear();
    await request(app.getHttpServer()).get(`/clubs/${clubId}/feed?limit=2junk`).expect(400);
    expect(listClubFeed).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get(`/clubs/${clubId}/members?limit=100&offset=0`).expect(200);
    expect(listClubMembers).toHaveBeenLastCalledWith(clubId, actor, 100, 0);
  });
});
