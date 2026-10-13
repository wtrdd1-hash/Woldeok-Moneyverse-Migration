export type TreasuryProgramId =
  | 'CITIZEN_DIVIDEND'
  | 'STARTUP_GRANT'
  | 'EMERGENCY_RELIEF'
  | 'BUYBACK_BURN'
  | 'BOND_YIELD_BOOSTER';

export interface TreasuryProgramMeta {
  readonly id: TreasuryProgramId;
  readonly title: string;
  readonly titleEn: string;
  readonly subtitle: string;
  readonly category: 'DIVIDEND' | 'VENTURE' | 'WELFARE' | 'MACRO' | 'FINANCE';
  readonly badgeText: string;
  readonly badgeColor: string;
  readonly maxBenefitText: string;
  readonly cooldownDesc: string;
  readonly requirementDesc: string;
  readonly isInstantClaim: boolean;
  readonly description: string;
}

export interface TreasuryOverviewData {
  readonly totalBalanceWld: string;
  readonly safeReserveWld: string;
  readonly availableBalanceWld: string;
  readonly reserveRatioPercent: number; // typically 30%
  readonly totalCumulativeDisbursedWld: string;
  readonly totalBurnedWld: string;
  readonly beneficiaryCount: number;
  readonly activeProgramsCount: number;
  readonly lastDisbursedAt: string;
}

export interface TreasuryLedgerItem {
  readonly id: string;
  readonly txType: string;
  readonly txTypeLabel: string;
  readonly amountWld: string;
  readonly reason: string;
  readonly beneficiaryMasked: string;
  readonly createdAt: string;
}

export interface UserEligibilityStatus {
  readonly isLoggedIn: boolean;
  readonly citizenDividendEligible: boolean;
  readonly citizenDividendCooldownHours: number;
  readonly emergencyReliefEligible: boolean;
  readonly userCashBalance: string;
  readonly bondBoosterEligible: boolean;
  readonly activeGrantApplied: boolean;
}

/** 시민 참여형 주민참여예산(DAO Budget Voting) 제안서 */
export interface TreasuryDaoProposal {
  readonly id: string;
  readonly title: string;
  readonly category: 'FEE_CUT' | 'COMMUNITY_FUND' | 'MARKET_MAKING' | 'PUBLIC_EVENT';
  readonly categoryLabel: string;
  readonly requestedBudgetWld: number;
  readonly proposerMasked: string;
  readonly description: string;
  readonly votesCount: number;
  readonly targetVotes: number;
  readonly status: 'VOTING' | 'PASSED' | 'EXECUTED';
  readonly createdAt: string;
  readonly hasVoted?: boolean;
}

/** 관리자 창업 그랜트 심사 신청건 */
export interface TreasuryGrantApplication {
  readonly id: string;
  readonly businessName: string;
  readonly applicantId: string;
  readonly applicantMasked: string;
  readonly requestedAmountWld: number;
  readonly businessPlan: string;
  readonly status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  readonly submittedAt: string;
  readonly reviewedAt?: string;
  readonly reviewNote?: string;
}

export const TREASURY_PROGRAMS: readonly TreasuryProgramMeta[] = [
  {
    id: 'CITIZEN_DIVIDEND',
    title: '시민 보편 기본배당',
    titleEn: 'Universal Citizen Dividend',
    subtitle: '국고 잉여금 균등 환원 프로그램',
    category: 'DIVIDEND',
    badgeText: '기본 소득',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    maxBenefitText: '주간 500 ~ 2,000 WLD',
    cooldownDesc: '주 1회 (7일 쿨다운)',
    requirementDesc: '활성 시민 계정 (가입 24시간 이상)',
    isInstantClaim: true,
    description:
      '중앙정부 국고 금고의 30% 안전비축금을 초과하는 재정 잉여금을 모든 시민에게 균등하게 현금 환원하여 기본 소비 여력을 보장합니다.',
  },
  {
    id: 'STARTUP_GRANT',
    title: '청년·창업 벤처 그랜트 펀드',
    titleEn: 'Venture & Startup Grant',
    subtitle: '신규 법인 및 벤처 사업 무상 지원',
    category: 'VENTURE',
    badgeText: '창업 지원',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    maxBenefitText: '최대 100,000 WLD',
    cooldownDesc: '분기 1회 심사',
    requirementDesc: '사업 아이템 기획서 제출 및 관리자 심사',
    isInstantClaim: false,
    description:
      '머니버스 내 새로운 기업(Enterprise) 설립이나 혁신 서비스 구축을 기획하는 창업가에게 초기 시드머니를 무상 지원합니다.',
  },
  {
    id: 'EMERGENCY_RELIEF',
    title: '취약계층 긴급 구호 복지금',
    titleEn: 'Emergency Relief Subsidy',
    subtitle: '파산 위기 시민 패자부활 세이프티넷',
    category: 'WELFARE',
    badgeText: '긴급 구호',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    maxBenefitText: '즉시 3,000 WLD 지급',
    cooldownDesc: '월 1회 (30일 쿨다운)',
    requirementDesc: '보유 현금 잔고 5,000 WLD 이하 취약 계층',
    isInstantClaim: true,
    description:
      '주식/투자 실패 등으로 잔고가 5,000 WLD 이하로 급감한 시민에게 즉각적인 재기 지원금을 지급하여 파산을 방지합니다.',
  },
  {
    id: 'BUYBACK_BURN',
    title: 'WLD 시장 바이백 & 영구 소각',
    titleEn: 'Market Buyback & Deflationary Burn',
    subtitle: '거시경제 통화가치 방어 디플레이션 펀드',
    category: 'MACRO',
    badgeText: '통화 안정',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    maxBenefitText: '시장 유통량 영구 소각',
    cooldownDesc: '거시경제 자동 트리거',
    requirementDesc: '인플레이션 감지 시 국고 자금 자동 집행',
    isInstantClaim: false,
    description:
      '시중의 잉여 WLD를 국고 재정으로 공개 매수하여 영구 소각함으로써 통화 인플레이션을 억제하고 전체 화폐 가치를 상승시킵니다.',
  },
  {
    id: 'BOND_YIELD_BOOSTER',
    title: '공공 국채 우대금리 부스터',
    titleEn: 'Sovereign Bond Yield Booster',
    subtitle: '국채 보유 시민 재정 보너스 이자 지원',
    category: 'FINANCE',
    badgeText: '금리 우대',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    maxBenefitText: '연 +2.5%p 추가 이자',
    cooldownDesc: '국채 만기 시 자동 합산',
    requirementDesc: '정부 공공 국채(Bonds) 1좌 이상 보유',
    isInstantClaim: true,
    description:
      '정부 공공 국채를 매입하여 국가 재정에 기여한 성실 투자자에게 국고 지원금을 통해 추가 쿠폰 이율을 얹어드립니다.',
  },
];
