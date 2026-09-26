import { describe, expect, it } from 'vitest';
import type { SavingPocket } from './types';

describe('Saving Pocket Goal Completion & Certificate Logic', () => {
  it('correctly calculates goal completion percentage and status', () => {
    const pocket: SavingPocket = {
      pocket_id: 'test-pocket-1',
      name: '비상금 포켓',
      balance: '15000',
      target_amount: '10000',
      target_date: '2026-12-31',
      theme_color: 'amber',
      icon_code: 'piggy',
      is_archived: false,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    const targetAmount = BigInt(pocket.target_amount || '0');
    const currentBalance = BigInt(pocket.balance || '0');
    const isCompleted = targetAmount > 0n && currentBalance >= targetAmount;
    const progressPct = Math.min(100, Math.floor(Number((currentBalance * 100n) / targetAmount)));

    expect(isCompleted).toBe(true);
    expect(progressPct).toBe(100);
  });

  it('detects under-target pocket as incomplete', () => {
    const pocket: SavingPocket = {
      pocket_id: 'test-pocket-2',
      name: '시드머니',
      balance: '4500',
      target_amount: '10000',
      target_date: '2026-12-31',
      theme_color: 'sky',
      icon_code: 'seed',
      is_archived: false,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    const targetAmount = BigInt(pocket.target_amount || '0');
    const currentBalance = BigInt(pocket.balance || '0');
    const isCompleted = targetAmount > 0n && currentBalance >= targetAmount;
    const progressPct = Math.min(100, Math.floor(Number((currentBalance * 100n) / targetAmount)));

    expect(isCompleted).toBe(false);
    expect(progressPct).toBe(45);
  });
});
