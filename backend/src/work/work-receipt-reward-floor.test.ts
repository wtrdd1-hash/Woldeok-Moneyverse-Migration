import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import type { WorkRepository } from './work.repository';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const row = (reward_amount: string) => ({
  receipt_id: '00000000-0000-4000-8000-000000000001',
  assignment_id: '00000000-0000-4000-8000-000000000002',
  code: 'DEVELOP',
  name: 'Work',
  reward_amount,
  experience_amount: '1',
  transaction_id: '00000000-0000-4000-8000-000000000003',
  created_at: '2026-10-30T00:00:00Z',
});

describe('owner-scoped work receipt reward floor', () => {
  it('filters only the database owner-scoped latest 20 rows using exact BigInt and echoes the accepted filter', async () => {
    const receipts = vi.fn(async () => [row('9007199254740993'), row('9007199254740992')]);
    const controller = new WorkController({ receipts } as unknown as WorkRepository);
    const result = await controller.receipts(request, '9007199254740993');
    expect(receipts).toHaveBeenCalledWith(actor);
    expect(result).toEqual({
      scope: 'recent20',
      minReward: '9007199254740993',
      receipts: [row('9007199254740993')],
    });
  });
  it.each(['', '01', '-1', '1.2', '1e3', ' 5', '9999999999999999999', ['1', '2']])(
    'rejects invalid or duplicate filter %s before database access',
    async (filter) => {
      const receipts = vi.fn(async () => []);
      const controller = new WorkController({ receipts } as unknown as WorkRepository);
      await expect(controller.receipts(request, filter)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(receipts).not.toHaveBeenCalled();
    },
  );
  it('rejects malformed source rewards instead of manufacturing a successful empty result', async () => {
    const controller = new WorkController({
      receipts: async () => [row('1e4')],
    } as unknown as WorkRepository);
    await expect(controller.receipts(request, '100')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('preserves the unfiltered legacy response', async () => {
    const controller = new WorkController({
      receipts: async () => [row('0')],
    } as unknown as WorkRepository);
    expect(await controller.receipts(request)).toEqual({ receipts: [row('0')] });
  });
});
