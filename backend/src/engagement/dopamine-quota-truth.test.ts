import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';

const owner = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

describe('Dopamine status source integrity', () => {
  it('does not invent remaining showdown and star-drop quotas without a source', async () => {
    await expect(new DopamineController(null).getDopamineStatus(owner)).rejects.toMatchObject({
      status: 503,
      response: { code: 'DOPAMINE_QUOTA_UNVERIFIED' },
    });
  });

  it('does not treat a repository for unrelated rewards as proof of owner vote and quotas', async () => {
    const repository = { goldenDuckLedgerStatus: vi.fn() } as unknown as DopamineRepository;
    await expect(new DopamineController(repository).getDopamineStatus(owner)).rejects.toMatchObject({
      status: 503,
      response: { code: 'DOPAMINE_QUOTA_UNVERIFIED' },
    });
    expect(repository.goldenDuckLedgerStatus).not.toHaveBeenCalled();
  });
});
