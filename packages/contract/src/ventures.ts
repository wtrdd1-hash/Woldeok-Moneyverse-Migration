/**
 * 가상 스타트업 VC 엔젤투자 & 크라우드펀딩 계약 및 배당 정산 엔진
 * 
 * 5대 테크 산업군(AI 핀테크, 양자 컴퓨팅, 우주 로보틱스, 바이오 헬스케어, 친환경 그리드)
 * 가상 법인 설립, 30% 지분 공모주 청약(IPO) 비례 배분, 10%~50% 매출 기반 주주 배당 분배,
 * 5% 이상 엔젤 주주 거버넌스 및 3% 법인세 영구 소각(Hard Sink) 규칙을 제공합니다.
 */

export type VentureSector =
  | 'AI_FINTECH'
  | 'QUANTUM_COMPUTING'
  | 'SPACE_ROBOTICS'
  | 'BIO_HEALTHCARE'
  | 'GREEN_GRID';

export type IpoStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type GovernanceProposalStatus = 'VOTING' | 'PASSED' | 'REJECTED' | 'EXECUTED';

export interface GovernanceProposal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  votesYes: number;
  votesNo: number;
  endsAt: string;
  status: GovernanceProposalStatus;
  requiredAngelStakePct: number; // e.g. 5.0
}

export interface StartupCompany {
  id: string;
  name: string;
  symbol: string;
  sector: VentureSector;
  founderId: string;
  founderName: string;
  foundedAt: string;
  capital: number; // WLD
  valuation: number; // WLD
  totalShares: number; // e.g. 1,000,000
  founderShares: number; // 700,000 (70%)
  publicShares: number; // 300,000 (30%)
  sharePrice: number; // WLD per share
  dailyRevenue: number; // WLD per day
  dividendPayoutRatio: number; // 0.10 to 0.50
  dailyDividendPerShare: number; // WLD
  description: string;
  ipoStatus: IpoStatus;
  proposals?: GovernanceProposal[] | undefined;
}

export interface IpoCampaign {
  id: string;
  companyId: string;
  companyName: string;
  symbol: string;
  sector: VentureSector;
  targetAmount: number; // WLD
  offeredShares: number; // 300,000 shares (30%)
  sharePrice: number; // WLD per share
  currentSubscribedAmount: number; // WLD
  subscriptionRate: number; // % (e.g. 145.5%)
  minSubscriptionShares: number; // e.g. 100
  endsAt: string;
  status: IpoStatus;
}

export interface ShareholderHolding {
  id: string;
  companyId: string;
  companyName: string;
  symbol: string;
  sector: VentureSector;
  shares: number;
  shareRatioPct: number; // %
  isAngelInvestor: boolean; // shareRatioPct >= 5.0%
  totalClaimedDividend: number; // WLD
  unclaimedDividend: number; // WLD
  lastClaimedAt?: string | undefined;
}

export interface IpoAllocationResult {
  allocatedShares: number;
  spentAmount: number;
  refundAmount: number;
  competitionRatio: number;
}

export const MIN_STARTUP_CAPITAL = 10000000; // 1,000만 WLD 최소 창업 자본금
export const IPO_PUBLIC_SHARE_RATIO = 0.30; // 30% 공모주 청약 비율
export const CORPORATE_TAX_RATE = 0.03; // 3% 법인 매출 하드 소각률
export const ANGEL_INVESTOR_THRESHOLD_PCT = 5.0; // 5.0% 지분율 이상 엔젤 주주

export const VENTURE_SECTOR_INFO: Record<
  VentureSector,
  { label: string; description: string; tagColor: string }
