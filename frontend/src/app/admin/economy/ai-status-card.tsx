import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SchedulerRun {
  readonly status?: string | null;
  readonly period_key?: string | null;
  readonly started_at?: string | null;
  readonly finished_at?: string | null;
}

interface AgentStatus {
  readonly domain?: string | null;
  readonly seat?: string | null;
  readonly model?: string | null;
  readonly review_count?: number | null;
  readonly agree_count?: number | null;
  readonly veto_count?: number | null;
  readonly abstain_count?: number | null;
  readonly avg_confidence?: number | null;
  readonly avg_latency_ms?: number | null;
  readonly avg_total_tokens?: number | null;
}

interface ProposalState {
  readonly eligible?: boolean | null;
  readonly blockedBy?: readonly string[];
  readonly adjustmentCount?: number | null;
  readonly activeMemberCount?: number | null;
  readonly minimumActiveSample?: number | null;
  readonly sampleSufficientDays?: number | null;
  readonly days?: number | null;
}

interface ReviewSummary {
  readonly decision?: string | null;
  readonly rationale?: string | null;
}

export interface EconomyAiStatus {
  readonly switchState?: string | null;
  readonly autoPolicySwitchState?: string | null;
  readonly jobLimitTighteningSwitchState?: string | null;
  readonly operationalState?: string | null;
  readonly modelReachability?: 'healthy' | 'degraded' | 'unknown' | null;
  readonly reviewCount?: number | null;
  readonly shadowReviewCount?: number | null;
  readonly proposalState?: ProposalState | null;
  readonly lastRuns?: {
    readonly authoritativeReview?: SchedulerRun | null;
    readonly shadowHealth?: SchedulerRun | null;
    readonly autoPolicy?: SchedulerRun | null;
  } | null;
  readonly latestReview?: ReviewSummary | null;
  readonly latestShadowReview?: ReviewSummary | null;
  readonly agents?: readonly AgentStatus[];
  readonly shadowAgents?: readonly AgentStatus[];
}

const stateLabel: Record<string, string> = {
  active_authoritative: '권위 정책 검토 활성',
  active_shadow_only: 'SHADOW 검증 진행 중',
  blocked_by_evidence: '근거 부족 · 정책 차단',
  configured_not_exercised: '설정됨 · 미검증',
  disabled: '비활성화',
  failed: '오류 발생',
};

const domainLabel: Record<string, string> = {
  jobs: '직업',
  macro: '거시경제',
  casino: '카지노',
  bank: '은행',
  market: '시장',
};

function number(value: string | number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toLocaleString('ko-KR', { maximumFractionDigits: digits })
    : '—';
}

function runTimestamp(run: SchedulerRun | null | undefined): string {
  const raw = run?.finished_at ?? run?.started_at;
  if (!raw) return '실행 시각 없음';
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) return '실행 시각 오류';
  return value.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });
}

function RunState({ title, run }: { readonly title: string; readonly run: SchedulerRun | null | undefined }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 min-w-0 shadow-sm flex flex-col justify-between gap-1.5">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-semibold text-muted-foreground truncate">{title}</span>
        <Badge variant={run?.status === 'failed' ? 'destructive' : 'outline'} className="shrink-0 text-[11px] px-2 py-0.5">
          {run?.status ?? '기록 없음'}
        </Badge>
      </div>
      <p className="font-mono text-xs font-medium truncate text-foreground/90">{run?.period_key ?? '—'}</p>
      <p className="text-[11px] text-muted-foreground truncate">최근 실행 {runTimestamp(run)}</p>
    </div>
  );
}

