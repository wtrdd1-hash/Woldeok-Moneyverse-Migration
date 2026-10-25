import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { LotteryRepository } from './lottery.repository';

const round = {
  round_number: 1,
  status: 'OPEN',
  ticket_price_wld: '1000',
  jackpot_pool_wld: '900719925474099300000',
  total_tickets_sold: 0,
  draws_at: new Date('2026-11-01T00:00:00.000Z'),
  settled_at: null,
  winning_numbers: null,
};

describe('public lottery rounds read model', () => {
  it('reads bounded PostgreSQL rounds without any monetary write or invented values', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [round] });
    const repository = new LotteryRepository({ query } as unknown as Queryable);
    expect(await repository.listRounds()).toEqual({
      rounds: [{
        roundNumber: 1,
        status: 'OPEN',
        ticketPriceWld: '1000',
        jackpotPoolWld: '900719925474099300000',
        totalTicketsSold: 0,
        drawsAt: '2026-11-01T00:00:00.000Z',
        settledAt: null,
        winningNumbers: null,
      }],
    });
    const sql = String(query.mock.calls[0]?.[0]);
    expect(sql).toMatch(/FROM public\.national_treasury_lottery_rounds/);
    expect(sql).toMatch(/ORDER BY round_number DESC LIMIT 12/);
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE|ledger_postings/i);
  });

  it('rejects fractional money and unverified draw results', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ...round, ticket_price_wld: '1.5' }] });
    await expect(new LotteryRepository({ query } as unknown as Queryable).listRounds()).rejects.toThrow();
    query.mockResolvedValue({ rows: [{ ...round, status: 'SETTLED', winning_numbers: [1, 2, 3, 4, 5, 46] }] });
    await expect(new LotteryRepository({ query } as unknown as Queryable).listRounds()).rejects.toThrow();
  });
});