> = {
  AI_FINTECH: {
    label: 'AI 핀테크 & 퀀트',
    description: '인공지능 자산운용 및 차세대 초고속 금융 프로토콜',
    tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
  QUANTUM_COMPUTING: {
    label: '양자 컴퓨팅 & 암호',
    description: '양자 중첩 칩셋 및 차세대 보안 분산 네트워크',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
  SPACE_ROBOTICS: {
    label: '우주 로보틱스 & 궤도',
    description: '궤도 물류 우주선 및 행성 자원 채굴 로봇 시스템',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  BIO_HEALTHCARE: {
    label: '바이오 헬스케어 & 유전자',
    description: '세포 재생 테라피 및 분자 단위 AI 신약 합성',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  GREEN_GRID: {
    label: '친환경 스마트 그리드',
    description: '상온 초전도 전력망 및 차세대 수소 핵융합 발전',
    tagColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
  },
};

export const INITIAL_VENTURE_COMPANIES: StartupCompany[] = [
  {
    id: 'vc-1',
    name: '뉴럴마인드 AI',
    symbol: 'NMI',
    sector: 'AI_FINTECH',
    founderId: 'founder-1',
    founderName: '알고리즘덕',
    foundedAt: '2026-09-01',
    capital: 50000000,
    valuation: 500000000,
    totalShares: 1000000,
    founderShares: 700000,
    publicShares: 300000,
    sharePrice: 500,
    dailyRevenue: 30000000,
    dividendPayoutRatio: 0.35,
    dailyDividendPerShare: 10.5,
    description: '초거대 딥러닝 기반 고빈도 차익거래 및 알고리즘 자동 매매 봇',
    ipoStatus: 'COMPLETED',
    proposals: [
      {
        id: 'prop-1',
        companyId: 'vc-1',
        title: '신규 고성능 HFT 서버 인프라 증설 승인 건',
        description: '일일 처리 틱수를 3배 확장하기 위한 5,000만 WLD R&D 투자 안건',
        votesYes: 45000,
        votesNo: 1200,
        endsAt: '2026-10-05',
        status: 'VOTING',
        requiredAngelStakePct: 5.0,
      },
    ],
  },
  {
    id: 'vc-2',
    name: '퀀텀코어 시스템즈',
    symbol: 'QCS',
    sector: 'QUANTUM_COMPUTING',
    founderId: 'founder-2',
    founderName: '양자마스터',
    foundedAt: '2026-09-10',
    capital: 70000000,
    valuation: 750000000,
    totalShares: 1000000,
    founderShares: 700000,
    publicShares: 300000,
    sharePrice: 750,
    dailyRevenue: 45000000,
    dividendPayoutRatio: 0.40,
    dailyDividendPerShare: 18.0,
    description: '128 큐비트 극저온 양자 컴퓨터 및 영지식 증명 가속기',
    ipoStatus: 'ACTIVE',
  },
  {
    id: 'vc-3',
    name: '에어로덕 로보틱스',
    symbol: 'ADR',
    sector: 'SPACE_ROBOTICS',
    founderId: 'founder-3',
    founderName: '스타쉽덕',
    foundedAt: '2026-09-15',
    capital: 40000000,
    valuation: 420000000,
    totalShares: 1000000,
    founderShares: 700000,
    publicShares: 300000,
    sharePrice: 420,
    dailyRevenue: 24000000,
    dividendPayoutRatio: 0.30,
    dailyDividendPerShare: 7.2,
    description: '저궤도 위성 군집 자동 수리 및 자율 비행 로버 메카트로닉스',
    ipoStatus: 'ACTIVE',
  },
  {
    id: 'vc-4',
    name: '게놈시퀀스 바이오',
    symbol: 'GSB',
    sector: 'BIO_HEALTHCARE',
    founderId: 'founder-4',
    founderName: '바이오덕',
    foundedAt: '2026-09-18',
    capital: 30000000,
    valuation: 350000000,
    totalShares: 1000000,
    founderShares: 700000,
    publicShares: 300000,
    sharePrice: 350,
    dailyRevenue: 18000000,
    dividendPayoutRatio: 0.25,
    dailyDividendPerShare: 4.5,
    description: '합성 생물학 기반 세포 역노화 텔로미어 보존 치료제',
    ipoStatus: 'UPCOMING',
  },
  {
    id: 'vc-5',
    name: '에코그리드 파워',
    symbol: 'EGP',
    sector: 'GREEN_GRID',
    founderId: 'founder-5',
    founderName: '솔라테크',
    foundedAt: '2026-09-20',
    capital: 60000000,
    valuation: 600000000,
    totalShares: 1000000,
    founderShares: 700000,
    publicShares: 300000,
    sharePrice: 600,
    dailyRevenue: 38000000,
    dividendPayoutRatio: 0.50,
    dailyDividendPerShare: 19.0,
    description: '차세대 전고체 ESS 및 분산형 AI 마이크로그리드 전력망',
    ipoStatus: 'COMPLETED',
  },
];

export const INITIAL_IPO_CAMPAIGNS: IpoCampaign[] = [
  {
    id: 'ipo-1',
    companyId: 'vc-2',
    companyName: '퀀텀코어 시스템즈',
    symbol: 'QCS',
    sector: 'QUANTUM_COMPUTING',
    targetAmount: 225000000, // 300,000주 * 750 WLD
    offeredShares: 300000,
    sharePrice: 750,
    currentSubscribedAmount: 382500000, // 170% 청약
    subscriptionRate: 170.0,
    minSubscriptionShares: 100,
    endsAt: '2026-09-30 23:59:59',
    status: 'ACTIVE',
  },
  {
    id: 'ipo-2',
    companyId: 'vc-3',
    companyName: '에어로덕 로보틱스',
    symbol: 'ADR',
    sector: 'SPACE_ROBOTICS',
    targetAmount: 126000000, // 300,000주 * 420 WLD
    offeredShares: 300000,
    sharePrice: 420,
    currentSubscribedAmount: 105840000, // 84% 청약
    subscriptionRate: 84.0,
    minSubscriptionShares: 100,
    endsAt: '2026-10-02 23:59:59',
    status: 'ACTIVE',
  },
];

/**
 * 기업가치(Valuation) 산출 함수
 * - 설립 자본금 + (일일 매출 * 30일 * 성장 승수)
 */
export function calculateCompanyValuation(
  capital: number,
  dailyRevenue: number,
  multiplier: number = 15,
): number {
  if (capital <= 0) return 0;
  const valuation = capital + dailyRevenue * multiplier;
  return Math.max(capital, Math.round(valuation));
}

/**
 * IPO 공모주 비례 배분 계산 함수
 * - 목표 모금액 이하일 경우 100% 전량 배정
 * - 초과 청약(경쟁률 > 1.0)일 경우 청약 비율에 따라 비례 배정 및 잔여 증거금 환불
 */
export function calculateIpoAllocation(
  subscriptionAmount: number,
  targetAmount: number,
  totalSubscribedAmount: number,
  offeredShares: number,
  sharePrice: number,
): IpoAllocationResult {
  if (subscriptionAmount <= 0 || sharePrice <= 0 || targetAmount <= 0) {
    return { allocatedShares: 0, spentAmount: 0, refundAmount: 0, competitionRatio: 0 };
  }

  const requestedShares = Math.floor(subscriptionAmount / sharePrice);
  const competitionRatio = Number((totalSubscribedAmount / targetAmount).toFixed(2));

  if (totalSubscribedAmount <= targetAmount) {
    // 100% 전액 배정
    const spentAmount = requestedShares * sharePrice;
    const refundAmount = subscriptionAmount - spentAmount;
    return {
      allocatedShares: requestedShares,
      spentAmount,
      refundAmount,
      competitionRatio: Math.max(0.1, competitionRatio),
    };
  } else {
    // 비례 배정: requestedShares / competitionRatio
    const allocatedShares = Math.floor(requestedShares / competitionRatio);
    const spentAmount = allocatedShares * sharePrice;
    const refundAmount = subscriptionAmount - spentAmount;
    return {
      allocatedShares,
      spentAmount,
      refundAmount,
      competitionRatio,
    };
  }
}

/**
 * 주주 일일 배당금 산출 함수
 * - (일일 매출 * 배당 성향) * (주주 지분율 / 100)
 */
export function calculateShareholderDividend(
  dailyRevenue: number,
  dividendPayoutRatio: number,
  shareRatioPct: number,
): number {
  if (dailyRevenue <= 0 || dividendPayoutRatio <= 0 || shareRatioPct <= 0) {
    return 0;
  }

  const validRatio = Math.max(0.1, Math.min(0.5, dividendPayoutRatio));
  const totalDividendPool = dailyRevenue * validRatio;
  const shareholderAmount = totalDividendPool * (shareRatioPct / 100);

  return Math.max(0, Math.floor(shareholderAmount));
}

/**
 * 법인세 하드 소각(Hard Sink) 정산 함수
 * - 일일 매출의 3% WLD 영구 소각
 */
export function calculateCorporateTaxAndBurn(dailyRevenue: number): number {
  if (dailyRevenue <= 0) return 0;
  return Math.floor(dailyRevenue * CORPORATE_TAX_RATE);
}
