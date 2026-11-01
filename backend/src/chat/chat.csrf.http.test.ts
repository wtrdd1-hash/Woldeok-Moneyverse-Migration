import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

const actor = '11111111-1111-4111-8111-111111111111';
const peer = '22222222-2222-4222-8222-222222222222';
const conversation = '33333333-3333-4333-8333-333333333333';
const sessionId = '44444444-4444-4444-8444-444444444444';

describe('private chat mutation CSRF HTTP boundary', () => {
  let app: INestApplication;
  const verifyCsrf = vi.fn(async (_id: string, token: string) => token === 'valid-token');
  const openConversation = vi.fn(async () => ({ conversation_id: conversation }));
  const sendMessage = vi.fn(async () => ({ message_id: peer, sequence: '1' }));
  const unblockUser = vi.fn(async () => true);
  const listConversations = vi.fn(async () => []);
  const totalUnreadCount = vi.fn(async () => '0');

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: { openConversation, sendMessage, unblockUser, listConversations, totalUnreadCount } },
        { provide: SessionRepository, useValue: { verifyCsrf } },
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { id: sessionId, user_id: actor };
      next();
    });
    await app.init();
  });

  beforeEach(() => {
    verifyCsrf.mockClear();
    openConversation.mockClear();
    sendMessage.mockClear();
    unblockUser.mockClear();
  });
  afterAll(async () => { await app?.close(); });

  it('rejects missing and invalid tokens before opening a conversation', async () => {
    await request(app.getHttpServer()).post('/chat/conversations').send({ peerUserId: peer }).expect(403);
    await request(app.getHttpServer()).post('/chat/conversations')
      .set('x-csrf-token', 'invalid').send({ peerUserId: peer }).expect(403);
    expect(openConversation).not.toHaveBeenCalled();
    expect(verifyCsrf).toHaveBeenCalledWith(sessionId, 'invalid');
  });

  it('rejects unverified message sends and block removals before any write', async () => {
    await request(app.getHttpServer()).post('/chat/conversations/' + conversation + '/messages')
      .send({ body: 'hello' }).expect(403);
    await request(app.getHttpServer()).delete('/chat/users/' + peer + '/block').expect(403);
    expect(sendMessage).not.toHaveBeenCalled();
    expect(unblockUser).not.toHaveBeenCalled();
  });

  it('accepts a valid session-bound token for private chat mutations', async () => {
    await request(app.getHttpServer()).post('/chat/conversations')
      .set('x-csrf-token', 'valid-token').send({ peerUserId: peer }).expect(201);
    await request(app.getHttpServer()).post('/chat/conversations/' + conversation + '/messages')
      .set('x-csrf-token', 'valid-token').send({ body: 'hello' }).expect(201);
    await request(app.getHttpServer()).delete('/chat/users/' + peer + '/block')
      .set('x-csrf-token', 'valid-token').expect(200);
    expect(openConversation).toHaveBeenCalledWith(actor, peer);
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(unblockUser).toHaveBeenCalledWith(actor, peer);
  });

  it('preserves read-only GET without CSRF', async () => {
    await request(app.getHttpServer()).get('/chat/conversations').expect(200);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
