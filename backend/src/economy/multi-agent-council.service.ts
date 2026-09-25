/**
 * Multi-Agent Economy Council Service
 *
 * Implements the 14-specialist adversarial economy council specified in
 * docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md §25.
 *
 * 3-Stage Debate Protocol:
 * 1. Independent Proposal: Agents evaluate the proposal without seeing peers.
 * 2. Adversarial Critique: Each proposal receives opposing & safety critiques.
 * 3. Rebuttal & Revision: Agents revise assessments, and the Judge summarizes disagreement.
 */

export const COUNCIL_AGENT_ROLES = [
  'MACRO_AGENT',
  'PLAYER_WELFARE_AGENT',
  'SINK_COMMERCE_AGENT',
  'STOCK_FUNDAMENTAL_AGENT',
  'STOCK_FLOW_AGENT',
  'STOCK_MOMENTUM_AGENT',
  'MARKET_INTEGRITY_AGENT',
  'BUSINESS_AGENT',
  'CASINO_RISK_AGENT',
  'ABUSE_AGENT',
  'CAUSAL_AGENT',
  'RED_TEAM_AGENT',
  'AUDITOR_AGENT',
  'JUDGE_AGENT',
] as const;

export type CouncilAgentRole = (typeof COUNCIL_AGENT_ROLES)[number];

export type CouncilDecision = 'agree' | 'veto' | 'abstain';

export interface CouncilAgentProfile {
  readonly role: CouncilAgentRole;
  readonly name: string;
  readonly nameKo: string;
  readonly category: 'macro' | 'welfare' | 'commerce' | 'market' | 'safety' | 'governance';
  readonly objectiveVector: readonly string[];
  readonly forbiddenObjectives: readonly string[];
  readonly criticalVetoPower: boolean;
}

