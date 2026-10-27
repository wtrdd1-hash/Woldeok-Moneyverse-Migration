import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as RequestWithSession;
const sample = Array.from({ length: 51 }, (_, index) => ({ user_id: String(index) }));

describe('admin member directory evidence contract', () => {
  it('uses a bounded lookahead and does not represent the first 50 as the full membership', async () => {
    const users = vi.fn().mockResolvedValue(sample);
    const controller = new AdminController({ users } as unknown as AdminService, null);
    expect(await controller.users(request)).toEqual({
      users: sample.slice(0, 50),
      scope: { kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore: true },
    });
    expect(users).toHaveBeenCalledWith(actor, { limit: 51 });
  });

  it('reports a complete bounded result only after a 51st row was checked', async () => {
    const users = vi.fn().mockResolvedValue(sample.slice(0, 50));
    const controller = new AdminController({ users } as unknown as AdminService, null);
    expect(await controller.users(request)).toEqual({
      users: sample.slice(0, 50),
      scope: { kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore: false },
    });
  });
});
