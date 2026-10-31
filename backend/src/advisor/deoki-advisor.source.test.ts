import { describe, expect, it, vi } from 'vitest';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const receipt = { id: '22222222-2222-4222-8222-222222222222', created_at: '2026-10-31T00:00:00Z' };

function repositoryWithResults(results: Array<{ rows?: unknown[]; error?: Error }>) {
  const query = vi.fn().mockImplementation(async () => {
    const next = results.shift();
    if (next?.error) throw next.error;
    return { rows: next?.rows ?? [] };
  });
  return { repo: new DeokiAdvisorRepository({ query } as never), query };
}

describe('Deoki advisor source and durable receipt boundary', () => {
  it('does not turn failed owner cash source into a verified zero', async () => {
    const { repo, query } = repositoryWithResults([{ error: new Error('permission denied') }]);
    await expect(repo.diagnoseUserPortfolio(ACTOR)).rejects.toThrow();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('uses owner-scoped stock/bond functions and refuses source failure', async () => {
    const { repo, query } = repositoryWithResults([
      { rows: [{ balance: '100' }] }, { rows: [{ balance: '50' }] },
      { error: new Error('stock source unavailable') },
    ]);
    await expect(repo.diagnoseUserPortfolio(ACTOR)).rejects.toThrow();
    expect(query.mock.calls[2]?.[0]).toContain('public.stock_my_positions(');
    expect(query.mock.calls[2]?.[0]).not.toContain('FROM public.virtual_stock_positions');
  });

  it('never returns a synthetic diagnosis receipt after DB insert refusal', async () => {
    const { repo, query } = repositoryWithResults([
      { rows: [{ balance: '100' }] }, { rows: [{ balance: '50' }] },
      { rows: [] }, { rows: [{ total_bonds: '0' }] },
      { error: new Error('diagnosis insert denied') },
    ]);
    await expect(repo.diagnoseUserPortfolio(ACTOR)).rejects.toThrow();
    expect(query).toHaveBeenCalledTimes(5);
    expect(query.mock.calls[3]?.[0]).toContain('public.bond_owner_holdings(');
  });

  it('rejects unsafe WLD conversion rather than rounding a balance', async () => {
    const { repo, query } = repositoryWithResults([{ rows: [{ balance: '9007199254740993' }] }]);
    await expect(repo.diagnoseUserPortfolio(ACTOR)).rejects.toThrow();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('returns a real receipt only when all source reads and DB write succeed', async () => {
    const { repo } = repositoryWithResults([
      { rows: [{ balance: '100' }] }, { rows: [{ balance: '50' }] },
      { rows: [] }, { rows: [{ total_bonds: '0' }] }, { rows: [receipt] },
    ]);
    const diagnosis = await repo.diagnoseUserPortfolio(ACTOR);
    expect(diagnosis.id).toBe(receipt.id);
    expect(diagnosis.assetSummary.total).toBe(150);
  });
});
