import { describe, expect, it, vi } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

const owner = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as RequestWithSession;

describe('Bull/Bear vote ledger truth', () => {
  it('never returns pool eligibility or a successful vote without durable owner receipt', async () => {
    const repo = { voteBullBear: vi.fn() } as unknown as DopamineRepository;
    const controller = new DopamineController(repo);
    await expect(controller.voteBullBear(owner, { vote: 'bull', stockSymbol: 'CHIPS' })).rejects.toMatchObject({ status: 503 });
    expect((repo as unknown as { voteBullBear: ReturnType<typeof vi.fn> }).voteBullBear).not.toHaveBeenCalled();
  });

  it('fails closed even if no database repository is configured', async () => {
    await expect(new DopamineController(null).voteBullBear(owner, { vote: 'bear' })).rejects.toMatchObject({ status: 503 });
  });
});
