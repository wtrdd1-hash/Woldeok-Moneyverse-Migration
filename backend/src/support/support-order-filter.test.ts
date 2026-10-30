import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const request = { session: { user_id: 'owner-one' } } as RequestWithSession;

describe('owner-private bounded support conversation ordering', () => {
  it('rejects unsupported and duplicate sort values before querying', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    for (const value of ['asc', '', 'newest', ['oldest', 'oldest']]) {
      await expect(
        controller.threads(request, undefined, undefined, value as string),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(myThreads).not.toHaveBeenCalled();
  });

  it('passes validated oldest sorting through to the owner repository', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    await controller.threads(request, 'resolved', '  billing  ', 'oldest');
    expect(myThreads).toHaveBeenCalledWith('owner-one', 'resolved', 'billing', 'oldest');
  });

  it('sorts only the most recent 100 owner-scoped threads before the 50-row cap', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query });
    await repo.myThreads('owner-one', 'resolved', 'billing', 'oldest');
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.support_my_threads($1,$2)');
    expect(sql).toContain('strpos(lower(subject), lower($3)) > 0');
    expect(sql).toContain('status = $4');
    expect(sql).toMatch(/ORDER BY last_message_at ASC,\s*thread_id ASC LIMIT 50/);
    expect(params).toEqual(['owner-one', 100, 'billing', 'resolved']);
  });
});
