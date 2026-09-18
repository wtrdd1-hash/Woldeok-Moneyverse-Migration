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
      authoritativeReview: { status: 'succeeded', period_key: '2026-W38' },
      shadowHealth: { status: 'succeeded', period_key: '2026-09-19' },
      autoPolicy: { status: 'succeeded', period_key: '2026-W38' },
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
