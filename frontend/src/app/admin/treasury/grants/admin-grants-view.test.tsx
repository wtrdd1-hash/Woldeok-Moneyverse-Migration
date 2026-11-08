import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AdminGrantsView, GrantApp } from './admin-grants-view';

const mockApps: GrantApp[] = [
  {
    id: 'GRANT-2026-001',
    applicantMasked: 'de***er',
    businessName: '월덕스왑 DEX',
    businessPlan: '수학적 AMM 모델 기반 탈중앙 유동성 풀 구축 계획서입니다.',
    category: 'FINTECH',
    tier: 'TIER_1_SEED',
    requestedAmountWld: 500000,
    approvedAmountWld: 0,
    status: 'PENDING_REVIEW',
    aiScore: 92,
    aiEvaluation: '비즈니스 모델 우수',
    submittedAt: '2026-11-08T00:00:00.000Z',
  },
  {
    id: 'GRANT-2026-002',
    applicantMasked: 'al***ce',
    businessName: '네오물류센터',
    businessPlan: '초고속 물류 허브를 건립하여 배송 시간을 단축합니다.',
    category: 'LOGISTICS',
    tier: 'TIER_2_GROWTH',
    requestedAmountWld: 2000000,
    approvedAmountWld: 2000000,
    status: 'COMPLETED',
    aiScore: 88,
    submittedAt: '2026-11-07T00:00:00.000Z',
  },
];

describe('AdminGrantsView', () => {
  it('기본 신청서 목록과 4대 핵심 지표 카드가 정상 렌더링되어야 한다', () => {
    render(<AdminGrantsView initialApplications={mockApps} />);
    expect(screen.getByText(/창업 지원금 신청 대기열/)).toBeDefined();
    expect(screen.getAllByText('월덕스왑 DEX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('원장 복식부기 실시간 집행 엔진')).toBeDefined();
    expect(screen.getByText('환수 즉시 집행 (Sweep Now)')).toBeDefined();
  });

  it('AI 심사 보고서 버튼 클릭 시 AI 심층 진단 팝업이 열려야 한다', () => {
    render(<AdminGrantsView initialApplications={mockApps} />);
    const aiBtn = screen.getByRole('button', { name: /AI 심사 보고서/i });
    fireEvent.click(aiBtn);
    expect(screen.getByText(/1차 AI 자동 심사 심층 평가 보고서/)).toBeDefined();
    expect(screen.getAllByText(/92점/).length).toBeGreaterThanOrEqual(1);
  });

  it('환수 즉시 집행(Sweep Now) 버튼 클릭 시 환수 모달이 열려야 한다', () => {
    render(<AdminGrantsView initialApplications={mockApps} />);
    const sweepBtn = screen.getByRole('button', { name: /환수 즉시 집행/i });
    fireEvent.click(sweepBtn);
    expect(screen.getByText(/14일 경과 미창업 지원금 즉시 환수/)).toBeDefined();
    expect(screen.getByText(/환수 집행 규칙/)).toBeDefined();
  });

  it('승인 집행 버튼 클릭 시 승인 확인 모달이 열려야 한다', () => {
    render(<AdminGrantsView initialApplications={mockApps} />);
    const approveBtn = screen.getByRole('button', { name: /승인 집행/i });
    fireEvent.click(approveBtn);
    expect(screen.getByText('창업 지원금 국고 승인 집행')).toBeDefined();
    expect(screen.getByText(/복식부기 전표/)).toBeDefined();
  });

  it('반려 처리 버튼 클릭 시 반려 확인 모달이 열려야 한다', () => {
    render(<AdminGrantsView initialApplications={mockApps} />);
    const rejectBtn = screen.getByRole('button', { name: /반려 처리/i });
    fireEvent.click(rejectBtn);
    expect(screen.getByText('창업 지원금 신청 반려')).toBeDefined();
  });
});
