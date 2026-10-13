import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreasuryReserveGauge } from './treasury-reserve-gauge';
import { TreasuryProgramCard } from './treasury-program-card';
import { TreasuryPortalClient } from './treasury-portal-client';
import {
  TREASURY_PROGRAMS,
  type TreasuryOverviewData,
  type TreasuryLedgerItem,
  type UserEligibilityStatus,
} from './treasury.types';

const mockOverview: TreasuryOverviewData = {
  totalBalanceWld: '25,000,000',
  safeReserveWld: '7,500,000',
  availableBalanceWld: '17,500,000',
  reserveRatioPercent: 30,
  totalCumulativeDisbursedWld: '3,420,000',
  totalBurnedWld: '1,280,000',
  beneficiaryCount: 1420,
  activeProgramsCount: 5,
  lastDisbursedAt: new Date().toISOString(),
};

const mockLedger: readonly TreasuryLedgerItem[] = [
  {
    id: 'disb-1',
    txType: 'CITIZEN_DIVIDEND',
    txTypeLabel: '시민 기본배당',
    amountWld: '1,200',
    reason: '정기 시민 기본배당 자동 지급',
    beneficiaryMasked: 'citi***92',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'disb-2',
    txType: 'EMERGENCY_RELIEF',
    txTypeLabel: '긴급 구호금',
    amountWld: '3,000',
    reason: '투자 손실 위기 시민 긴급 구호금 지원',
    beneficiaryMasked: 'trd***04',
    createdAt: new Date().toISOString(),
  },
];

const mockEligibility: UserEligibilityStatus = {
  isLoggedIn: true,
  citizenDividendEligible: true,
  citizenDividendCooldownHours: 0,
  emergencyReliefEligible: true,
  userCashBalance: '3,200',
  bondBoosterEligible: true,
  activeGrantApplied: false,
};

describe('National Treasury Portal & 5 Core Expenditure Programs Suite', () => {
  it('renders TreasuryReserveGauge with 30% safe reserve and disbursable surplus', () => {
    render(<TreasuryReserveGauge overview={mockOverview} isEn={false} />);

    // 총 잔액 표기 검증
    expect(screen.getByText('25,000,000')).toBeDefined();
    // 30% 안전 비축금 배지 검증
    expect(screen.getByText(/30% 법정 안전 비축금 준수/i)).toBeDefined();
    // 가용 잉여금 및 비축금 수치 검증
    expect(screen.getByText('17,500,000 WLD')).toBeDefined();
    expect(screen.getByText('7,500,000 WLD')).toBeDefined();
    // 누적 시민 환원액 및 소각량 검증
    expect(screen.getByText(/3,420,000 WLD/i)).toBeDefined();
    expect(screen.getByText(/1,280,000 WLD/i)).toBeDefined();
  });

  it('renders TreasuryProgramCard with program metadata and claim action button', () => {
    const handleClaim = vi.fn();
    const handleOpenGrant = vi.fn();

    render(
      <TreasuryProgramCard
        program={TREASURY_PROGRAMS[0]!}
        eligibility={mockEligibility}
        onClaim={handleClaim}
        onOpenGrantModal={handleOpenGrant}
        isEn={false}
      />
    );

    // 프로그램 타이틀 및 배지 검증
    expect(screen.getByText('시민 보편 기본배당')).toBeDefined();
    expect(screen.getByText('기본 소득')).toBeDefined();
    expect(screen.getByText('주간 500 ~ 2,000 WLD')).toBeDefined();

    // 즉시 수령 버튼 클릭 검증
    const claimBtn = screen.getByRole('button', { name: /지금 즉시 국고 혜택 수령하기/i });
    expect(claimBtn).toBeDefined();
    fireEvent.click(claimBtn);
    expect(handleClaim).toHaveBeenCalledWith('CITIZEN_DIVIDEND');
  });

  it('renders TreasuryPortalClient with 5 core programs, category tabs, and public ledger stream', () => {
    render(
      <TreasuryPortalClient
        initialOverview={mockOverview}
        initialLedger={mockLedger}
        initialEligibility={mockEligibility}
        isEn={false}
      />
    );

    // 5대 핵심 프로그램 타이틀 모두 렌더링 확인
    expect(screen.getByText('시민 보편 기본배당')).toBeDefined();
    expect(screen.getByText('청년·창업 벤처 그랜트 펀드')).toBeDefined();
    expect(screen.getByText('취약계층 긴급 구호 복지금')).toBeDefined();
    expect(screen.getByText('WLD 시장 바이백 & 영구 소각')).toBeDefined();
    expect(screen.getByText('공공 국채 우대금리 부스터')).toBeDefined();

    // 실시간 투명 지출 원장 테이블 검증
    expect(screen.getByText('실시간 투명 국고 지출 원장')).toBeDefined();
    expect(screen.getByText('정기 시민 기본배당 자동 지급')).toBeDefined();
    expect(screen.getByText('투자 손실 위기 시민 긴급 구호금 지원')).toBeDefined();

    // 카테고리 필터 탭 클릭 전환 검증
    const ventureTab = screen.getByText('창업지원');
    fireEvent.click(ventureTab);
    // 필터링 후 창업 그랜트는 남아있고 기본배당은 언마운트됨
    expect(screen.getByText('청년·창업 벤처 그랜트 펀드')).toBeDefined();
    expect(screen.queryByText('시민 보편 기본배당')).toBeNull();

    // 창업 그랜트 모달 열기 검증
    const openGrantBtn = screen.getByRole('button', { name: /창업 그랜트 지원서 작성하기/i });
    fireEvent.click(openGrantBtn);
    expect(screen.getByText('청년·창업 벤처 그랜트 신청서')).toBeDefined();
    expect(screen.getByPlaceholderText(/예: 델타 트레이딩 랩스/i)).toBeDefined();

    // 주민참여예산 거버넌스 섹션 검증
    expect(screen.getByText('시민 참여형 주민참여예산 투표제')).toBeDefined();
    expect(screen.getByText(/월덕거래소 주식 매매 수수료 전액 국고 대납 지원/i)).toBeDefined();
  });
});
