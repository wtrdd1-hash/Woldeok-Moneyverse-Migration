import { describe, expect, it, vi } from 'vitest';
import { LotteryController } from './lottery.controller';

describe('lottery round API fail-closed behavior', () => {
  it('returns 503 when PostgreSQL is not configured', async () => {
    await expect(new LotteryController(null).rounds()).rejects.toMatchObject({ status: 503 });
  });

  it('returns 503 rather than an empty history when the DB fails', async () => {
    const repository = { listRounds: vi.fn().mockRejectedValue(new Error('DB unavailable')) };
    await expect(new LotteryController(repository as never).rounds()).rejects.toMatchObject({ status: 503 });
  });

  it('passes through only server-confirmed rounds', async () => {
    const expected = { rounds: [] };
    const repository = { listRounds: vi.fn().mockResolvedValue(expected) };
    await expect(new LotteryController(repository as never).rounds()).resolves.toEqual(expected);
  });
});
