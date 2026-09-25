import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EconomyAiStatusCard, type EconomyAiStatus } from './ai-status-card';

afterEach(cleanup);

function status(overrides: Partial<EconomyAiStatus> = {}): EconomyAiStatus {
  return {
    switchState: 'enabled',
    autoPolicySwitchState: 'enabled',
    jobLimitTighteningSwitchState: 'disabled',
    operationalState: 'blocked_by_evidence',
    modelReachability: 'healthy',
    reviewCount: 0,
    shadowReviewCount: 1,
    proposalState: {
      eligible: false,
      blockedBy: ['at least one day had too few active members to read'],
      adjustmentCount: 5,
      activeMemberCount: 12,
      minimumActiveSample: 20,
      sampleSufficientDays: 0,
      days: 7,
    },
    lastRuns: {
      authoritativeReview: { status: 'succeeded', period_key: '2026-W38', finished_at: '2026-09-19T03:10:00Z' },
      shadowHealth: { status: 'succeeded', period_key: '2026-09-19', finished_at: '2026-09-19T03:20:00Z' },
      autoPolicy: { status: 'succeeded', period_key: '2026-W38', finished_at: '2026-09-19T03:30:00Z' },
    },
    shadowAgents: [{
      domain: 'jobs',
      seat: 'A',
      model: 'llama3.2:3b',
      review_count: 1,
      agree_count: 1,
      veto_count: 0,
      abstain_count: 0,
      avg_confidence: 0.91,
      avg_latency_ms: 12000,
      avg_total_tokens: 320,
    }],
    ...overrides,
  };
}

describe('EconomyAiStatusCard', () => {
  it('separates model reachability from policy eligibility', () => {
    render(<EconomyAiStatusCard status={status()} />);
    expect(screen.getByText('근거 부족 · 정책 차단')).toBeDefined();
    expect(screen.getByText('모델 도달 정상')).toBeDefined();
    expect(screen.getByText('12 / 20')).toBeDefined();
    expect(screen.getByText('0 / 7')).toBeDefined();
    expect(screen.getByText('at least one day had too few active members to read')).toBeDefined();
    expect(screen.getAllByText('SHADOW').length).toBeGreaterThan(0);
    expect(screen.getAllByText('평균 모델 confidence').length).toBeGreaterThan(0);
    expect(screen.getByText(/confidence는 각 모델 리뷰가 반환한 0~1 confidence의 산술 평균/)).toBeDefined();
    expect(screen.getAllByText('91.0%').length).toBeGreaterThan(0);
    expect(screen.getByText(/최근 실행 2026\. 9\. 19\. 12시 10분 0초/)).toBeDefined();
    expect(screen.getByText(/최근 실행 2026\. 9\. 19\. 12시 20분 0초/)).toBeDefined();
    expect(screen.getByText(/최근 실행 2026\. 9\. 19\. 12시 30분 0초/)).toBeDefined();
  });

  it('shows missing scheduler timestamps explicitly instead of implying freshness', () => {
    render(<EconomyAiStatusCard status={status({ lastRuns: { authoritativeReview: { status: 'succeeded', period_key: '2026-W38' } } })} />);
    expect(screen.getAllByText('최근 실행 실행 시각 없음').length).toBeGreaterThan(0);
  });

  it('does not describe an enabled but unexercised switch as active AI review', () => {
    const { container } = render(<EconomyAiStatusCard status={status({
      operationalState: 'configured_not_exercised',
      modelReachability: 'unknown',
      shadowReviewCount: 0,
      shadowAgents: [],
      proposalState: { eligible: true, blockedBy: [], adjustmentCount: 1 },
    })} />);
    expect(screen.getByText('설정됨 · 미검증')).toBeDefined();
    expect(container.textContent).not.toContain('AI 검토 활성');
  });
});
