'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface CouncilAgentVote {
  readonly role: string;
  readonly decision: 'agree' | 'veto' | 'abstain';
  readonly confidence: number;
  readonly rationale: string;
  readonly risks: readonly string[];
  readonly targetCritiqueRole?: string;
}

export interface DebateRound {
  readonly round: 1 | 2 | 3;
  readonly name: string;
  readonly votes: readonly CouncilAgentVote[];
  readonly roundSummary: string;
}

export interface CouncilDebateData {
  readonly proposalId: string;
  readonly evaluatedAt: string;
  readonly rounds: readonly DebateRound[];
  readonly finalDecision: 'agree' | 'veto' | 'abstain';
  readonly aggregateConfidence: number;
  readonly disagreementScore: number;
  readonly isHighDisagreement: boolean;
  readonly recommendedMode: 'BOUNDED_AUTO' | 'RECOMMEND' | 'SHADOW' | 'EMERGENCY_FREEZE';
  readonly criticalVetoes: readonly { readonly role: string; readonly rationale: string }[];
  readonly agreeCount: number;
  readonly vetoCount: number;
  readonly abstainCount: number;
  readonly consensusRationale: string;
  readonly topRisks: readonly string[];
}

const roleNamesKo: Record<string, string> = {
  MACRO_AGENT: '거시경제 & 통화안정',
  PLAYER_WELFARE_AGENT: '플레이어 복지 & 신규정착',
  SINK_COMMERCE_AGENT: '상점 상거래 & 소각처',
  STOCK_FUNDAMENTAL_AGENT: '기업 펀더멘털 & 밸류에이션',
  STOCK_FLOW_AGENT: '주식 유동성 & 수급',
  STOCK_MOMENTUM_AGENT: '시장 모멘텀 & 변동성',
  MARKET_INTEGRITY_AGENT: '시장 무결성 & 시세조종 감시',
  BUSINESS_AGENT: '기업 운영 & 마진 분석',
  CASINO_RISK_AGENT: '게임형 카지노 리스크',
  ABUSE_AGENT: '어뷰징 & 다계정 봇 방어',
  CAUSAL_AGENT: '인과관계 & 외생변수 분석',
  RED_TEAM_AGENT: '적대적 레드팀 & 지표왜곡 조사',
  AUDITOR_AGENT: '증거 충실성 & 정책 재현성 감사',
  JUDGE_AGENT: '위원회 합의 & 수용성 판정',
};

