/**
 * Credit Rating & Loan Schedule Engine
 *
 * Implements server-authoritative credit evaluation (Tiers 1-10) and
 * recovery loan scheduling specified in docs/planning/BANKING_CREDIT_SAFETY_SPEC.ko.md §4, §5.
 *
 * All assessments are game-only, virtual, and simulated.
 */

export interface UserFinancialProfile {
  readonly userId: string;
  readonly accountAgeDays: number;
  readonly jobLevel: number;
  readonly totalCashWld: number;
  readonly depositBalanceWld: number;
  readonly historicalRepaymentsCount: number;
  readonly overdueRepaymentsCount: number;
  readonly recentCasinoSpendWld?: number;
  readonly currentActiveDebtWld?: number;
}

export type CreditTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface CreditRatingResult {
  readonly userId: string;
  readonly score: number; // 100 ~ 1000 점
  readonly tier: CreditTier;
  readonly tierNameKo: string;
  readonly creditLimitWld: number;
  readonly interestRateBps: number; // 연이율 BPS (예: 450 = 4.5%)
  readonly maxInstallments: number; // 최대 분할 상환 가능 개월/주
  readonly factors: {
    readonly baseScore: number;
    readonly activityBonus: number;
    readonly jobBonus: number;
    readonly wealthBonus: number;
    readonly repaymentBonus: number;
    readonly overduePenalty: number;
    readonly riskSpendPenalty: number;
  };
  readonly recoveryGuidance?: string | undefined;
  readonly simulatedNotice: string;
}

export interface InstallmentScheduleItem {
  readonly sequence: number;
  readonly principalWld: number;
  readonly interestWld: number;
  readonly totalInstallmentWld: number;
  readonly remainingBalanceWld: number;
  readonly dueDateApprox: string;
}

export interface LoanScheduleResult {
  readonly principalAmountWld: number;
  readonly totalInterestWld: number;
  readonly totalRepaymentWld: number;
  readonly installmentCount: number;
  readonly schedule: readonly InstallmentScheduleItem[];
  readonly earlyRepaymentPenaltyWld: 0; // 항상 0원 (불이익 없음)
}

const TIER_CONFIG: Record<
  CreditTier,
  { nameKo: string; minScore: number; limitWld: number; rateBps: number; maxInstallments: number }
> = {
  1: { nameKo: '최상위 우량 (Prime AAA)', minScore: 900, limitWld: 500_000, rateBps: 350, maxInstallments: 12 },
  2: { nameKo: '우량 1급 (Prime AA)', minScore: 820, limitWld: 400_000, rateBps: 400, maxInstallments: 12 },
  3: { nameKo: '우량 2급 (Prime A)', minScore: 750, limitWld: 300_000, rateBps: 450, maxInstallments: 10 },
  4: { nameKo: '준우량 (Standard B+)', minScore: 680, limitWld: 250_000, rateBps: 520, maxInstallments: 8 },
  5: { nameKo: '일반 1급 (Standard B)', minScore: 600, limitWld: 200_000, rateBps: 600, maxInstallments: 6 },
  6: { nameKo: '일반 2급 (Standard B-)', minScore: 520, limitWld: 150_000, rateBps: 680, maxInstallments: 6 },
  7: { nameKo: '주의 1급 (Moderate C+)', minScore: 440, limitWld: 100_000, rateBps: 750, maxInstallments: 4 },
  8: { nameKo: '주의 2급 (Moderate C)', minScore: 360, limitWld: 50_000, rateBps: 850, maxInstallments: 3 },
  9: { nameKo: '관리 필요 (Watch D)', minScore: 280, limitWld: 20_000, rateBps: 1000, maxInstallments: 2 },
  10: { nameKo: '회복 지원 대상 (Recovery Required)', minScore: 0, limitWld: 0, rateBps: 0, maxInstallments: 0 },
};

/**
 * Calculates deterministic game-only credit score and rating tier.
 */
