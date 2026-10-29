import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseVipChestStatus } from './vip-chest-status';

const disabled = {
  available: false, isPlusUser: null, claimedToday: null,
  rewardAmount: '0', diceAwarded: 0, nextAvailableAt: null,
  reason: 'unverified_entitlement_and_ledger_receipt',
};

describe('quests VIP chest server API contract', () => {
  it('accepts only the explicitly disabled server contract, not a fabricated success', () => {
    expect(parseVipChestStatus(disabled)).toEqual(disabled);
    for (const value of [null, {}, { ...disabled, available: true }, { ...disabled, isPlusUser: true }, { ...disabled, rewardAmount: 2000 }, { ...disabled, claimedToday: false }]) {
      expect(parseVipChestStatus(value)).toBeNull();
    }
  });

  it('fetches server status without assuming Plus entitlement and keeps private SEO noindex', () => {
    const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    expect(page).toContain("'/api/v1/engagement/dopamine/vip-chest/status'");
    expect(page).toContain('parseVipChestStatus(');
    expect(page).not.toContain('isPlusUser={true}');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
