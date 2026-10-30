import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('member support recent-subject search', () => {
  it('uses only the owner-bound DB function, searches literal substrings after the latest-100 boundary', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    await repo.myThreads(ACTOR, null, '%_urgent');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.support_my_threads($1,$2)');
    expect(sql).toContain('strpos(');
    expect(sql).not.toMatch(/\bLIKE\b|FROM\s+public\.support_threads/i);
    expect(params).toEqual([ACTOR, 100, '%_urgent']);
  });

  it('preserves the legacy latest-50 read when search is absent', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    await new SupportRepository({ query } as unknown as Queryable).myThreads(ACTOR);
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, 50]);
  });

  it('trims a bounded search term and rejects malformed queries before DB access', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    await controller.threads(request, undefined, '  문의 %_  ');
    expect(myThreads).toHaveBeenCalledWith(ACTOR, null, '문의 %_');
    await expect(controller.threads(request, undefined, 'x'.repeat(81))).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.threads(request, undefined, ['wrong'] as unknown as string)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.threads(request, undefined, 'bad\u0001term')).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.threads(request, undefined, 'bad\u007fterm')).rejects.toBeInstanceOf(BadRequestException);
    expect(myThreads).toHaveBeenCalledTimes(1);
  });
  it('combines status and literal subject search within owner latest-100', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    await repo.myThreads(ACTOR, 'resolved', '100%_');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.support_my_threads($1,$2)');
    expect(sql).toContain('strpos(');
    expect(sql).toMatch(/status\s*=\s*\$4/);
    expect(params).toEqual([ACTOR, 100, '100%_', 'resolved']);
  });

});