function AgentCard({ agent, source }: { readonly agent: AgentStatus; readonly source: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-sm min-w-0 shadow-sm">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <strong className="truncate font-bold">{domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'} · {agent.seat ?? '—'}</strong>
        <Badge variant="outline" className="shrink-0">{source}</Badge>
      </div>
      <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={agent.model ?? undefined}>
        {agent.model ?? '—'}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="min-w-0"><dt className="text-muted-foreground truncate">검토</dt><dd className="font-semibold">{number(agent.review_count)}</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground truncate">동의/거부/보류</dt><dd className="font-semibold truncate">{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground truncate">평균 신뢰</dt><dd className="font-semibold">{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground truncate">지연</dt><dd className="font-semibold">{number(agent.avg_latency_ms, 1)} ms</dd></div>
      </dl>
    </div>
  );
}

export function EconomyAiStatusCard({ status }: { readonly status: EconomyAiStatus }) {
  const latest = status.latestReview ?? status.latestShadowReview;
  const decision = latest?.decision ?? 'none';
  const authorityAgents = status.agents ?? [];
  const shadowAgents = status.shadowAgents ?? [];
  const displayedAgents = authorityAgents.length > 0 ? authorityAgents : shadowAgents;
  const agentSource = authorityAgents.length > 0 ? '권위' : 'SHADOW';
  const proposal = status.proposalState;
  const blockedBy = proposal?.blockedBy ?? [];
  const operationalState = status.operationalState ?? (
    status.switchState === 'enabled' ? 'configured_not_exercised' : 'disabled'
  );
  const modelReachability = status.modelReachability ?? 'unknown';

  return (
    <Card className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border-border/80 shadow-sm">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg font-black tracking-tight">Economy AI Council 상태</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={operationalState === 'failed' ? 'destructive' : 'secondary'} className="text-xs px-2.5 py-0.5">
              {stateLabel[operationalState] ?? operationalState}
            </Badge>
            <Badge variant={modelReachability === 'degraded' ? 'destructive' : 'outline'} className="text-xs px-2.5 py-0.5">
              모델 {modelReachability === 'healthy' ? '도달 정상' : modelReachability === 'degraded' ? '일부 실패' : '미확인'}
            </Badge>
            <Badge variant={decision === 'veto' ? 'destructive' : 'outline'} className="text-xs px-2.5 py-0.5">{decision.toUpperCase()}</Badge>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed [overflow-wrap:anywhere] [word-break:keep-all] mt-1">
          모델 연결, SHADOW 검증, 권위 정책 검토와 실제 자동 적용은 서로 다른 상태로 표시합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 sm:p-6 pt-0">
        <dl className="grid grid-cols-2 gap-2 text-xs sm:text-sm sm:grid-cols-2 xl:grid-cols-4 min-w-0 rounded-xl bg-muted/20 p-3 border border-border/40">
          <div className="min-w-0"><dt className="text-muted-foreground text-xs truncate">권위 council review</dt><dd className="font-bold text-sm sm:text-base mt-0.5">{number(status.reviewCount)}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground text-xs truncate">SHADOW review</dt><dd className="font-bold text-sm sm:text-base mt-0.5">{number(status.shadowReviewCount)}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground text-xs truncate">활성 사용자 / 최소 표본</dt><dd className="font-bold text-sm sm:text-base mt-0.5">{number(proposal?.activeMemberCount)} / {number(proposal?.minimumActiveSample)}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground text-xs truncate">충분 표본 일수</dt><dd className="font-bold text-sm sm:text-base mt-0.5">{number(proposal?.sampleSufficientDays)} / {number(proposal?.days)}</dd></div>
        </dl>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 min-w-0">
          <RunState title="권위 AI 주간 검토" run={status.lastRuns?.authoritativeReview} />
          <RunState title="AI SHADOW 일일 검증" run={status.lastRuns?.shadowHealth} />
          <RunState title="자동 정책 적용" run={status.lastRuns?.autoPolicy} />
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs sm:text-sm min-w-0 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
            <strong className="font-bold truncate">현재 결정론 proposal</strong>
            <Badge variant={proposal?.eligible ? 'secondary' : 'outline'} className="text-xs shrink-0">
              {proposal?.eligible ? '적용 검토 가능' : '정책 적용 차단'}
            </Badge>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground [overflow-wrap:anywhere] [word-break:keep-all]">
            후보 조정 {number(proposal?.adjustmentCount)}건 · 직업 제한 강화 switch {status.jobLimitTighteningSwitchState ?? 'unknown'}
          </p>
          {blockedBy.length > 0 ? (
            <div className="mt-2 grid gap-1 min-w-0">
              {blockedBy.map((reason, index) => (
                <p key={`${reason}-${index}`} className="rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 px-2.5 py-1 text-xs [overflow-wrap:anywhere] [word-break:keep-all]">{reason}</p>
              ))}
            </div>
          ) : null}
        </div>

        {latest?.rationale ? (
          <p className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs sm:text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:keep-all] shadow-sm">
            {latest.rationale}
          </p>
        ) : null}

        <div className="grid gap-2 sm:hidden">
          {displayedAgents.map((agent, index) => (
            <AgentCard key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`} agent={agent} source={agentSource} />
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">분야</th><th>좌석</th><th>모델</th><th>검토</th><th>동의/거부/보류</th><th>평균 신뢰</th><th>지연 ms</th><th>토큰</th><th>근거</th></tr></thead>
            <tbody>{displayedAgents.map((agent, index) => <tr className="border-b" key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`}><td className="py-2">{domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'}</td><td>{agent.seat ?? '—'}</td><td className="max-w-48 truncate font-mono text-xs" title={agent.model ?? undefined}>{agent.model ?? '—'}</td><td>{number(agent.review_count)}</td><td>{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</td><td>{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</td><td>{number(agent.avg_latency_ms, 1)}</td><td>{number(agent.avg_total_tokens, 1)}</td><td>{agentSource}</td></tr>)}</tbody>
          </table>
        </div>
        {displayedAgents.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-2 [overflow-wrap:anywhere] [word-break:keep-all]">
            아직 모델 검토 증거가 없습니다. switch가 켜져 있어도 이 상태를 실제 AI 작동으로 간주하지 않습니다.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
