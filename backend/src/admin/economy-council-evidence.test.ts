import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminEconomyController } from './economy.controller';
import type { EconomyConsoleRepository } from './economy.repository';

const request = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as unknown as RequestWithSession;

describe('economy council evidence contract', () => {
  it('does not manufacture a live approval from a dashboard snapshot', async () => {
    const dashboard = vi.fn().mockResolvedValue({ m2_amount: '12345', reconciliation_ok: true });
    const controller = new AdminEconomyController({ dashboard } as unknown as EconomyConsoleRepository);
    const result = await controller.councilDebate(request);
    expect(dashboard).toHaveBeenCalledWith(request.session?.user_id);
    expect(result).toMatchObject({ evidenceStatus: 'NOT_EVALUATED', debate: null });
    expect(JSON.stringify(result)).not.toContain('prop_live_');
  });

  it('does not claim a council result when the authoritative dashboard fails', async () => {
    const controller = new AdminEconomyController({ dashboard: vi.fn().mockRejectedValue(new Error('db offline')) } as unknown as EconomyConsoleRepository);
    await expect(controller.councilDebate(request)).rejects.toThrow('db offline');
  });
});
