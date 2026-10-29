'use server';

import { api } from '@/lib/api';

export type GoldenDuckLedgerStatus =
  | { readonly state: 'verified'; readonly claimedToday: boolean }
  | { readonly state: 'unavailable' };

/** The only financial information the practice game may show is read-only ledger evidence. */
export async function getGoldenDuckStatusAction(): Promise<GoldenDuckLedgerStatus> {
  try {
    const result = await api<{ claimedToday: boolean; rewardClaimsEnabled: boolean }>(
      '/api/v1/engagement/dopamine/golden-duck/status',
    );
    if (typeof result.claimedToday !== 'boolean' || result.rewardClaimsEnabled !== false) {
      return { state: 'unavailable' };
    }
    return { state: 'verified', claimedToday: result.claimedToday };
  } catch {
    return { state: 'unavailable' };
  }
}

export interface GoldenDuckActionResult {
  readonly success: boolean;
  readonly requiresLogin?: boolean | undefined;
  readonly rewardAmount?: number | undefined;
  readonly newBalance?: string | undefined;
  readonly clicks?: number | undefined;
  readonly multiplier?: number | undefined;
  readonly message?: string | undefined;
}

/** Keep the legacy server action fail-closed even if a caller bypasses the practice UI. */
export async function claimGoldenDuckAction(
  _clickCount: number,
  _comboMultiplier: number,
): Promise<GoldenDuckActionResult> {
  return {
    success: false,
    message: 'Golden Duck WLD rewards are unavailable until verified ledger settlement is implemented.',
  };
}
