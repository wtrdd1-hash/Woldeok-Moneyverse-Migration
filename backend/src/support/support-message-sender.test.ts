import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const thread = '22222222-2222-4222-8222-222222222222';
const req = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('owner support message sender filter', () => {
  it('filters only after owner-scoped first 200 messages, without table grants', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    await new SupportRepository({ query } as unknown as Queryable).messages(actor, thread, 200, 'admin');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.support_thread_messages($1,$2,$3)');
    expect(sql).toContain('WHERE sender_kind = $4');
    expect(sql).not.toContain('public.support_messages');
    expect(params).toEqual([actor, thread, 200, 'admin']);
  });
  it('keeps the existing unfiltered owner function call unchanged', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    await new SupportRepository({ query } as unknown as Queryable).messages(actor, thread);
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).not.toContain('WHERE sender_kind');
    expect(params).toEqual([actor, thread, 200]);
  });
  it('accepts only one explicit sender enum and binds session actor', async () => {
    const messages = vi.fn(async () => []);
    const controller = new SupportController({ messages } as unknown as SupportRepository);
    await expect(controller.messages(req, thread, 'user')).resolves.toEqual({ messages: [] });
    expect(messages).toHaveBeenCalledWith(actor, thread, 200, 'user');
    for (const bad of ['all', '', 'ADMIN', ['admin', 'user'], { sender: 'admin' }]) {
      await expect(controller.messages(req, thread, bad as string)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(messages).toHaveBeenCalledTimes(1);
  });
});
