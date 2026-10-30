import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';
const ACTOR = '11111111-1111-4111-8111-111111111111';
const THREAD = '22222222-2222-4222-8222-222222222222';
const req = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('owner support message literal keyword filter', () => {
  it('filters only the first 200 messages returned by the owner-scoped SQL function, without direct table access', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    await repo.messages(ACTOR, THREAD, 200, '%_환불');
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('public.support_thread_messages($1,$2,$3)');
    expect(sql).toContain('strpos(lower(body),lower($4)) > 0');
    expect(sql).not.toMatch(/\bLIKE\b|FROM\s+public\.support_messages\b/i);
    expect(args).toEqual([ACTOR, THREAD, 200, '%_환불']);
  });
  it('keeps the old owner read unchanged without a keyword', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    await new SupportRepository({ query } as unknown as Queryable).messages(ACTOR, THREAD);
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, THREAD, 200]);
  });
  it('trims valid keywords and rejects arrays, empty, controls, and oversize before DB', async () => {
    const messages = vi.fn(async () => []);
    const controller = new SupportController({ messages } as unknown as SupportRepository);
    await controller.messages(req, THREAD, '  환불 %_  ');
    expect(messages).toHaveBeenCalledWith(ACTOR, THREAD, 200, '환불 %_');
    for (const q of ['', ' ', 'x', 'x'.repeat(81), 'bad\u0001text', ['a', 'b']]) {
      await expect(controller.messages(req, THREAD, q as string)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(messages).toHaveBeenCalledTimes(1);
  });
});
