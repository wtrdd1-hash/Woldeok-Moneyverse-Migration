import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import { evaluateScenarioRisks, validateScenarioProjection, type ScenarioProjection } from './scenario-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '경제 시나리오 실험실 — 규칙 기반 위험 신호',
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function signedBps(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

export default async function EconomyScenarioLabPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminConsole('/admin/economy/scenario-lab');
  const params = await searchParams;
  const days = first(params.days, '30');
  const issuanceChangeBps = first(params.issuanceChangeBps, '0');
  const sinkChangeBps = first(params.sinkChangeBps, '0');
  const query = new URLSearchParams({ days, issuanceChangeBps, sinkChangeBps });

  let projection: ScenarioProjection | null = null;
  let problem: string | null = null;
  try {
    const response = await api<unknown>(
      `/api/v1/admin/economy/scenario-lab/preview?${query}`,
    );
    projection = validateScenarioProjection(response);
    if (!projection) problem = '서버가 검증 가능한 시나리오 결과를 반환하지 않았습니다. 결과를 표시하지 않습니다.';
  } catch (error) {
    problem =
      error instanceof ApiError && error.status === 400
        ? '입력 범위를 확인해 주세요. 기간은 1~365일, 발행·소각 변화율은 -100%~+500%입니다.'
        : '시나리오 기준 데이터를 불러오지 못했습니다.';
  }

  const riskSummary = projection ? evaluateScenarioRisks(projection) : null;

  return (
    <div data-page="admin-economy-scenario-lab" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow="ECONOMY SCENARIO LAB" title="경제 시나리오 실험실 — 규칙 기반 위험 신호">
        실제 정책이나 잔액을 바꾸지 않고 인증된 서버의 최근 24시간 발행·소각 흐름으로 통화량을 예상합니다. 아래 위험 신호는 고정된 규칙에 따른 참고 결과이며 AI 모델 추론이나 위원회 의결이 아닙니다.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">가정 파라미터 입력</CardTitle>
          <CardDescription>
            이 화면은 읽기 전용 샌드박스입니다. 결과는 가정 기반 예상치이며 실제 운영 DB 잔액에 반영되지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4" method="get">
            <label className="grid gap-1 text-sm">
              <span>기간 (일)</span>
              <input
                className="min-h-11 w-full rounded-md border bg-background px-3 py-2 font-mono"
                name="days"
                type="number"
                min="1"
                max="365"
                defaultValue={days}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>일일 발행 변화 (bp, +100bp=+1%)</span>
              <input
                className="min-h-11 w-full rounded-md border bg-background px-3 py-2 font-mono"
                name="issuanceChangeBps"
                type="number"
                min="-10000"
                max="50000"
                defaultValue={issuanceChangeBps}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>일일 소각 변화 (bp, +100bp=+1%)</span>
              <input
                className="min-h-11 w-full rounded-md border bg-background px-3 py-2 font-mono"
                name="sinkChangeBps"
                type="number"
                min="-10000"
                max="50000"
                defaultValue={sinkChangeBps}
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="min-h-11 w-full font-bold">시뮬레이션 실행</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {problem ? (
        <Card>
          <CardContent role="alert" className="pt-6 text-sm text-destructive">{problem}</CardContent>
        </Card>
      ) : projection ? (
        <>
          <section className="grid gap-3" aria-labelledby="scenario-result">
            <SectionHeader
              id="scenario-result"
              eyebrow="READ-ONLY PROJECTION"
              title={`${projection.days}일 시나리오 결과 및 거시 투사치`}
            />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Metric title="현재 M2 총통화" amount={projection.baseline_m2_amount} />
              <Metric title="예상 M2 총통화" amount={projection.projected_m2_amount} />
              <Metric
                title="일일 예상 발행량"
                amount={projection.projected_issued_per_day}
                note={signedBps(projection.issuance_change_bps)}
              />
              <Metric
                title="일일 예상 소각량"
                amount={projection.projected_burned_per_day}
                note={signedBps(projection.sink_change_bps)}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">변화 요약</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">일일 순변화</div>
                  <div className="font-semibold font-mono">
                    <Amount value={projection.projected_net_per_day} /> WLD
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">기간 M2 변화량</div>
                  <div className="font-semibold font-mono">
                    <Amount value={projection.projected_m2_delta_amount} /> WLD
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">공급 바닥 도달</div>
                  <Badge variant={projection.supply_floor_reached ? 'destructive' : 'secondary'} className="font-bold">
                    {projection.supply_floor_reached ? '위험 (예)' : '안전 (아니오)'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {riskSummary ? (
            <Card data-evidence-source={riskSummary.source} className="border-primary/30 bg-primary/5">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">결정론적 시나리오 위험 점검</CardTitle>
                  <Badge variant={riskSummary.status === 'HIGH_RISK' ? 'destructive' : 'secondary'} role="status">
                    {riskSummary.status === 'HIGH_RISK' ? '높은 위험 신호 · 수동 검토 필요' : '수동 검토 필요 · 승인 아님'}
                  </Badge>
                </div>
                <CardDescription>
                  아래 결과는 선택한 발행·소각 가정을 고정 임계값에 대입한 참고용 규칙 점검입니다.
                  AI 모델을 호출하거나 실제 위원회 투표·정책 승인을 수행하지 않았습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {riskSummary.checks.map((check) => (
                  <section key={check.key} className="rounded-xl border border-border/70 bg-card p-4" aria-label={check.name}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm">{check.name}</strong>
                      <Badge variant={check.severity === 'WARN' ? 'destructive' : 'outline'}>
                        {check.severity === 'WARN' ? '주의' : '기준 범위'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{check.explanation}</p>
                  </section>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">모델 한계 및 권고사항</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              {projection.advisory.map((line) => (
                <p key={line}>• {line}</p>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}

      <Button variant="outline" asChild className="min-h-11 w-fit">
        <Link href="/admin/economy">경제 운영 대시보드로 돌아가기</Link>
      </Button>
    </div>
  );
}

function Metric({
  title,
  amount,
  note,
}: {
  readonly title: string;
  readonly amount: string;
  readonly note?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl">
          <Amount value={amount} />
        </CardTitle>
      </CardHeader>
      {note ? (
        <CardContent className="text-xs text-muted-foreground font-mono">가정 {note}</CardContent>
      ) : null}
    </Card>
  );
}
