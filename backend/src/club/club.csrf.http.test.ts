import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { ClubController } from './club.controller';
import { WarfareController } from './warfare.controller';
import { ClubService } from './club.service';

const actor = '11111111-2222-4333-8444-555555555555';
const club = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const target = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
const verifyCsrf = vi.fn(async (_sessionId: string, token: string) => token === 'approved');
const joinClub = vi.fn().mockResolvedValue(true);
const leaveClub = vi.fn().mockResolvedValue(true);
const updateMemberRole = vi.fn().mockResolvedValue(true);
const createClubFeedPost = vi.fn().mockResolvedValue({ id: target });
const updateClubCanvas = vi.fn().mockResolvedValue(true);
const listClubs = vi.fn().mockResolvedValue([]);

describe('club mutations require real session-bound CSRF verification', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ClubController, WarfareController],
      providers: [
        CsrfGuard,
        { provide: SessionRepository, useValue: { verifyCsrf } },
        { provide: ClubService, useValue: {
          joinClub, leaveClub, updateMemberRole, createClubFeedPost, updateClubCanvas, listClubs,
        } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();

    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { id: 'cccccccc-dddd-4eee-8fff-111111111111', user_id: actor };
      next();
    });
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => { await app?.close(); });

  const mutations = [
    ['join', 'post', `/clubs/${club}/join`, {}],
    ['leave', 'post', `/clubs/${club}/leave`, {}],
    ['role', 'patch', `/clubs/${club}/members/${target}/role`, { role: 'moderator' }],
    ['feed', 'post', `/clubs/${club}/feed`, { title: 'hello', body: 'club post' }],
    ['canvas', 'put', `/clubs/${club}/canvas`, { grid: [], totalScore: 0 }],
  ] as const;

  it.each(mutations)('blocks missing and invalid CSRF on %s without a state change', async (_label, method, path, body) => {
    await request(app.getHttpServer())[method](path).send(body).expect(403);
    await request(app.getHttpServer())[method](path).set('x-csrf-token', 'forged').send(body).expect(403);
    expect(joinClub).not.toHaveBeenCalled();
    expect(leaveClub).not.toHaveBeenCalled();
    expect(updateMemberRole).not.toHaveBeenCalled();
    expect(createClubFeedPost).not.toHaveBeenCalled();
    expect(updateClubCanvas).not.toHaveBeenCalled();
  });

  it.each(mutations)('permits valid CSRF on %s and preserves existing owner service boundary', async (_label, method, path, body) => {
    await request(app.getHttpServer())[method](path).set('x-csrf-token', 'approved').send(body).expect(method === 'patch' || method === 'put' ? 200 : 201);
    expect(verifyCsrf).toHaveBeenCalledWith('cccccccc-dddd-4eee-8fff-111111111111', 'approved');
  });

  it('rejects forged warfare POST before its existing financial 503 boundary', async () => {
    await request(app.getHttpServer()).post('/clubs/warfare/claim-tax').send({}).expect(403);
    await request(app.getHttpServer()).post('/clubs/warfare/claim-tax')
      .set('x-csrf-token', 'approved').send({}).expect(503);
  });

  it('does not require CSRF for read-only club directory or warfare status', async () => {
    await request(app.getHttpServer()).get('/clubs').expect(200);
    await request(app.getHttpServer()).get('/clubs/warfare/status').expect(503);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
