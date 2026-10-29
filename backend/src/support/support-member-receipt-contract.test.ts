import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import type { SupportRepository } from './support.repository';

const actor = 'a83e38d5-3401-4fb7-8dc4-2f88d60e3c77';
const id = '4bb16d4d-6d18-4fb6-b581-1d5a716c1e3a';
const key = 'b28140b6-2944-43c6-a1d1-56c78dc89c11';
const date = new Date('2026-10-29T03:00:00Z');
const request = { session: { user_id: actor } } as RequestWithSession;

describe('member support POST receipt contract', () => {
  it.each(['create', 'reply'] as const)('%s is guarded by CSRF', (method) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, SupportController.prototype[method])).toContain(CsrfGuard);
  });

  it('returns the persisted thread receipt with its identity', async () => {
    const thread = { thread_id: id, status: 'open', created_at: date };
    const createThread = vi.fn().mockResolvedValue(thread);
    const controller = new SupportController({ createThread } as unknown as SupportRepository);
    expect(await controller.create(request, { subject: '제목', body: '본문', idempotencyKey: key })).toEqual({ thread });
    expect(createThread).toHaveBeenCalledWith(actor, key, '제목', '본문');
  });

  it('returns the persisted user message receipt with its identity', async () => {
    const message = { message_id: id, sender_kind: 'user', body: '본문', created_at: date };
    const addMessage = vi.fn().mockResolvedValue(message);
    const controller = new SupportController({ addMessage } as unknown as SupportRepository);
    expect(await controller.reply(request, id, { body: '본문', idempotencyKey: key })).toEqual({ message });
    expect(addMessage).toHaveBeenCalledWith(actor, key, id, '본문');
  });
});