const categoryBadges: Record<string, { label: string; color: string }> = {
  MACRO_AGENT: { label: '거시', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PLAYER_WELFARE_AGENT: { label: '복지', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  SINK_COMMERCE_AGENT: { label: '상거래', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  STOCK_FUNDAMENTAL_AGENT: { label: '증시', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  STOCK_FLOW_AGENT: { label: '수급', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  STOCK_MOMENTUM_AGENT: { label: '모멘텀', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  MARKET_INTEGRITY_AGENT: { label: '안전', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  BUSINESS_AGENT: { label: '기업', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  CASINO_RISK_AGENT: { label: '안전', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  ABUSE_AGENT: { label: '안전', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  CAUSAL_AGENT: { label: '거버넌스', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  RED_TEAM_AGENT: { label: '레드팀', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  AUDITOR_AGENT: { label: '감사', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  JUDGE_AGENT: { label: '판정', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
};

export function CouncilDebateCard({ initialData }: { readonly initialData?: CouncilDebateData }) {
  const [selectedRound, setSelectedRound] = useState<1 | 2 | 3>(3);
  const data = initialData ?? fallbackData;

  const currentRound = data.rounds.find((r) => r.round === selectedRound) ?? data.rounds[0];

  const modeBadgeColor =
    data.recommendedMode === 'BOUNDED_AUTO'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : data.recommendedMode === 'RECOMMEND'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  return (
    <Card className="border border-border/80 bg-background/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                14인 적대적 AI 경제 위원회 (Multi-Agent Council)
              </CardTitle>
              <Badge variant="outline" className={`font-mono text-xs ${modeBadgeColor}`}>
                {data.recommendedMode}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md §25 · 3단계 적대적 토론 및 가중치 합의 엔진
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">불일치 지수:</span>
            <span className={`font-mono font-bold ${data.isHighDisagreement ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(data.disagreementScore * 100).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-mono text-muted-foreground">신뢰도:</span>
            <span className="font-mono font-bold text-foreground">
              {(data.aggregateConfidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consensus / Veto Banner */}
        <div
          className={`rounded-lg border p-3 text-xs leading-relaxed ${
            data.finalDecision === 'veto'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : data.finalDecision === 'abstain'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>판정 결과: {data.finalDecision === 'agree' ? '가결 (Agree)' : data.finalDecision === 'veto' ? '부결 (Veto)' : '보류 (Abstain)'}</span>
            <span className="text-muted-foreground font-mono">
              (동의 {data.agreeCount}석 · 거부 {data.vetoCount}석 · 기권 {data.abstainCount}석)
            </span>
          </div>
          <p className="mt-1 text-foreground/90">{data.consensusRationale}</p>
        </div>

        {/* 3-Round Step Navigation */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <span className="text-xs font-semibold text-muted-foreground">토론 단계 (Debate Rounds)</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={selectedRound === r ? 'default' : 'outline'}
                onClick={() => setSelectedRound(r as 1 | 2 | 3)}
                className="h-7 text-xs px-2.5"
              >
                {r}단계 {r === 1 ? '독립 제안' : r === 2 ? '적대적 비판' : '반론·최종 집계'}
              </Button>
            ))}
          </div>
        </div>

        {/* Round Summary */}
        <p className="text-xs text-muted-foreground italic">
          {currentRound?.roundSummary}
        </p>

        {/* 14 Agent Votes Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {currentRound?.votes.map((vote) => {
            const badge = categoryBadges[vote.role] ?? { label: '기타', color: 'bg-zinc-500/10' };
            const decisionColor =
              vote.decision === 'agree'
                ? 'text-emerald-400 border-emerald-500/30'
                : vote.decision === 'veto'
                  ? 'text-rose-400 border-rose-500/30'
                  : 'text-amber-400 border-amber-500/30';

            return (
              <div
                key={vote.role}
                className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${badge.color}`}>
                      {badge.label}
                    </Badge>
                    <span className="font-semibold text-foreground truncate">
                      {roleNamesKo[vote.role] ?? vote.role}
                    </span>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 h-4 uppercase ${decisionColor}`}>
                    {vote.decision}
                  </Badge>
                </div>

                <p className="mt-1.5 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {vote.rationale}
                </p>

                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground border-t border-border/30 pt-1.5">
                  <span>신뢰도 {(vote.confidence * 100).toFixed(0)}%</span>
                  {vote.risks.length > 0 && (
                    <span className="text-rose-400 truncate max-w-[140px]" title={vote.risks[0]}>
                      ⚠️ {vote.risks[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const fallbackData: CouncilDebateData = {
  proposalId: 'prop_fallback_01',
  evaluatedAt: new Date().toISOString(),
  rounds: [
    {
      round: 1,
      name: '1단계: 독립 제안',
      roundSummary: '14개 전문 에이전트의 독립적 제안 산출 완료.',
      votes: Object.keys(roleNamesKo).map((role) => ({
        role,
        decision: 'agree',
        confidence: 0.88,
        rationale: `${roleNamesKo[role]}: 기본 정책 정합성 및 위험 임계치 통과를 확인하였습니다.`,
        risks: [],
      })),
    },
    {
      round: 2,
      name: '2단계: 적대적 교차 비판',
      roundSummary: '상호 적대적 비판 및 스트레스 테스트 진행 완료.',
      votes: Object.keys(roleNamesKo).map((role) => ({
        role,
        decision: 'agree',
        confidence: 0.86,
        rationale: `${roleNamesKo[role]}: 상호 교차 비판을 통해 2차 파급 효과를 검증하였습니다.`,
        risks: [],
      })),
    },
    {
      round: 3,
      name: '3단계: 반론 및 최종 집계',
      roundSummary: '최종 반론 반영 및 정족수 집계 완료.',
      votes: Object.keys(roleNamesKo).map((role) => ({
        role,
        decision: 'agree',
        confidence: 0.89,
        rationale: `${roleNamesKo[role]}: 최종 투표 확정 및 정책 적용 지지.`,
        risks: [],
      })),
    },
  ],
  finalDecision: 'agree',
  aggregateConfidence: 0.89,
  disagreementScore: 0.08,
  isHighDisagreement: false,
  recommendedMode: 'BOUNDED_AUTO',
  criticalVetoes: [],
  agreeCount: 14,
  vetoCount: 0,
  abstainCount: 0,
  consensusRationale: '14개 전문 에이전트 전원 합의로 안전 정책 적용이 승인되었습니다.',
  topRisks: [],
};
