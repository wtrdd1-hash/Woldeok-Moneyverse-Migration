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
  welfare: '복지/소비',
  integrity: '데이터 무결성',
  casino: '카지노',
  bank: '은행',
  market: '시장',
  stock: '주식',
  shop: '상점',
};

function number(value: string | number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  return parsed.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function runTimestamp(run?: SchedulerRun | null): string {
  const ts = run?.finished_at || run?.started_at;
  if (!ts) return '실행 시각 없음';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return '실행 시각 없음';
  
  const utcMs = date.getTime();
  const kstMs = utcMs + 9 * 60 * 60 * 1000;
  const kstDate = new Date(kstMs);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();
  const hour = kstDate.getUTCHours();
  const minute = kstDate.getUTCMinutes();
  const second = kstDate.getUTCSeconds();
  return `${year}. ${month}. ${day}. ${hour}시 ${minute}분 ${second}초`;
}

function RunItem({ label, run }: { readonly label: string; readonly run?: SchedulerRun | null | undefined }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/60 p-2.5 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs text-muted-foreground truncate">{label}</span>
        <Badge variant={run?.status === 'completed' || run?.status === 'succeeded' || run?.status === 'success' ? 'outline' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
          {run?.status ?? '미실행'}
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
      <div className="flex min-w-0 items-start justify-between gap-2">
        <strong className="min-w-0 font-bold [overflow-wrap:anywhere]">
          {domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'} · {agent.seat ?? '—'}
        </strong>
        <Badge variant="outline" className="shrink-0">{source}</Badge>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground [overflow-wrap:anywhere]" title={agent.model ?? undefined}>
        {agent.model ?? '—'}
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-xs min-[360px]:grid-cols-2">
        <div className="min-w-0"><dt className="text-muted-foreground">검토 표본</dt><dd className="font-semibold">{number(agent.review_count)}건</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground">동의/거부/보류</dt><dd className="font-semibold [overflow-wrap:anywhere]">{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</dd></div>
        <div className="min-w-0">
          <dt className="text-muted-foreground" title="각 모델 리뷰가 반환한 confidence(0~1)의 산술 평균이며 정책 적용 가능 여부와는 별개입니다.">평균 모델 confidence</dt>
          <dd className="font-semibold">{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</dd>
        </div>
        <div className="min-w-0"><dt className="text-muted-foreground">평균 지연</dt><dd className="font-semibold">{number(agent.avg_latency_ms, 1)} ms</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground">평균 토큰</dt><dd className="font-semibold">{number(agent.avg_total_tokens, 1)}</dd></div>
        <div className="min-w-0"><dt className="text-muted-foreground">근거 모드</dt><dd className="font-semibold">{source}</dd></div>
      </dl>
    </div>
  );
}

function CouncilRationaleBanner({ rationale }: { readonly rationale: string }) {
  const isStructured = rationale.includes('council decision=');
  if (!isStructured) {
    return (
      <p className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs sm:text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:keep-all] shadow-sm">
        {rationale}
      </p>
    );
  }

  const decisionMatch = rationale.match(/council decision=([^;]+)/);
  const agreeMatch = rationale.match(/agree=([^;]+)/);
  const vetoMatch = rationale.match(/veto=([^;]+)/);
  const disputedMatch = rationale.match(/disputed=([^;]+)/);

  const decision = decisionMatch?.[1]?.trim() ?? 'abstain';
  const agreeList = agreeMatch?.[1]?.trim() === 'none' ? [] : (agreeMatch?.[1]?.split(',') ?? []);
  const vetoList = vetoMatch?.[1]?.trim() === 'none' ? [] : (vetoMatch?.[1]?.split(',') ?? []);
  const disputedList = disputedMatch?.[1]?.trim() === 'none' ? [] : (disputedMatch?.[1]?.split(',') ?? []);

  const decisionBadgeVariant = decision === 'agree' ? 'default' : decision === 'veto' ? 'destructive' : 'secondary';
  const decisionText = decision === 'agree' ? '만장일치 합의 (적용 승인)' : decision === 'veto' ? '거부 (위험 감지 - VETO)' : '보류 (위원 간 의견 조율 중)';

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm shadow-sm space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">🏛️ 위원회 최종 의결 판정:</span>
          <Badge variant={decisionBadgeVariant} className="font-semibold text-xs">
            {decisionText}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Bicameral Dual-AI Verification
        </span>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground shrink-0">✅ 합의 분야:</span>
          <span className="font-medium text-foreground">
            {agreeList.length > 0 ? agreeList.map((d) => domainLabel[d] ?? d).join(', ') : '없음'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground shrink-0">🛑 거부(VETO):</span>
          <span className="font-medium text-destructive">
            {vetoList.length > 0 ? vetoList.map((d) => domainLabel[d] ?? d).join(', ') : '없음'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground shrink-0">⚖️ 이견/조율:</span>
          <span className="font-medium text-foreground">
            {disputedList.length > 0 ? disputedList.map((d) => domainLabel[d] ?? d).join(', ') : '없음'}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground pt-1 border-t border-primary/10 font-mono truncate" title={rationale}>
        원문: {rationale}
      </p>
    </div>
  );
}

export function EconomyAiStatusCard({ status }: { readonly status: EconomyAiStatus | null }) {
  const op = status?.operationalState ?? 'unknown';
  const label = stateLabel[op] ?? op;
  const proposal = status?.proposalState;
  const days = proposal?.sampleSufficientDays ?? proposal?.days ?? null;
  const activeMembers = proposal?.activeMemberCount ?? null;
  const minActive = proposal?.minimumActiveSample ?? null;
  const hasShadow = (status?.shadowAgents?.length ?? 0) > 0;
  const displayedAgents = hasShadow ? (status?.shadowAgents ?? []) : (status?.agents ?? []);
  const agentSource = hasShadow ? 'SHADOW' : 'AUTHORITATIVE';
  const latest = hasShadow ? status?.latestShadowReview : status?.latestReview;

  return (
    <Card className="shadow-sm">
      <CardHeader className="min-w-0">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <CardTitle className="min-w-0 text-base font-bold [overflow-wrap:anywhere]">🏛️ AI 경제 정책 위원회 (AI Council)</CardTitle>
            <Badge variant={status?.modelReachability === 'healthy' ? 'default' : 'outline'} className="shrink-0 text-[11px]">
              {status?.modelReachability === 'healthy' ? '모델 도달 정상' : '모델 상태 확인'}
            </Badge>
          </div>
          <Badge variant={op === 'active_authoritative' ? 'default' : 'secondary'} className="w-fit shrink-0 text-xs font-semibold">
            {label}
          </Badge>
        </div>
        <CardDescription className="leading-relaxed [overflow-wrap:anywhere] [word-break:keep-all]">
          결정론적 규칙 엔진의 정책 조정안을 듀얼 로컬 AI(Llama 3.2 3B &amp; Gemma 3 1B) 위원회가 4대 도메인(무결성·직업·거시경제·복지)별로 교차 심의합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs shadow-xs min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-muted-foreground truncate">경제 데이터 표본 충족</span>
              <Badge variant={days != null && days >= 7 ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                {days != null && days >= 7 ? '충족' : '수집 중'}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm font-bold truncate text-foreground">
              {days != null ? `${number(days)} / 7` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">최근 7일 지표 연속 수집 기준</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs shadow-xs min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-muted-foreground truncate">활성 유저 활동 표본</span>
              <Badge variant={activeMembers != null && minActive != null && activeMembers >= minActive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                {activeMembers != null && minActive != null && activeMembers >= minActive ? '표본 정상' : '누적 필요'}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm font-bold truncate text-foreground">
              {activeMembers != null && minActive != null ? `${number(activeMembers)} / ${number(minActive)}` : number(activeMembers)}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">최근 24시간 활동 회원 수</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs shadow-xs min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-muted-foreground truncate">정책 조정 후보 안건</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {proposal?.eligible === true ? '적용 검토 가능' : '규칙 분석'}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm font-bold truncate text-foreground">{proposal?.adjustmentCount ?? 0} 건</p>
            <p className="text-[11px] text-muted-foreground truncate">결정론적 후보 수치</p>
          </div>
        </div>

        {proposal?.blockedBy && proposal.blockedBy.length > 0 ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
            <p className="font-semibold">정책 적용 차단 요인:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {proposal.blockedBy.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">주기적 데몬 실행 이력</h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <RunItem label="권위 정책 심의" run={status?.lastRuns?.authoritativeReview} />
            <RunItem label="SHADOW 건전성 검증" run={status?.lastRuns?.shadowHealth} />
            <RunItem label="자동 정책 튜닝" run={status?.lastRuns?.autoPolicy} />
          </div>
        </div>

        {latest?.rationale ? (
          <CouncilRationaleBanner rationale={latest.rationale} />
        ) : null}

        {displayedAgents.length > 0 ? (
          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px] leading-relaxed text-muted-foreground [word-break:keep-all]">
            평균 모델 confidence는 각 모델 리뷰가 반환한 0~1 confidence의 산술 평균입니다. 검토 표본 수와 함께 해석하며,
            정책 적용 가능 여부·데이터 충분성·위원회 합의 여부를 뜻하지 않습니다.
          </p>
        ) : null}

        <div className="grid gap-2 sm:hidden">
          {displayedAgents.map((agent, index) => (
            <AgentCard key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`} agent={agent} source={agentSource} />
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2">분야</th>
                <th>좌석</th>
                <th>모델</th>
                <th>검토 표본</th>
                <th>동의/거부/보류</th>
                <th title="각 모델 리뷰가 반환한 confidence(0~1)의 산술 평균">평균 모델 confidence</th>
                <th>평균 지연 ms</th>
                <th>평균 토큰</th>
                <th>근거 모드</th>
              </tr>
            </thead>
            <tbody>
              {displayedAgents.map((agent, index) => (
                <tr className="border-b hover:bg-muted/10 transition-colors" key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`}>
                  <td className="py-2 font-medium">{domainLabel[agent.domain ?? ''] ?? agent.domain ?? '—'}</td>
                  <td className="font-mono text-xs">{agent.seat ?? '—'}</td>
                  <td className="max-w-48 truncate font-mono text-xs text-muted-foreground" title={agent.model ?? undefined}>{agent.model ?? '—'}</td>
                  <td>{number(agent.review_count)}</td>
                  <td className="font-mono text-xs font-semibold">{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</td>
                  <td className="font-mono text-xs">{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</td>
                  <td className="font-mono text-xs">{number(agent.avg_latency_ms, 1)}</td>
                  <td className="font-mono text-xs">{number(agent.avg_total_tokens, 1)}</td>
                  <td><Badge variant="outline" className="text-[10px]">{agentSource}</Badge></td>
                </tr>
              ))}
            </tbody>
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