export function evaluateUserCreditRating(profile: UserFinancialProfile): CreditRatingResult {
  const baseScore = 500;

  // 1. Account age bonus (max +100)
  const activityBonus = Math.min(100, Math.floor(profile.accountAgeDays * 2));

  // 2. Job career bonus (max +150)
  const jobBonus = Math.min(150, profile.jobLevel * 15);

  // 3. Wealth/Solvency bonus (max +150)
  const totalAssets = profile.totalCashWld + profile.depositBalanceWld;
  const wealthBonus = Math.min(150, Math.floor(totalAssets / 5000) * 10);

  // 4. Historical on-time repayment bonus (max +150)
  const repaymentBonus = Math.min(150, profile.historicalRepaymentsCount * 25);

  // 5. Overdue penalty (up to -300)
  const overduePenalty = Math.min(300, profile.overdueRepaymentsCount * 100);

  // 6. High casino risk spend penalty (up to -150)
  const casinoSpend = profile.recentCasinoSpendWld ?? 0;
  const riskSpendPenalty = totalAssets > 0 && casinoSpend > totalAssets * 0.5 ? 100 : 0;

  // Calculate gross score clamped to 100 ~ 1000
  const grossScore =
    baseScore +
    activityBonus +
    jobBonus +
    wealthBonus +
    repaymentBonus -
    overduePenalty -
    riskSpendPenalty;

  const score = Math.max(100, Math.min(1000, grossScore));

  // Determine Tier 1 ~ 10
  let tier: CreditTier = 10;
  for (let t = 1; t <= 10; t++) {
    const config = TIER_CONFIG[t as CreditTier];
    if (score >= config.minScore) {
      tier = t as CreditTier;
      break;
    }
  }

  const tierInfo = TIER_CONFIG[tier];
  let recoveryGuidance: string | undefined;

  if (tier === 10) {
    recoveryGuidance =
      '현재 연체 또는 과도한 채무로 인해 신규 대출이 일시 유예되었습니다. 직업 퀘스트 수행 및 분할 상환을 통해 신용 점수를 빠르게 회복할 수 있습니다.';
  } else if (tier >= 8) {
    recoveryGuidance =
      '소액 단기 대출을 성실히 상환하고 정기 저축을 유지하면 상위 등급으로 승급되어 우대 금리가 적용됩니다.';
  }

  return {
    userId: profile.userId,
    score,
    tier,
    tierNameKo: tierInfo.nameKo,
    creditLimitWld: tierInfo.limitWld,
    interestRateBps: tierInfo.rateBps,
    maxInstallments: tierInfo.maxInstallments,
    factors: {
      baseScore,
      activityBonus,
      jobBonus,
      wealthBonus,
      repaymentBonus,
      overduePenalty,
      riskSpendPenalty,
    },
    recoveryGuidance,
    simulatedNotice:
      '본 신용평가는 머니버스 게임 내 가상 자산(WLD) 전용 학습 시뮬레이션이며, 실제 금융기관의 신용등급이나 대출과 무관합니다.',
  };
}

/**
 * Calculates equal-principal installment schedule without hidden fees.
 */
export function generateLoanSchedule(
  principalAmountWld: number,
  installmentCount: number,
  interestRateBps: number,
): LoanScheduleResult {
  const count = Math.max(1, Math.min(12, Math.floor(installmentCount)));
  const principal = Math.max(100, Math.floor(principalAmountWld));

  const totalInterestRate = (interestRateBps / 10000) * (count / 12);
  const totalInterestWld = Math.round(principal * totalInterestRate);
  const totalRepaymentWld = principal + totalInterestWld;

  const basePrincipalPerInstallment = Math.floor(principal / count);
  const baseInterestPerInstallment = Math.floor(totalInterestWld / count);

  let remainingBalance = principal;
  const schedule: InstallmentScheduleItem[] = [];

  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    const currentPrincipal = isLast
      ? remainingBalance
      : basePrincipalPerInstallment;
    const currentInterest = isLast
      ? totalInterestWld - baseInterestPerInstallment * (count - 1)
      : baseInterestPerInstallment;

    remainingBalance -= currentPrincipal;

    schedule.push({
      sequence: i,
      principalWld: currentPrincipal,
      interestWld: currentInterest,
      totalInstallmentWld: currentPrincipal + currentInterest,
      remainingBalanceWld: Math.max(0, remainingBalance),
      dueDateApprox: `${i}회차 (D+${i * 7}일)`,
    });
  }

  return {
    principalAmountWld: principal,
    totalInterestWld,
    totalRepaymentWld,
    installmentCount: count,
    schedule,
    earlyRepaymentPenaltyWld: 0,
  };
}
