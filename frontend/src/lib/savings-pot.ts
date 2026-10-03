/**
 * Central Bank Smart Savings Pot & Compounding Maturity Engine
 * Supports 7D, 30D, and 90D fixed-term virtual deposit plans with daily compounding.
 */

export interface SavingsPlan {
  readonly id: '7d_flex' | '30d_growth' | '90d_wealth';
  readonly name: string;
  readonly periodDays: number;
  readonly baseAprPct: number;
  readonly bonusMaturityPct: number;
  readonly minDepositWld: number;
  readonly maxDepositWld: number;
  readonly badgeLabel: string;
  readonly description: string;
}

export const SAVINGS_PLANS: readonly SavingsPlan[] = [
  {
    id: '7d_flex',
    name: '7일 스마트 단기 복리 포켓',
    periodDays: 7,
    baseAprPct: 4.5,
    bonusMaturityPct: 0.0,
    minDepositWld: 100,
    maxDepositWld: 100000,
    badgeLabel: '7일 초단기',
    description: '부담 없는 7일 만기, 매일 쌓이는 복리 이자를 매일 수령 가능',
  },
  {
    id: '30d_growth',
    name: '30일 알파 성장 정기예금',
    periodDays: 30,
    baseAprPct: 7.2,
    bonusMaturityPct: 1.0,
    minDepositWld: 500,
    maxDepositWld: 500000,
    badgeLabel: '인기 30일',
    description: '한 달간 안정적인 자산 증식 + 만기 달성 시 1.0% 보너스 이자',
  },
  {
    id: '90d_wealth',
    name: '90일 웰스마스터 고금리 국채 예금',
    periodDays: 90,
    baseAprPct: 12.0,
    bonusMaturityPct: 2.5,
    minDepositWld: 1000,
    maxDepositWld: 2000000,
    badgeLabel: '최고금리 90일',
    description: '연 12.0% 최고 우대 금리 + 만기 완주 시 특별 금융 업적 부여',
  },
];

export interface SavingsPotRecord {
  readonly id: string;
  readonly planId: '7d_flex' | '30d_growth' | '90d_wealth';
  readonly principalWld: number;
  readonly accruedInterestWld: number;
  readonly claimedInterestWld: number;
  readonly startedAt: string; // ISO 8601
  readonly maturesAt: string; // ISO 8601
  readonly isMatured: boolean;
  readonly isWithdrawn: boolean;
  readonly lastClaimedAt: string;
}

const STORAGE_KEY = 'wdmv_savings_pots_v1';

/**
 * Calculates daily compound interest earned.
 * Daily Rate = APR / 365
 */
export function calculateDailyInterest(principal: number, aprPct: number): number {
  const dailyRate = aprPct / 100 / 365;
  return Math.max(0, Math.floor(principal * dailyRate * 100) / 100);
}

/**
 * Calculates total expected return at maturity.
 */
export function calculateExpectedMaturityYield(
  principal: number,
  aprPct: number,
  bonusPct: number,
  days: number
): { readonly interest: number; readonly total: number } {
  const dailyRate = aprPct / 100 / 365;
  const compounded = principal * Math.pow(1 + dailyRate, days);
  const bonus = principal * (bonusPct / 100) * (days / 365);
  const totalInterest = Math.floor((compounded - principal + bonus) * 100) / 100;
  return {
    interest: totalInterest,
    total: Math.floor((principal + totalInterest) * 100) / 100,
  };
}

/**
 * Loads all active and historic savings pots from storage.
 */
export function getStoredSavingsPots(): SavingsPotRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves savings pots to storage.
 */
export function saveSavingsPots(pots: readonly SavingsPotRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pots));
  } catch {}
}

/**
 * Opens a new fixed-term savings pot.
 */
export function openSavingsPot(
  planId: '7d_flex' | '30d_growth' | '90d_wealth',
  principalWld: number
): SavingsPotRecord {
  const matchedPlan = SAVINGS_PLANS.find((p) => p.id === planId);
  const plan = matchedPlan || SAVINGS_PLANS[0]!;
  const now = new Date();
  const matures = new Date(now.getTime() + plan.periodDays * 24 * 60 * 60 * 1000);

  const newPot: SavingsPotRecord = {
    id: `pot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    planId,
    principalWld,
    accruedInterestWld: 0,
    claimedInterestWld: 0,
    startedAt: now.toISOString(),
    maturesAt: matures.toISOString(),
    isMatured: false,
    isWithdrawn: false,
    lastClaimedAt: now.toISOString(),
  };

  const current = getStoredSavingsPots();
  saveSavingsPots([newPot, ...current]);
  return newPot;
}

/**
 * Claims accrued daily interest from an active pot.
 */
export function claimDailyInterestFromPot(potId: string): {
  readonly success: boolean;
  readonly claimedAmount: number;
  readonly updatedPot: SavingsPotRecord | null;
} {
  const pots = getStoredSavingsPots();
  const index = pots.findIndex((p) => p.id === potId);
  if (index === -1) return { success: false, claimedAmount: 0, updatedPot: null };

  const pot = pots[index];
  if (!pot) return { success: false, claimedAmount: 0, updatedPot: null };

  const matchedPlan = SAVINGS_PLANS.find((p) => p.id === pot.planId);
  const plan = matchedPlan || SAVINGS_PLANS[0]!;

  // Calculate elapsed days since last claim
  const lastClaim = new Date(pot.lastClaimedAt).getTime();
  const now = Date.now();
  const elapsedDays = Math.max(1, Math.floor((now - lastClaim) / (24 * 60 * 60 * 1000)));

  const dailyYield = calculateDailyInterest(pot.principalWld, plan.baseAprPct);
  const claimable = Math.max(1, Math.floor(dailyYield * elapsedDays * 10) / 10);

  const updated: SavingsPotRecord = {
    id: pot.id,
    planId: pot.planId,
    principalWld: pot.principalWld,
    accruedInterestWld: pot.accruedInterestWld + claimable,
    claimedInterestWld: pot.claimedInterestWld + claimable,
    startedAt: pot.startedAt,
    maturesAt: pot.maturesAt,
    isMatured: pot.isMatured,
    isWithdrawn: pot.isWithdrawn,
    lastClaimedAt: new Date().toISOString(),
  };

  const updatedList = [...pots];
  updatedList[index] = updated;
  saveSavingsPots(updatedList);

  return { success: true, claimedAmount: claimable, updatedPot: updated };
}
