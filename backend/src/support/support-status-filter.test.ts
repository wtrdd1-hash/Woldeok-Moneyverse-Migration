import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const request = { session: { user_id: 'member-one' } } as RequestWithSession;

describe('member support status filter', () => {
  it('rejects invalid and duplicated status before querying the database', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    for (const status of ['closed', '', ['open', 'resolved']]) {
      await expect(controller.threads(request, status as string)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(myThreads).not.toHaveBeenCalled();
  });

  it('preserves the default recent 50 and passes only approved status filters', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    await controller.threads(request);
    await controller.threads(request, 'waiting_user');
    expect(myThreads).toHaveBeenNthCalledWith(1, 'member-one', null);
    expect(myThreads).toHaveBeenNthCalledWith(2, 'member-one', 'waiting_user');
  });

  it('filters inside PostgreSQL over the last 100 actor-scoped threads before limiting to 50', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query });
    await repo.myThreads('member-one', 'resolved');
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.support_my_threads($1,$2)');
    expect(sql).toMatch(/WHERE status\s*=\s*\$3/);
    expect(sql).toMatch(/LIMIT\s+\$4/);
    expect(params).toEqual(['member-one', 100, 'resolved', 50]);
    await repo.myThreads('member-one', null);
    expect(query.mock.calls[1]?.[1]).toEqual(['member-one', 50]);
  });
});
