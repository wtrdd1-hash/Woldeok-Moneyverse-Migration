import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

const actor = '11111111-1111-4111-8111-111111111111';
const conversationId = '22222222-2222-4222-8222-222222222222';

describe('private chat history and sync pagination HTTP contract', () => {
  let app: INestApplication;
  const listMessages = vi.fn().mockResolvedValue([]);
  const syncMessages = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: { listMessages, syncMessages } }],
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

  it('rejects malformed and duplicate history limit with HTTP 400 before service access', async () => {
    listMessages.mockClear();
    const base = '/chat/conversations/' + conversationId + '/messages?limit=';
    await request(app.getHttpServer()).get(base + '2junk').expect(400);
    await request(app.getHttpServer()).get(base + '1&limit=2').expect(400);
    await request(app.getHttpServer()).get(base + '101').expect(400);
    expect(listMessages).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get(base + '100').expect(200);
    expect(listMessages).toHaveBeenLastCalledWith(actor, conversationId, 100, undefined);
  });

  it('rejects malformed and duplicate sync limit with HTTP 400 before service access', async () => {
    syncMessages.mockClear();
    const base = '/chat/conversations/' + conversationId + '/sync?limit=';
    await request(app.getHttpServer()).get(base + '1e2').expect(400);
    await request(app.getHttpServer()).get(base + '1&limit=2').expect(400);
    await request(app.getHttpServer()).get(base + '201').expect(400);
    expect(syncMessages).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get(base + '200').expect(200);
    expect(syncMessages).toHaveBeenLastCalledWith(actor, conversationId, '0', 200);
  });
});

describe('private chat exact bigint cursor HTTP regression', () => {
  let app: INestApplication;
  const listMessages = vi.fn().mockResolvedValue([]);
  const syncMessages = vi.fn().mockResolvedValue([]);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: { listMessages, syncMessages } }],
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

  it('preserves exact history and sync cursor values through HTTP', async () => {
    await request(app.getHttpServer()).get(`/chat/conversations/${conversationId}/messages?beforeSequence=9007199254740993`).expect(200);
    expect(listMessages).toHaveBeenLastCalledWith(actor, conversationId, 50, '9007199254740993');
    await request(app.getHttpServer()).get(`/chat/conversations/${conversationId}/sync?sinceSequence=9007199254740993`).expect(200);
    expect(syncMessages).toHaveBeenLastCalledWith(actor, conversationId, '9007199254740993', 100);
  });

  it('rejects partial, duplicate and overflow cursor values', async () => {
    listMessages.mockClear();
    syncMessages.mockClear();
    await request(app.getHttpServer()).get(`/chat/conversations/${conversationId}/messages?beforeSequence=2junk`).expect(400);
    await request(app.getHttpServer()).get(`/chat/conversations/${conversationId}/messages?beforeSequence=1&beforeSequence=2`).expect(400);
    await request(app.getHttpServer()).get(`/chat/conversations/${conversationId}/sync?sinceSequence=9223372036854775808`).expect(400);
    expect(listMessages).not.toHaveBeenCalled();
    expect(syncMessages).not.toHaveBeenCalled();
  });
});


describe('private chat read receipt exact bigint HTTP contract', () => {
  let app: INestApplication;
  const markAsRead = vi.fn().mockResolvedValue({ lastReadSequence: '9007199254740993' });
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: { markAsRead } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => { req.session = { user_id: actor }; next(); });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  it('accepts an exact string receipt and legacy safe integer, but refuses unsafe numeric JSON', async () => {
    const url = `/chat/conversations/${conversationId}/read`;
    await request(app.getHttpServer()).post(url).send({ sequence: '9007199254740993' }).expect(201);
    expect(markAsRead).toHaveBeenLastCalledWith(actor, conversationId, '9007199254740993');
    await request(app.getHttpServer()).post(url).send({ sequence: 5 }).expect(201);
    expect(markAsRead).toHaveBeenLastCalledWith(actor, conversationId, '5');
    markAsRead.mockClear();
    await request(app.getHttpServer()).post(url).send({ sequence: Number('9007199254740993') }).expect(400);
    await request(app.getHttpServer()).post(url).send({ sequence: '2junk' }).expect(400);
    expect(markAsRead).not.toHaveBeenCalled();
  });
});
