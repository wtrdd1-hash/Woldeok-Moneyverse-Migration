export interface GlobalCompoundPreset {
  readonly slug: string;
  readonly titleEn: string;
  readonly titleJa: string;
  readonly titleZh: string;
  readonly initialDeposit: number; // USD
  readonly monthlyContribution: number; // USD
  readonly annualRate: number; // %
  readonly years: number;
  readonly targetGoalEn: string;
  readonly descriptionEn: string;
  readonly descriptionJa: string;
  readonly descriptionZh: string;
}

/**
 * 복리 이자 계산 유틸리티 (월복리 공식)
 * A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
 */
export function calculateGlobalCompound(
  initialDeposit: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
) {
  const r = annualRate / 100;
  const n = 12; // 월복리
  const t = years;

  const totalMonths = t * n;
  const monthlyRate = r / n;

  // 원금 미래가치
  const futurePrincipal = initialDeposit * Math.pow(1 + monthlyRate, totalMonths);

  // 월적립금 미래가치
  const futureContributions =
    monthlyContribution > 0 && monthlyRate > 0
      ? monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : monthlyContribution * totalMonths;

  const totalFutureValue = Math.round(futurePrincipal + futureContributions);
  const totalPrincipalInvested = initialDeposit + monthlyContribution * totalMonths;
  const totalInterestEarned = Math.max(0, totalFutureValue - totalPrincipalInvested);

  // 연도별 타임라인 데이터 (최대 30년)
  const yearlyBreakdown = Array.from({ length: years }, (_, i) => {
    const yr = i + 1;
    const monthsPassed = yr * 12;
    const invested = initialDeposit + monthlyContribution * monthsPassed;
    const value = Math.round(
      initialDeposit * Math.pow(1 + monthlyRate, monthsPassed) +
        (monthlyContribution > 0 && monthlyRate > 0
          ? monthlyContribution * ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate)
          : monthlyContribution * monthsPassed)
    );
    return {
      year: yr,
      invested,
      value,
      interest: Math.max(0, value - invested),
    };
  });

  return {
    initialDeposit,
    monthlyContribution,
    annualRate,
    years,
    totalPrincipalInvested,
    totalInterestEarned,
    totalFutureValue,
    yearlyBreakdown,
  };
}

export const GLOBAL_COMPOUND_PRESETS: readonly GlobalCompoundPreset[] = [
  {
    slug: '500-monthly-20-years-8-percent',
    titleEn: '$500/Month for 20 Years at 8% Return',
    titleJa: '毎月500ドルを20年間 年利8%で複利運用シミュレーション',
    titleZh: '每月定投500美元 连续20年 年化8% 复利增长测算',
    initialDeposit: 5000,
    monthlyContribution: 500,
    annualRate: 8,
    years: 20,
    targetGoalEn: 'Reach ~$320,000 for Retirement Nest Egg',
    descriptionEn: 'How investing $500 monthly into an S&P 500 index fund compounds over 20 years with historical average returns.',
    descriptionJa: '毎月500ドルをS&P500インデックスファンドに20年間積立投資した場合の複利成長をシミュレーションします。',
    descriptionZh: '模拟每月定投500美元至标普500指数基金，在20年内通过复利积累约32万美元的养老金。',
  },
  {
    slug: '1000-monthly-30-years-10-percent',
    titleEn: '$1,000/Month for 30 Years at 10% (Become a 401k Millionaire)',
    titleJa: '毎月1,000ドルを30年間 年利10%運用（ミリオネア達成シミュレーター）',
    titleZh: '每月定投1000美元 连续30年 年化10%（实现百万美元FIRE退休）',
    initialDeposit: 10000,
    monthlyContribution: 1000,
    annualRate: 10,
    years: 30,
    targetGoalEn: 'Surpass $2,200,000 ($2.2M Millionaire Goal)',
    descriptionEn: 'Starting in your 20s or 30s with $1,000 monthly contributions can turn into over $2.2 million via long-term index compounding.',
    descriptionJa: '毎月1,000ドルの積立投資を年利10%で30年間継続すると、資産総額は220万ドル（約3.3億円）を突破します。',
    descriptionZh: '坚持每月定投1000美元并维持10%年化回报，30年后总资产将超过220万美元，实现财务自由。',
  },
  {
    slug: '10000-initial-10-years-7-percent',
    titleEn: '$10,000 Lump Sum for 10 Years at 7% (No Additions)',
    titleJa: '10,000ドルを一括で10年間 年利7%放置運用',
    titleZh: '1万美元单笔投资 连续10年 年化7% 被动复利',
    initialDeposit: 10000,
    monthlyContribution: 0,
    annualRate: 7,
    years: 10,
    targetGoalEn: 'Doubles to ~$20,000 (Rule of 72 Demonstration)',
    descriptionEn: 'Shows the Rule of 72 in action: a single $10,000 investment doubles in approximately 10 years at a 7% real compound rate.',
    descriptionJa: '「72の法則」を体感：追加積立なしで10,000ドルが年利7%で約10年で倍の20,000ドルに成長します。',
    descriptionZh: '验证“72法则”：单笔1万美元在年化7%复利下，无需追加资金，约10年即可翻倍至2万美元。',
  },
  {
    slug: '200-monthly-15-years-9-percent',
    titleEn: '$200/Month for 15 Years at 9% (College Fund / Starter)',
    titleJa: '毎月200ドルを15年間 年利9%運用（教育資金・若手資産形成）',
    titleZh: '每月定投200美元 连续15年 年化9%（教育基金与起步定投）',
    initialDeposit: 1000,
    monthlyContribution: 200,
    annualRate: 9,
    years: 15,
    targetGoalEn: 'Build ~$80,000 College Fund',
    descriptionEn: 'Start small with just $200 per month to build a substantial $80,000 savings pool for children’s education or home down payment.',
    descriptionJa: '月々200ドルの少額投資でも、15年間年利9%で運用すれば約80,000ドルの教育資金や頭金を構築できます。',
    descriptionZh: '即使每月仅定投200美元，在15年9%回报下亦能积累约8万美元，适合子女大学基金或购房首付。',
  },
  {
    slug: 'fire-number-1-million-calculator',
    titleEn: 'FIRE Number: How to Reach $1,000,000 in 15 Years',
    titleJa: 'FIREナンバー：15年間で100万ドル（約1.5億円）を達成する計算式',
    titleZh: 'FIRE财务自由目标：15年内达成100万美元净资产测算',
    initialDeposit: 25000,
    monthlyContribution: 2500,
    annualRate: 9.5,
    years: 15,
    targetGoalEn: 'Hit $1,000,000 FIRE Target with 4% Safe Withdrawal',
    descriptionEn: 'Calculate the monthly savings required to hit Financial Independence and Retire Early (FIRE) with $40,000 annual safe withdrawal.',
    descriptionJa: '4%ルール（年間40,000ドルの取崩し）に基づくFIRE達成に必要な月間積立額をシミュレーションします。',
    descriptionZh: '基于4%法则（每年安全提现4万美元）测算实现100万美元FIRE提早退休目标所需的月度储蓄策略。',
  },
];
