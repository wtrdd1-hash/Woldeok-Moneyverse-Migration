import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { CasinoRepository } from './casino.repository';

/** An unrelated treasury balance must never become a jackpot or house reserve. */
describe('P0 #2077 jackpot financial evidence boundary', () => {
  it('refuses to claim a jackpot when no audited jackpot source exists', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      house_reserve: '12845000', jackpot_amount: '74500000', total_plays_today: '0',
    }] });
    const repository = new CasinoRepository({ query } as unknown as Queryable);
    await expect(repository.jackpotPool()).rejects.toThrow(/jackpot.*(unverified|unavailable)/i);
    expect(query).not.toHaveBeenCalled();
  });
});
