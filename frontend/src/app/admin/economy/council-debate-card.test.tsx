import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CouncilDebateCard, type CouncilDebateData } from './council-debate-card';

afterEach(cleanup);

describe('economy council verified evidence', () => {
  it('does not invent 14 votes or a safe policy approval when there is no verified run', () => {
    const { container } = render(<CouncilDebateCard />);
    expect(screen.getByRole('status').textContent).toContain('검증된');
    expect(container.textContent).not.toContain('가결 (Agree)');
    expect(container.textContent).not.toContain('14석');
    expect(container.textContent).not.toContain('BOUNDED_AUTO');
  });

  it('shows an API failure instead of a synthetic council result', () => {
    const { container } = render(<CouncilDebateCard unavailableReason="토론 기록을 불러오지 못했습니다." />);
    expect(screen.getByRole('status').textContent).toContain('토론 기록을 불러오지 못했습니다.');
    expect(container.textContent).not.toContain('가결 (Agree)');
  });

  it('keeps keyboard-accessible 44px round controls for an actual verified result', () => {
    const debate: CouncilDebateData = {
      proposalId: 'persisted-evidence-1',
      evaluatedAt: '2026-10-26T13:00:00.000Z',
      rounds: ([1, 2, 3] as const).map((round) => ({
        round, name: `Round ${round}`, roundSummary: 'Recorded vote',
        votes: [{ role: 'AUDITOR_AGENT', decision: 'abstain', confidence: 0.5, rationale: 'Pending evidence', risks: [] }],
      })),
      finalDecision: 'abstain', aggregateConfidence: 0.5, disagreementScore: 0,
      isHighDisagreement: false, recommendedMode: 'SHADOW', criticalVetoes: [],
      agreeCount: 0, vetoCount: 0, abstainCount: 1,
      consensusRationale: 'Not approved', topRisks: [],
    };
    render(<CouncilDebateCard initialData={debate} />);
    expect(screen.getByText(/보류 \(Abstain\)/)).toBeDefined();
    expect(screen.getByRole('button', { name: /1단계 독립 제안/ }).className).toContain('min-h-11');
  });

});
