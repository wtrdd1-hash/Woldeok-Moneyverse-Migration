export type BondHoldingDisplayStatus = Readonly<{ label: string; active: boolean }>;

/** Database status is ACTIVE; HOLDING is retained for historic read adapters. */
export function describeBondHoldingStatus(status: string): BondHoldingDisplayStatus {
  if (status === 'ACTIVE' || status === 'HOLDING') {
    return { label: '보유중 (이자수령)', active: true };
  }
  if (status === 'MATURED' || status === 'REDEEMED') {
    return { label: '만기상환 완료', active: false };
  }
  return { label: '상태 확인 필요', active: false };
}
