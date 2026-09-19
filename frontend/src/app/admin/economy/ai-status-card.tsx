import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AgentStatus {
  readonly domain?: string;
  readonly seat?: string;
  readonly model?: string;
  readonly review_count?: string | number;
  readonly agree_count?: string | number;
  readonly veto_count?: string | number;
  readonly abstain_count?: string | number;
  readonly avg_confidence?: string | number | null;
  readonly avg_latency_ms?: string | number | null;
  readonly avg_total_tokens?: string | number | null;
  readonly last_reviewed_at?: string | null;
}

interface ReviewSummary {
  readonly decision?: string;
  readonly confidence?: string | number;
  readonly rationale?: string;
  readonly risks?: readonly string[];
  readonly model?: string;
  readonly prompt_version?: string;
  readonly reviewed_at?: string;
  readonly expires_at?: string;
}

interface SchedulerRun {
  readonly job?: string;
  readonly period_key?: string;
  readonly status?: string;
  readonly started_at?: string;
  readonly finished_at?: string | null;
  readonly detail?: Record<string, unknown>;
}

export interface EconomyAiStatus {
  readonly switchState?: string;
  readonly autoPolicySwitchState?: string;
  readonly jobLimitTighteningSwitchState?: string;
  readonly operationalState?: string;
  readonly modelReachability?: string;
  readonly reviewCount?: number;
  readonly shadowReviewCount?: number;
  readonly latestReview?: ReviewSummary | null;
  readonly latestShadowReview?: ReviewSummary | null;
  readonly proposalState?: {
    readonly eligible?: boolean;
    readonly blockedBy?: readonly string[];
    readonly adjustmentCount?: number;
    readonly activeMemberCount?: number;
    readonly minimumActiveSample?: number;
    readonly sampleSufficientDays?: number;
    readonly days?: number;
  };
  readonly lastRuns?: {
    readonly authoritativeReview?: SchedulerRun | null;
    readonly shadowHealth?: SchedulerRun | null;
    readonly autoPolicy?: SchedulerRun | null;
  };
  readonly agents?: readonly AgentStatus[];
  readonly shadowAgents?: readonly AgentStatus[];
}

const domainLabel: Record<string, string> = {
  macro: '거시경제',
  shop: '상점·가격',
  stock: '주식시장',
  jobs: '직업·보상',
  welfare: '사용자 복지',
  integrity: '무결성·악용',
};

const stateLabel: Record<string, string> = {
  disabled: 'AI 비활성',
  configured_not_exercised: '설정됨 · 미검증',
  blocked_by_evidence: '근거 부족 · 정책 차단',
  active_reviewed: '권위 검토 완료',
  shadow_reviewed: 'SHADOW 검증 완료',
  stale: '검증 오래됨',
  failed: '검증 실패',
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
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        <Badge variant={run?.status === 'failed' ? 'destructive' : 'outline'}>
          {run?.status ?? '기록 없음'}
        </Badge>
      </div>
      <p className="mt-1 font-mono text-xs">{run?.period_key ?? '—'}</p>
      <p className="mt-1 text-xs text-muted-foreground">최근 실행 {runTimestamp(run)}</p>
    </div>
  );
}

function AgentCard({ agent, source }: { readonly agent: AgentStatus; readonly source: string }) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <strong>{domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'} · {agent.seat ?? '—'}</strong>
        <Badge variant="outline">{source}</Badge>
      </div>
      <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={agent.model}>
        {agent.model ?? '—'}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-muted-foreground">검토</dt><dd>{number(agent.review_count)}</dd></div>
        <div><dt className="text-muted-foreground">동의/거부/보류</dt><dd>{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</dd></div>
        <div><dt className="text-muted-foreground">평균 신뢰</dt><dd>{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</dd></div>
        <div><dt className="text-muted-foreground">지연</dt><dd>{number(agent.avg_latency_ms, 1)} ms</dd></div>
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
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Economy AI Council 상태</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant={operationalState === 'failed' ? 'destructive' : 'secondary'}>
              {stateLabel[operationalState] ?? operationalState}
            </Badge>
            <Badge variant={modelReachability === 'degraded' ? 'destructive' : 'outline'}>
              모델 {modelReachability === 'healthy' ? '도달 정상' : modelReachability === 'degraded' ? '일부 실패' : '미확인'}
            </Badge>
            <Badge variant={decision === 'veto' ? 'destructive' : 'outline'}>{decision.toUpperCase()}</Badge>
          </div>
        </div>
        <CardDescription>
          모델 연결, SHADOW 검증, 권위 정책 검토와 실제 자동 적용은 서로 다른 상태로 표시합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div><dt className="text-muted-foreground">권위 council review</dt><dd className="font-semibold">{number(status.reviewCount)}</dd></div>
          <div><dt className="text-muted-foreground">SHADOW review</dt><dd className="font-semibold">{number(status.shadowReviewCount)}</dd></div>
          <div><dt className="text-muted-foreground">활성 사용자 / 최소 표본</dt><dd className="font-semibold">{number(proposal?.activeMemberCount)} / {number(proposal?.minimumActiveSample)}</dd></div>
          <div><dt className="text-muted-foreground">충분 표본 일수</dt><dd className="font-semibold">{number(proposal?.sampleSufficientDays)} / {number(proposal?.days)}</dd></div>
        </dl>

        <div className="grid gap-2 sm:grid-cols-3">
          <RunState title="권위 AI 주간 검토" run={status.lastRuns?.authoritativeReview} />
          <RunState title="AI SHADOW 일일 검증" run={status.lastRuns?.shadowHealth} />
          <RunState title="자동 정책 적용" run={status.lastRuns?.autoPolicy} />
        </div>

        <div className="rounded-md border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>현재 결정론 proposal</strong>
            <Badge variant={proposal?.eligible ? 'secondary' : 'outline'}>
              {proposal?.eligible ? '적용 검토 가능' : '정책 적용 차단'}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            후보 조정 {number(proposal?.adjustmentCount)}건 · 직업 제한 강화 switch {status.jobLimitTighteningSwitchState ?? 'unknown'}
          </p>
          {blockedBy.length > 0 ? (
            <div className="mt-2 grid gap-1">
              {blockedBy.map((reason, index) => (
                <p key={`${reason}-${index}`} className="rounded bg-muted/40 px-2 py-1 text-xs">{reason}</p>
              ))}
            </div>
          ) : null}
        </div>

        {latest?.rationale ? <p className="rounded-md border bg-muted/30 p-3 text-sm">{latest.rationale}</p> : null}

        <div className="grid gap-2 sm:hidden">
          {displayedAgents.map((agent, index) => (
            <AgentCard key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`} agent={agent} source={agentSource} />
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">분야</th><th>좌석</th><th>모델</th><th>검토</th><th>동의/거부/보류</th><th>평균 신뢰</th><th>지연 ms</th><th>토큰</th><th>근거</th></tr></thead>
            <tbody>{displayedAgents.map((agent, index) => <tr className="border-b" key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`}><td className="py-2">{domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'}</td><td>{agent.seat ?? '—'}</td><td className="max-w-48 truncate font-mono text-xs" title={agent.model}>{agent.model ?? '—'}</td><td>{number(agent.review_count)}</td><td>{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</td><td>{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</td><td>{number(agent.avg_latency_ms, 1)}</td><td>{number(agent.avg_total_tokens, 1)}</td><td>{agentSource}</td></tr>)}</tbody>
          </table>
        </div>
        {displayedAgents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 모델 검토 증거가 없습니다. switch가 켜져 있어도 이 상태를 실제 AI 작동으로 간주하지 않습니다.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
