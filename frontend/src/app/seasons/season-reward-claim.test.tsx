import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SeasonRewardClaimBanner } from './season-reward-claim-banner';

describe('SeasonRewardClaimBanner', () => {
  it('does not render when reward is zero and no trophy', () => {
    const { container } = render(
      <SeasonRewardClaimBanner
        seasonId="season-1"
        seasonName="시즌 1: First Capital"
        tierRewardWld={0}
        tierTrophy={null}
        myTier="BRONZE"
        myRank={150}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders celebratory banner with rank, reward WLD and claim button', () => {
    render(
      <SeasonRewardClaimBanner
        seasonId="season-1"
        seasonName="시즌 1: First Capital"
        tierRewardWld={50000}
        tierTrophy="트로피: 마스터 골드"
        myTier="CHALLENGER"
        myRank={1}
      />
    );

    expect(screen.getByText(/시즌 1: First Capital 시즌 랭킹 최종 보상/i)).toBeDefined();
    expect(screen.getByText(/1위 · CHALLENGER/i)).toBeDefined();
    expect(screen.getByText(/\+50,000 WLD/i)).toBeDefined();
    expect(screen.getByText(/시즌 보상 수령하기/i)).toBeDefined();
  });
});