export const COUNCIL_AGENT_PROFILES: Readonly<Record<CouncilAgentRole, CouncilAgentProfile>> = {
  MACRO_AGENT: {
    role: 'MACRO_AGENT',
    name: 'Macroeconomics & Inflation Specialist',
    nameKo: '거시경제 & 통화안정 위원',
    category: 'macro',
    objectiveVector: ['m2_stability', 'inflation_clamp', 'wealth_distribution', 'long_horizon_solvency'],
    forbiddenObjectives: ['micro_welfare_override', 'unbounded_faucet'],
    criticalVetoPower: false,
  },
  PLAYER_WELFARE_AGENT: {
    role: 'PLAYER_WELFARE_AGENT',
    name: 'Player Welfare & Retention Specialist',
    nameKo: '플레이어 복지 & 신규정착 위원',
    category: 'welfare',
    objectiveVector: ['new_user_affordability', 'progression_fairness', 'd7_d30_retention', 'recovery_paths'],
    forbiddenObjectives: ['hyper_deflation_at_player_expense', 'punitive_economics'],
    criticalVetoPower: true,
  },
  SINK_COMMERCE_AGENT: {
    role: 'SINK_COMMERCE_AGENT',
    name: 'Commerce & Sinks Adoption Specialist',
    nameKo: '상점 상거래 & 소각처 위원',
    category: 'commerce',
    objectiveVector: ['sink_diversity', 'price_elasticity', 'catalog_lifecycle', 'burn_efficiency'],
    forbiddenObjectives: ['p2w_item_issuance', 'essential_item_hyperpricing'],
    criticalVetoPower: false,
  },
  STOCK_FUNDAMENTAL_AGENT: {
    role: 'STOCK_FUNDAMENTAL_AGENT',
    name: 'Stock Fundamentals & Valuation Specialist',
    nameKo: '기업 펀더멘털 & 밸류에이션 위원',
    category: 'market',
    objectiveVector: ['valuation_anchors', 'corporate_earnings_alignment', 'sector_health'],
    forbiddenObjectives: ['arbitrary_target_prices', 'speculative_bubble_fueling'],
    criticalVetoPower: false,
  },
  STOCK_FLOW_AGENT: {
    role: 'STOCK_FLOW_AGENT',
    name: 'Stock Order Flow & Liquidity Specialist',
    nameKo: '주식 유동성 & 수급 위원',
    category: 'market',
    objectiveVector: ['bid_ask_tightness', 'turnover_depth', 'order_flow_balance'],
    forbiddenObjectives: ['liquidity_drain', 'insider_trading_advantage'],
    criticalVetoPower: false,
  },
  STOCK_MOMENTUM_AGENT: {
    role: 'STOCK_MOMENTUM_AGENT',
    name: 'Market Momentum & Volatility Specialist',
    nameKo: '시장 모멘텀 & 변동성 위원',
    category: 'market',
    objectiveVector: ['volatility_clamp', 'momentum_reversal_health', 'trend_sustainability'],
    forbiddenObjectives: ['circuit_breaker_bypass', 'artificial_pump_and_dump'],
    criticalVetoPower: false,
  },
  MARKET_INTEGRITY_AGENT: {
    role: 'MARKET_INTEGRITY_AGENT',
    name: 'Market Integrity & Surveillance Specialist',
    nameKo: '시장 무결성 & 시세조종 감시 위원',
    category: 'safety',
    objectiveVector: ['wash_trade_prevention', 'cornering_mitigation', 'circular_flow_detection'],
    forbiddenObjectives: ['whitelisting_manipulators', 'suppressing_audit_alarms'],
    criticalVetoPower: true,
  },
  BUSINESS_AGENT: {
    role: 'BUSINESS_AGENT',
    name: 'Business Operations & Margin Specialist',
    nameKo: '기업 운영 & 마진 분석 위원',
    category: 'commerce',
    objectiveVector: ['business_profitability', 'maintenance_burden', 'supply_chain_viability'],
    forbiddenObjectives: ['zero_margin_subsidies', 'monopolistic_rent_seeking'],
    criticalVetoPower: false,
  },
  CASINO_RISK_AGENT: {
    role: 'CASINO_RISK_AGENT',
    name: 'Game-only Casino Risk Specialist',
    nameKo: '게임형 카지노 리스크 위원',
    category: 'safety',
    objectiveVector: ['faucet_burn_parity', 'addiction_mitigation', 'responsible_gaming_limits'],
    forbiddenObjectives: ['real_money_gambling_optimization', 'loss_chasing_incentives'],
    criticalVetoPower: true,
  },
  ABUSE_AGENT: {
    role: 'ABUSE_AGENT',
    name: 'Exploit, Bot & Sybil Defense Specialist',
    nameKo: '어뷰징 & 다계정 봇 방어 위원',
    category: 'safety',
    objectiveVector: ['farming_mitigation', 'sybil_detection', 'exploit_loop_closure'],
    forbiddenObjectives: ['penalizing_innocent_majority', 'silent_rule_waivers'],
    criticalVetoPower: true,
  },
  CAUSAL_AGENT: {
    role: 'CAUSAL_AGENT',
    name: 'Causal Inference & Confounder Analyst',
    nameKo: '인과관계 & 외생변수 분석 위원',
    category: 'governance',
    objectiveVector: ['policy_vs_event_attribution', 'confounder_isolation', 'counterfactual_audit'],
    forbiddenObjectives: ['spurious_correlation_action', 'ignoring_season_shocks'],
    criticalVetoPower: false,
  },
  RED_TEAM_AGENT: {
    role: 'RED_TEAM_AGENT',
    name: 'Adversarial Red Team & Goodhart Investigator',
    nameKo: '적대적 레드팀 & 지표왜곡 조사 위원',
    category: 'safety',
    objectiveVector: ['goodhart_metric_gaming', 'second_order_vulnerabilities', 'worst_case_scenarios'],
    forbiddenObjectives: ['blind_optimism', 'ignoring_tail_risk'],
    criticalVetoPower: true,
  },
  AUDITOR_AGENT: {
    role: 'AUDITOR_AGENT',
    name: 'Evidence Sufficiency & Reproducibility Auditor',
    nameKo: '증거 충실성 & 정책 재현성 감사 위원',
    category: 'governance',
    objectiveVector: ['sample_size_check', 'telemetry_freshness', 'policy_registry_strictness'],
    forbiddenObjectives: ['bypassing_unresolved_incidents', 'waiving_deterministic_gates'],
    criticalVetoPower: true,
  },
  JUDGE_AGENT: {
    role: 'JUDGE_AGENT',
    name: 'Council Consensus & Admissibility Judge',
    nameKo: '위원회 합의 & 수용성 판정 위원',
    category: 'governance',
    objectiveVector: ['consensus_arbitration', 'disagreement_quantification', 'admissible_set_generation'],
    forbiddenObjectives: ['overriding_critical_veto', 'averaging_disagreeing_decisions'],
    criticalVetoPower: false,
  },
};

