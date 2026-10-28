import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = 'a0000000-0000-4000-8000-000000000001';
const thread = 'b0000000-0000-4000-8000-000000000002';

function request(): RequestWithSession {
  return { session: { user_id: actor } } as unknown as RequestWithSession;
}

describe('owner-scoped member support transcript', () => {
  it('retains session, authenticated and consent class guards', () => {
    const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, SupportController) ?? [];
    expect(guards).toEqual(expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]));
  });

  it('uses the session actor and returns a bounded, read-only transcript', async () => {
    const messages = [{ message_id: 'm1', sender_kind: 'admin', body: 'hello', created_at: new Date('2026-10-28T00:00:00Z') }];
    const repository = { messages: vi.fn().mockResolvedValue(messages) } as unknown as SupportRepository;
    const controller = new SupportController(repository);
    await expect(controller.transcript(request(), thread)).resolves.toEqual({ threadId: thread, messages, truncated: false });
    expect(repository.messages).toHaveBeenCalledWith(actor, thread, 500);
  });

  it('flags 500 messages as potentially truncated rather than promising completeness', async () => {
    const repository = { messages: vi.fn().mockResolvedValue(Array.from({ length: 500 }, (_, i) => ({ message_id: String(i) }))) } as unknown as SupportRepository;
    const result = await new SupportController(repository).transcript(request(), thread);
    expect(result.truncated).toBe(true);
  });

  it('uses only the existing owner-filtering SECURITY DEFINER function, never direct table reads', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    await repo.messages(actor, thread, 500);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('public.support_thread_messages($1,$2,$3)');
    expect(sql).not.toMatch(/FROM\s+public\.support_messages\b/i);
    expect(params).toEqual([actor, thread, 500]);
  });
});
