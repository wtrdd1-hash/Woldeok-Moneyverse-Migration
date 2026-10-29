import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionRepository } from '../auth/session.repository';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { CONFIG } from '../core/config';
import { HelpRepository } from './help.repository';
import { SupportRepository } from '../support/support.repository';
import { HelpReportController } from './help-report.controller';

const actor = '11111111-2222-4333-8444-555555555555';
const revision = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const key = '11111111-aaaa-4bbb-8ccc-222222222222';
const threadId = '22222222-3333-4444-8555-666666666666';
const url = '/api/v1/help/articles/ko/wallet-guide/report';
const body = { idempotencyKey: key, publishedRevisionId: revision, reason: 'outdated', details: 'The steps are now incorrect.' };

const sessions = { get: vi.fn(), hasCurrentUserConsent: vi.fn(), verifyCsrf: vi.fn() };
const help = { article: vi.fn() };
const support = { createThread: vi.fn(), messages: vi.fn() };

describe('help issue report authenticated HTTP contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    const moduleRef = await Test.createTestingModule({
      controllers: [HelpReportController],
      providers: [
        { provide: HelpRepository, useValue: help }, { provide: SupportRepository, useValue: support },
        { provide: SessionRepository, useValue: sessions }, { provide: CONFIG, useValue: { cookieSecure: false } },
        SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); vi.unstubAllEnvs(); });
  beforeEach(() => {
    vi.clearAllMocks();
    sessions.get.mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333', user_id: actor });
    sessions.hasCurrentUserConsent.mockResolvedValue(true);
    sessions.verifyCsrf.mockResolvedValue(true);
    help.article.mockResolvedValue({ published_revision_id: revision });
    support.createThread.mockResolvedValue({ thread_id: threadId, status: 'open', created_at: new Date() });
    support.messages.mockResolvedValue([{ sender_kind: 'user', body: JSON.stringify({
      kind: 'verified_help_issue', locale: 'ko', slug: 'wallet-guide', publishedRevisionId: revision,
      reason: 'outdated', details: body.details,
    }) }]);
  });
  it('rejects guests before reading any help or support data', async () => {
    sessions.get.mockResolvedValue(null);
    expect((await request(app.getHttpServer()).post(url).send(body)).status).toBe(401);
    expect(help.article).not.toHaveBeenCalled();
  });
  it('rejects outdated consent before mutation', async () => {
    sessions.hasCurrentUserConsent.mockResolvedValue(false);
    expect((await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').send(body)).status).toBe(428);
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('rejects missing or incorrect CSRF before mutation', async () => {
    expect((await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').send(body)).status).toBe(403);
    sessions.verifyCsrf.mockResolvedValue(false);
    expect((await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').set('x-csrf-token', 'invalid').send(body)).status).toBe(403);
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('rejects extra forged identity fields with validation before mutation', async () => {
    const response = await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').set('x-csrf-token', 'csrf').send({ ...body, userId: 'other' });
    expect(response.status).toBe(400);
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('accepts only the approved edition and returns a private verified receipt', async () => {
    const response = await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').set('x-csrf-token', 'csrf').send(body);
    expect(response.status).toBe(201);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.body).toEqual({ threadId, status: 'open', verified: true });
    expect(support.createThread).toHaveBeenCalledWith(actor, key, expect.any(String), expect.any(String));
  });
  it('refuses a stale edition and never opens a support thread', async () => {
    help.article.mockResolvedValue({ published_revision_id: '44444444-4444-4444-8444-444444444444' });
    expect((await request(app.getHttpServer()).post(url).set('Cookie', 'mv_session=synthetic').set('x-csrf-token', 'csrf').send(body)).status).toBe(409);
    expect(support.createThread).not.toHaveBeenCalled();
  });
});