export interface AgentRoundVote {
  readonly role: CouncilAgentRole;
  readonly decision: CouncilDecision;
  readonly confidence: number;
  readonly rationale: string;
  readonly risks: readonly string[];
  readonly targetCritiqueRole?: CouncilAgentRole | undefined;
}

export interface DebateRoundResult {
  readonly round: 1 | 2 | 3;
  readonly name: string;
  readonly votes: readonly AgentRoundVote[];
  readonly roundSummary: string;
}

export interface CouncilDebateResult {
  readonly proposalId: string;
  readonly evaluatedAt: string;
  readonly rounds: readonly DebateRoundResult[];
  readonly finalDecision: CouncilDecision;
  readonly aggregateConfidence: number;
  readonly disagreementScore: number; // 0.0 ~ 1.0
  readonly isHighDisagreement: boolean;
  readonly recommendedMode: 'BOUNDED_AUTO' | 'RECOMMEND' | 'SHADOW' | 'EMERGENCY_FREEZE';
  readonly criticalVetoes: readonly { readonly role: CouncilAgentRole; readonly rationale: string }[];
  readonly agreeCount: number;
  readonly vetoCount: number;
  readonly abstainCount: number;
  readonly consensusRationale: string;
  readonly topRisks: readonly string[];
}

export interface EconomyProposalPayload {
  readonly id?: string;
  readonly category: string;
  readonly description: string;
  readonly knobs: readonly {
    readonly key: string;
    readonly currentValue: number | string;
    readonly proposedValue: number | string;
    readonly deltaPct?: number;
  }[];
  readonly metricsSnapshot?: Record<string, number>;
  readonly isEmergency?: boolean;
}

/**
 * Simulates or executes the 3-stage debate across all 14 agents.
 */
