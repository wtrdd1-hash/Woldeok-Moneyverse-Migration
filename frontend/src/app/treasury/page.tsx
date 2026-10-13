import type { Metadata } from 'next';
import { Landmark } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
import type {
  TreasuryOverviewData,
  TreasuryLedgerItem,
  UserEligibilityStatus,
} from './treasury.types';
import { TreasuryPortalClient } from './treasury-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '[2026] 대국민 국고(Treasury) 포털 — 5대 공공 국고 활용처 & 투명 재정 공시 | 월덕 머니버스',
  description:
    '월덕 머니버스 중앙정부 국고 금고(VAULT_MAIN) 공개 포털. 30% 법정 안전 비축금 원칙 하에 시민 보편 기본배당, 청년 창업 그랜트, 긴급 구호 복지금, WLD 바이백 소각, 국채 우대금리 혜택을 투명하게 확인하고 즉시 신청하세요.',
  keywords: [
    '국고',
    '국고 포털',
    '기본배당',
    '청년 창업 지원금',
    '긴급 구호금',
    'WLD 소각',
    '국채 금리',
    '월덕 머니버스',
    '머니버스 국고',
  ],
  openGraph: {
    title: '[2026] 대국민 국고(Treasury) 포털 — 5대 공공 국고 혜택 & 투명 재정 공시',
    description:
      '중앙정부 국고 2,500만 WLD 기반 5대 시민 환원 프로그램. 시민 기본배당 및 창업 지원금을 즉시 신청하세요.',
    type: 'website',
  },
};

interface BackendOverview {
  balance_wld?: string;
  total_balance_wld?: string;
  cumulative_revenue_wld?: string;
  cumulative_expenditure_wld?: string;
  burn_total_wld?: string;
}

export default async function TreasuryPage() {
  const isLoggedIn = await isLoggedInMember();

  // 백엔드 국고 개요 조회 시도 (미기동 시 안전 기본값 제공)
  const backendOverview = await apiOrNull<BackendOverview>('/api/v1/admin/treasury/overview');

  const totalBal = backendOverview?.total_balance_wld ?? backendOverview?.balance_wld ?? '25000000';
  const totalNum = Number.parseInt(totalBal, 10) || 25000000;
  const safeReserveNum = Math.floor(totalNum * 0.3);
  const availableNum = Math.max(0, totalNum - safeReserveNum);

  const overview: TreasuryOverviewData = {
    totalBalanceWld: totalNum.toLocaleString(),
    safeReserveWld: safeReserveNum.toLocaleString(),
    availableBalanceWld: availableNum.toLocaleString(),
    reserveRatioPercent: 30,
    totalCumulativeDisbursedWld: (Number.parseInt(backendOverview?.cumulative_expenditure_wld ?? '3420000', 10) || 3420000).toLocaleString(),
    totalBurnedWld: (Number.parseInt(backendOverview?.burn_total_wld ?? '1280000', 10) || 1280000).toLocaleString(),
    beneficiaryCount: 1420,
    activeProgramsCount: 5,
    lastDisbursedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  };

  const initialLedger: TreasuryLedgerItem[] = [
    {
      id: 'disb-101',
      txType: 'CITIZEN_DIVIDEND',
      txTypeLabel: '시민 기본배당',
      amountWld: '1,200',
      reason: '2026년 10월 2주차 국고 잉여금 정기 시민 기본배당 자동 지급',
      beneficiaryMasked: 'citi***92',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'disb-102',
      txType: 'EMERGENCY_RELIEF',
      txTypeLabel: '긴급 구호금',
      amountWld: '3,000',
      reason: '투자 손실 저잔고 시민 패자부활 세이프티넷 긴급 생계 지원',
      beneficiaryMasked: 'trd***04',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'disb-103',
      txType: 'STARTUP_GRANT',
      txTypeLabel: '창업 그랜트',
      amountWld: '50,000',
      reason: '디파이 자동 마켓메이커(AMM) 벤처 스타트업 1호 법인 설립 시드 지원',
      beneficiaryMasked: 'ent***88',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'disb-104',
      txType: 'BUYBACK_BURN',
      txTypeLabel: '시장 바이백 소각',
      amountWld: '150,000',
      reason: 'M2 통화량 급증에 따른 인플레이션 방어 공개 시장 WLD 영구 소각',
      beneficiaryMasked: 'BURN_VAULT_0x',
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'disb-105',
      txType: 'BOND_YIELD_BOOSTER',
      txTypeLabel: '국채 금리 부스터',
      amountWld: '2,500',
      reason: '10년 만기 머니버스 재정국채 성실 보유자 추가 우대 이자 지급',
      beneficiaryMasked: 'inv***15',
      createdAt: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
    },
  ];

  const eligibility: UserEligibilityStatus = {
    isLoggedIn,
    citizenDividendEligible: isLoggedIn,
    citizenDividendCooldownHours: 0,
    emergencyReliefEligible: isLoggedIn,
    userCashBalance: '3,200',
    bondBoosterEligible: isLoggedIn,
    activeGrantApplied: false,
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 sm:pb-16 select-none">
      <PageHeader
        eyebrow="중앙정부 재정 & 공공 복지"
        title="대국민 공개 국고(Treasury) 포털"
      >
        중앙정부 국고(VAULT_MAIN)의 재정 현황을 투명하게 공시하고, 30% 법정 안전 비축금을 제외한 잉여금을 시민 기본배당, 청년·창업 그랜트, 긴급 구호금으로 직접 환원합니다.
      </PageHeader>

      <TreasuryPortalClient
        initialOverview={overview}
        initialLedger={initialLedger}
        initialEligibility={eligibility}
      />
    </div>
  );
}
