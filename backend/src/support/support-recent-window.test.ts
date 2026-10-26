import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import type { SupportRepository } from './support.repository';

describe('support recent-window API', () => {
  it('reads only the authenticated member latest 100 and declares the bound', async () => {
    const threads = [{ thread_id: 'owned', status: 'open' }];
    const myThreads = vi.fn().mockResolvedValue(threads);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    const request = {
      session: { user_id: 'member-from-session' },
    } as unknown as RequestWithSession;

    expect(await controller.threads(request)).toEqual({ threads, windowLimit: 100 });
    expect(myThreads).toHaveBeenCalledExactlyOnceWith('member-from-session', 100);
  });

  it('does not fabricate an empty list when the database fails', async () => {
    const myThreads = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    const request = {
      session: { user_id: 'member-from-session' },
    } as unknown as RequestWithSession;
    await expect(controller.threads(request)).rejects.toThrow('database unavailable');
  });
});