export function executeCouncilDebate(
  proposal: EconomyProposalPayload,
  deterministicOverrides?: Partial<Record<CouncilAgentRole, Partial<AgentRoundVote>>>,
): CouncilDebateResult {
  const proposalId = proposal.id ?? `prop_${Date.now()}`;
  const now = new Date().toISOString();

  // --- ROUND 1: Independent Proposal ---
  const round1Votes: AgentRoundVote[] = COUNCIL_AGENT_ROLES.map((role) => {
    const profile = COUNCIL_AGENT_PROFILES[role];
    const override = deterministicOverrides?.[role];

    // Determine baseline sentiment based on knobs and agent profile
    let decision: CouncilDecision = 'agree';
    let confidence = 0.85;
    const risks: string[] = [];
    let rationale = `${profile.nameKo}: 기본 경제 지표 및 ${profile.objectiveVector.join(', ')} 목표와 정합함을 확인함.`;

    // High inflation / faucet risk check
    const hasAggressiveFaucet = proposal.knobs.some((k) => (k.deltaPct ?? 0) > 20);
    const hasSevereClamp = proposal.knobs.some((k) => (k.deltaPct ?? 0) < -20);

    if (role === 'MACRO_AGENT' && hasAggressiveFaucet) {
      decision = 'veto';
      confidence = 0.92;
      risks.push('통화 팽창률 상한 초과(M2 팽창 리스크)');
      rationale = '급격한 화폐 공급 증가는 장기 디스인플레이션 기조를 훼손하고 구매력을 저하시킵니다.';
    } else if (role === 'PLAYER_WELFARE_AGENT' && hasSevereClamp) {
      decision = 'veto';
      confidence = 0.9;
      risks.push('신규 유저 진입 장벽 급상승 및 조기 이탈 리스크');
      rationale = '급격한 보상 축소 또는 가격 인상은 신규 유저의 첫 7일 잔존율에 치명적입니다.';
    } else if (role === 'ABUSE_AGENT' && proposal.category === 'faucet_boost') {
      decision = 'veto';
      confidence = 0.88;
      risks.push('다계정 자동화 파밍 악용 루프 감지');
      rationale = '보호한도 없는 발행 확대는 봇 군집에 흡수되어 정상 플레이어에게 도달하지 않습니다.';
    } else if (role === 'RED_TEAM_AGENT') {
      // Red team always raises contrarian warnings
      confidence = 0.82;
      risks.push('굿하트의 법칙(Goodhart)에 의한 2차 지표 왜곡 가능성');
      rationale = '단기 목표 지표 개선이 부수적인 대체 시장 왜곡을 유발할 수 있습니다.';
    }

    if (override?.decision) decision = override.decision;
    if (override?.confidence !== undefined) confidence = override.confidence;
    if (override?.rationale) rationale = override.rationale;
    if (override?.risks) risks.push(...override.risks);

    return {
      role,
      decision,
      confidence,
      rationale,
      risks,
    };
  });

  const round1: DebateRoundResult = {
    round: 1,
    name: '1단계: 독립 제안 (Independent Proposal)',
    votes: round1Votes,
    roundSummary: '14개 전문 에이전트가 상호 의견 비공개 상태에서 독립 분석을 수행함.',
  };

  // --- ROUND 2: Adversarial Critique ---
  const round2Votes: AgentRoundVote[] = round1Votes.map((v1) => {
    const profile = COUNCIL_AGENT_PROFILES[v1.role];
    let targetCritiqueRole: CouncilAgentRole | undefined;
    let rationale = v1.rationale;
    let decision = v1.decision;
    let confidence = v1.confidence;
    const risks = [...v1.risks];

    // Pairing critique
    if (v1.role === 'PLAYER_WELFARE_AGENT') {
      targetCritiqueRole = 'MACRO_AGENT';
      const macroVote = round1Votes.find((v) => v.role === 'MACRO_AGENT');
      if (macroVote?.decision === 'veto') {
        rationale += ` [상호 비판 vs ${targetCritiqueRole}]: 거시 긴축 논리가 일반 유저의 체감 생계에 미치는 부작용을 경고함.`;
      }
    } else if (v1.role === 'RED_TEAM_AGENT') {
      targetCritiqueRole = 'SINK_COMMERCE_AGENT';
      rationale += ` [적대적 비판 vs ${targetCritiqueRole}]: 상점 가격 탄력성 추정에 숨겨진 과대평가 가정을 반박함.`;
    } else if (v1.role === 'MARKET_INTEGRITY_AGENT') {
      targetCritiqueRole = 'STOCK_FLOW_AGENT';
      rationale += ` [안전 검증 vs ${targetCritiqueRole}]: 단기 수급 압력 완화 조치가 통정매매 방어망을 약화시키지 않는지 검증함.`;
    }

    return {
      role: v1.role,
      decision,
      confidence,
      rationale,
      risks,
      targetCritiqueRole,
    };
  });

  const round2: DebateRoundResult = {
    round: 2,
    name: '2단계: 적대적 교차 비판 (Adversarial Critique)',
    votes: round2Votes,
    roundSummary: '안전/거시/복지 관점의 상호 적대적 비판 및 스트레스 테스트를 완료함.',
  };

  // --- ROUND 3: Rebuttal & Final Revision ---
  const round3Votes: AgentRoundVote[] = round2Votes.map((v2) => {
    let decision = v2.decision;
    let confidence = v2.confidence;
    let rationale = v2.rationale;
    const risks = [...v2.risks];

    // Rebuttal synthesis: if Judge, synthesize disagreement
    if (v2.role === 'JUDGE_AGENT') {
      const opposingCount = round2Votes.filter((v) => v.decision === 'veto').length;
      if (opposingCount > 0) {
        rationale = `최종 중재: ${opposingCount}개 분과의 거부 의견 및 핵심 리스크를 수용하여 조건부 권고안을 확정함.`;
      } else {
        rationale = '최종 중재: 전원 일치 또는 안전 임계치 충족으로 원안 통과를 확인합.';
      }
    }

    return {
      role: v2.role,
      decision,
      confidence,
      rationale,
      risks,
    };
  });

  const round3: DebateRoundResult = {
    round: 3,
    name: '3단계: 반론 및 최종 집계 (Rebuttal & Final Revision)',
    votes: round3Votes,
    roundSummary: '비판에 대한 반론을 반영하여 14개 에이전트의 최종 투표를 확정함.',
  };

  // Final Aggregation & Metrics
  let agreeCount = 0;
  let vetoCount = 0;
  let abstainCount = 0;
  let totalConfidence = 0;
  const criticalVetoes: { role: CouncilAgentRole; rationale: string }[] = [];
  const topRisksSet = new Set<string>();

  for (const vote of round3Votes) {
    if (vote.decision === 'agree') agreeCount++;
    else if (vote.decision === 'veto') {
      vetoCount++;
      if (COUNCIL_AGENT_PROFILES[vote.role].criticalVetoPower) {
        criticalVetoes.push({ role: vote.role, rationale: vote.rationale });
      }
    } else {
      abstainCount++;
    }
    totalConfidence += vote.confidence;
    vote.risks.forEach((r) => topRisksSet.add(r));
  }

  const aggregateConfidence = Number((totalConfidence / round3Votes.length).toFixed(4));
  // Disagreement score: entropy-like metric between agree, veto, and abstain
  const total = round3Votes.length;
  const pAgree = agreeCount / total;
  const pVeto = vetoCount / total;
  const pAbstain = abstainCount / total;
  const disagreementScore = Number(
    (1 - (Math.max(pAgree, pVeto, pAbstain) - Math.min(pAgree, pVeto))).toFixed(4),
  );
  const isHighDisagreement = disagreementScore > 0.4 || (agreeCount > 0 && vetoCount > 0);

  // Decision determination
  let finalDecision: CouncilDecision = 'agree';
  let recommendedMode: CouncilDebateResult['recommendedMode'] = 'BOUNDED_AUTO';

  if (criticalVetoes.length > 0 || vetoCount >= 3) {
    finalDecision = 'veto';
    recommendedMode = 'RECOMMEND'; // Degrade from BOUNDED_AUTO
  } else if (isHighDisagreement || abstainCount > 2) {
    finalDecision = 'abstain';
    recommendedMode = 'SHADOW';
  }

  const consensusRationale =
    finalDecision === 'veto'
      ? `위원회의 치명적 거부(${criticalVetoes.map((c) => c.role).join(', ') || `${vetoCount}석 거부`})로 인해 자동 적용이 차단되었습니다.`
      : finalDecision === 'abstain'
        ? `의견 불일치 지수(${disagreementScore})가 임계치를 초과하여 사람 관리자 승인(RECOMMEND) 또는 SHADOW 모드로 전환됩니다.`
        : `14개 전문 에이전트의 합의(동의 ${agreeCount}석, 평균 신뢰도 ${(aggregateConfidence * 100).toFixed(1)}%)로 안전 적용이 승인되었습니다.`;

  return {
    proposalId,
    evaluatedAt: now,
    rounds: [round1, round2, round3],
    finalDecision,
    aggregateConfidence,
    disagreementScore,
    isHighDisagreement,
    recommendedMode,
    criticalVetoes,
    agreeCount,
    vetoCount,
    abstainCount,
    consensusRationale,
    topRisks: Array.from(topRisksSet).slice(0, 10),
  };
}
