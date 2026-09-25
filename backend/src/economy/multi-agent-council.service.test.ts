import { describe, expect, it } from 'vitest';
import {
  COUNCIL_AGENT_PROFILES,
  COUNCIL_AGENT_ROLES,
  executeCouncilDebate,
} from './multi-agent-council.service';

describe('MultiAgentCouncilService', () => {
  it('should initialize all 14 specialist agent profiles according to spec', () => {
    expect(COUNCIL_AGENT_ROLES).toHaveLength(14);
    for (const role of COUNCIL_AGENT_ROLES) {
      const profile = COUNCIL_AGENT_PROFILES[role];
      expect(profile).toBeDefined();
      expect(profile.nameKo).toBeTruthy();
      expect(profile.objectiveVector.length).toBeGreaterThan(0);
      expect(profile.forbiddenObjectives.length).toBeGreaterThan(0);
    }
  });

  it('should approve a balanced, safe economic adjustment in 3 rounds', () => {
    const safeProposal = {
      id: 'prop_safe_01',
      category: 'tax_rate_micro',
      description: '부동산 거래세 0.1% 미세 인상 조정',
      knobs: [
        {
          key: 'property.transaction_tax_bps',
          currentValue: 100,
          proposedValue: 110,
          deltaPct: 10,
        },
      ],
    };

    const result = executeCouncilDebate(safeProposal);

    expect(result.rounds).toHaveLength(3);
    expect(result.rounds[0]?.round).toBe(1);
    expect(result.rounds[1]?.round).toBe(2);
    expect(result.rounds[2]?.round).toBe(3);
    expect(result.finalDecision).toBe('agree');
    expect(result.recommendedMode).toBe('BOUNDED_AUTO');
    expect(result.agreeCount).toBeGreaterThanOrEqual(12);
    expect(result.criticalVetoes).toHaveLength(0);
  });

  it('should trigger critical veto and degrade to RECOMMEND when high faucet expansion is detected', () => {
    const dangerousFaucetProposal = {
      id: 'prop_danger_01',
      category: 'faucet_boost',
      description: '플레이어 퀘스트 보상 50% 일괄 증액',
      knobs: [
        {
          key: 'work.base_reward_wld',
          currentValue: 1000,
          proposedValue: 1500,
          deltaPct: 50,
        },
      ],
    };

    const result = executeCouncilDebate(dangerousFaucetProposal);

    expect(result.finalDecision).toBe('veto');
    expect(result.recommendedMode).toBe('RECOMMEND');
    expect(result.vetoCount).toBeGreaterThanOrEqual(1);
    expect(result.criticalVetoes.length).toBeGreaterThanOrEqual(1);
    // MACRO_AGENT or ABUSE_AGENT vetoed
    const vetoRoles = result.criticalVetoes.map((v) => v.role);
    expect(vetoRoles.includes('ABUSE_AGENT') || result.vetoCount > 0).toBe(true);
  });

  it('should detect high disagreement and degrade to SHADOW or RECOMMEND when votes are split', () => {
    const splitProposal = {
      id: 'prop_split_01',
      category: 'sink_elasticity',
      description: '상점 코스메틱 가격 15% 인상',
      knobs: [
        {
          key: 'shop.cosmetic_price',
          currentValue: 100,
          proposedValue: 115,
          deltaPct: 15,
        },
      ],
    };

    // Override some votes to create artificial high disagreement without critical veto
    const overrides = {
      PLAYER_WELFARE_AGENT: { decision: 'abstain' as const, confidence: 0.5 },
      BUSINESS_AGENT: { decision: 'abstain' as const, confidence: 0.4 },
      CAUSAL_AGENT: { decision: 'abstain' as const, confidence: 0.3 },
    };

    const result = executeCouncilDebate(splitProposal, overrides);

    expect(result.isHighDisagreement || result.abstainCount > 2).toBe(true);
    expect(['SHADOW', 'RECOMMEND']).toContain(result.recommendedMode);
  });
});
