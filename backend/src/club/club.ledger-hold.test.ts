import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import type { Queryable } from '../core/db';
import { ClubController } from './club.controller';
import { PostgresClubRepository } from './club.repository';
import { ClubService } from './club.service';

const actor = '11111111-2222-4333-8444-555555555555';
const clubId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const projectId = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
const key = 'cccccccc-dddd-4eee-8fff-111111111111';
const code = 'CLUB_LEDGER_SETTLEMENT_UNAVAILABLE';

describe('P0 club WLD settlement boundary', () => {
  const createClub = vi.fn().mockResolvedValue({ club_id: clubId });
  const contributeToProject = vi.fn().mockResolvedValue({ contribution_id: key });
  const listClubs = vi.fn().mockResolvedValue([]);
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ClubController],
      providers: [{ provide: ClubService, useValue: { createClub, contributeToProject, listClubs } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: actor };
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('refuses club charter fee before service/DB access', async () => {
    createClub.mockClear();
    const res = await request(app.getHttpServer()).post('/clubs').send({
      tag: 'ALPHA', name: 'Alpha Club', idempotencyKey: key,
    }).expect(503);
    expect(res.body.code).toBe(code);
    expect(createClub).not.toHaveBeenCalled();
  });

  it('refuses project contribution before service/DB access', async () => {
    contributeToProject.mockClear();
    const res = await request(app.getHttpServer())
      .post(`/clubs/${clubId}/projects/${projectId}/contributions`)
      .send({ amountWld: 1000, idempotencyKey: key }).expect(503);
    expect(res.body.code).toBe(code);
    expect(contributeToProject).not.toHaveBeenCalled();
  });

  it('keeps read-only club directory available', async () => {
    await request(app.getHttpServer()).get('/clubs').expect(200);
    expect(listClubs).toHaveBeenCalledWith(actor, undefined, 50, 0);
  });

  it('rejects direct service writes without invoking the repository', async () => {
    const repo = { createClub: vi.fn(), contributeToProject: vi.fn() };
    const service = new ClubService(repo as unknown as PostgresClubRepository);
    await expect(service.createClub(actor, { tag: 'ALPHA', name: 'Alpha Club' }, key))
      .rejects.toMatchObject({ status: 503, response: expect.objectContaining({ code }) });
    await expect(service.contributeToProject(actor, clubId, projectId, 1000, key))
      .rejects.toMatchObject({ status: 503, response: expect.objectContaining({ code }) });
    expect(repo.createClub).not.toHaveBeenCalled();
    expect(repo.contributeToProject).not.toHaveBeenCalled();
  });

  it('rejects direct repository writes without SQL', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresClubRepository({ query } as unknown as Queryable);
    await expect(repo.createClub(actor, 'ALPHA', 'Alpha Club', '', '', 'public', key))
      .rejects.toMatchObject({ status: 503, response: expect.objectContaining({ code }) });
    await expect(repo.contributeToProject(actor, clubId, projectId, 1000, key))
      .rejects.toMatchObject({ status: 503, response: expect.objectContaining({ code }) });
    expect(query).not.toHaveBeenCalled();
  });
});
