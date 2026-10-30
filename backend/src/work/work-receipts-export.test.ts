import { describe, expect, it, vi } from 'vitest';
import { WorkController } from './work.controller';
import { WorkRepository } from './work.repository';
import { verifyWorkReceiptExportRows } from './work-receipts-export';

const actor = '11111111-2222-4333-8444-555555555555';
const receipt = {
  receipt_id: '22222222-2222-4222-8222-222222222222',
  assignment_id: '33333333-3333-4333-8333-333333333333',
  code: 'TASK_1', name: '=SUM(A1:A2)',
  reward_amount: '9007199254740993', experience_amount: '1',
  transaction_id: '44444444-4444-4444-8444-444444444444',
  created_at: new Date('2026-10-30T15:00:00.000Z'),
};

describe('owner work reward receipt export', () => {
  it('verifies the database-backed recent-20 envelope without rounding WLD', async () => {
    const rows = vi.fn(async () => [receipt]);
    const controller = new WorkController({ receipts: rows } as unknown as WorkRepository);
    const request = { session: { user_id: actor } } as Parameters<WorkController['exportReceipts']>[0];
    const result = await controller.exportReceipts(request);
    expect(rows).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result).toEqual({ scope: 'recent_20', currency: 'WLD', receipts: [{ ...receipt, created_at: '2026-10-30T15:00:00.000Z' }] });
  });

  it('fails closed for missing identity proof, malformed amounts, duplicate ids and excess rows', () => {
    for (const rows of [
      [{ ...receipt, reward_amount: Number('9007199254740993') }],
      [{ ...receipt, reward_amount: '01' }],
      [{ ...receipt, receipt_id: 'not-uuid' }],
      [{ ...receipt, created_at: new Date('invalid') }],
      [receipt, receipt],
      Array.from({ length: 21 }, (_, i) => ({ ...receipt, receipt_id: `22222222-2222-4222-8222-${String(i).padStart(12, '0')}` })),
    ]) expect(() => verifyWorkReceiptExportRows(rows)).toThrow();
  });

  it('rejects invalid database output rather than claiming a successful export', async () => {
    const controller = new WorkController({ receipts: async () => [{ ...receipt, reward_amount: '1.5' }] } as unknown as WorkRepository);
    await expect(controller.exportReceipts({ session: { user_id: actor } } as Parameters<WorkController['exportReceipts']>[0])).rejects.toMatchObject({ status: 503 });
  });
});
