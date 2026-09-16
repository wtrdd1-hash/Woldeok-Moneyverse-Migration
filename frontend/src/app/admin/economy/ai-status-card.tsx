import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface EconomyAiStatus {
  readonly switchState?: string;
  readonly reviewCount?: number;
  readonly latestReview?: {
    readonly decision?: string;
    readonly confidence?: string | number;
    readonly rationale?: string;
    readonly risks?: readonly string[];
    readonly model?: string;
    readonly prompt_version?: string;
    readonly reviewed_at?: string;
    readonly expires_at?: string;
  } | null;
  readonly agents?: readonly {
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
  }[];
}

const label: Record<string, string> = {
  macro: '거시경제', shop: '상점·가격', stock: '주식시장', jobs: '직업·보상', welfare: '사용자 복지', integrity: '무결성·악용',
};

function number(value: string | number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('ko-KR', { maximumFractionDigits: digits }) : '—';
}

export function EconomyAiStatusCard({ status }: { readonly status: EconomyAiStatus }) {
  const latest = status.latestReview;
  const decision = latest?.decision ?? 'none';
  const enabled = status.switchState === 'enabled';
  return <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">Economy AI Council 상태</CardTitle>
        <div className="flex gap-2"><Badge variant={enabled ? 'secondary' : 'outline'}>{enabled ? 'AI 검토 활성' : `AI 검토 ${status.switchState ?? 'unknown'}`}</Badge><Badge variant={decision === 'veto' ? 'destructive' : 'outline'}>{decision.toUpperCase()}</Badge></div>
      </div>
      <CardDescription>전통 경제 엔진은 항상 기준선으로 유지되고, AI는 동일 제안을 독립 검토합니다. API 키·endpoint는 표시하지 않습니다.</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <dl className="grid gap-2 text-sm sm:grid-cols-3"><div><dt className="text-muted-foreground">누적 council review</dt><dd className="font-semibold">{number(status.reviewCount)}</dd></div><div><dt className="text-muted-foreground">최근 confidence</dt><dd className="font-semibold">{latest?.confidence == null ? '—' : `${number(Number(latest.confidence) * 100, 1)}%`}</dd></div><div><dt className="text-muted-foreground">최근 모델 그룹</dt><dd className="font-semibold">{latest?.model ?? '—'}</dd></div></dl>
      {latest?.rationale ? <p className="rounded-md border bg-muted/30 p-3 text-sm">{latest.rationale}</p> : null}
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">분야</th><th>좌석</th><th>모델</th><th>검토</th><th>동의/거부/보류</th><th>평균 신뢰</th><th>지연 ms</th><th>토큰</th></tr></thead><tbody>{(status.agents ?? []).map((agent, index) => <tr className="border-b" key={`${agent.domain}-${agent.seat}-${agent.model}-${index}`}><td className="py-2">{label[agent.domain ?? ''] ?? agent.domain ?? '—'}</td><td>{agent.seat ?? '—'}</td><td className="max-w-48 truncate font-mono text-xs" title={agent.model}>{agent.model ?? '—'}</td><td>{number(agent.review_count)}</td><td>{number(agent.agree_count)} / {number(agent.veto_count)} / {number(agent.abstain_count)}</td><td>{agent.avg_confidence == null ? '—' : `${number(Number(agent.avg_confidence) * 100, 1)}%`}</td><td>{number(agent.avg_latency_ms, 1)}</td><td>{number(agent.avg_total_tokens, 1)}</td></tr>)}</tbody></table></div>
      {(status.agents ?? []).length === 0 ? <p className="text-sm text-muted-foreground">아직 agent review 데이터가 없습니다. AI가 비활성 상태여도 Classical Lane은 계속 동작합니다.</p> : null}
    </CardContent>
  </Card>;
}
