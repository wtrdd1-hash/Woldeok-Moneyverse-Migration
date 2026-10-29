/** Only a backend-confirmed hold can be rendered. Unknown or future success
 * contracts must not imply Plus eligibility or an awarded WLD receipt. */
export interface VipChestHold {
  readonly available: false;
  readonly isPlusUser: null;
  readonly claimedToday: null;
  readonly rewardAmount: '0';
  readonly diceAwarded: 0;
  readonly nextAvailableAt: null;
  readonly reason: 'unverified_entitlement_and_ledger_receipt';
}

export function parseVipChestStatus(raw: unknown): VipChestHold | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (value.available !== false || value.isPlusUser !== null || value.claimedToday !== null ||
      value.rewardAmount !== '0' || value.diceAwarded !== 0 || value.nextAvailableAt !== null ||
      value.reason !== 'unverified_entitlement_and_ledger_receipt') return null;
  return {
    available: false, isPlusUser: null, claimedToday: null,
    rewardAmount: '0', diceAwarded: 0, nextAvailableAt: null,
    reason: 'unverified_entitlement_and_ledger_receipt',
  };
}
