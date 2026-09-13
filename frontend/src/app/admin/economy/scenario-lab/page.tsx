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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '경제 시나리오 실험실',
  robots: { index: false, follow: false },
};

interface ScenarioProjection {
  readonly baseline_m2_amount: string;
  readonly baseline_issued_24h: string;
  readonly baseline_burned_24h: string;
  readonly days: number;
  readonly issuance_change_bps: number;
  readonly sink_change_bps: number;
  readonly projected_issued_per_day: string;
  readonly projected_burned_per_day: string;
  readonly projected_net_per_day: string;
  readonly projected_m2_amount: string;
  readonly projected_m2_delta_amount: string;
  readonly projected_m2_change_bps: string | null;
  readonly supply_floor_reached: boolean;
  readonly advisory: readonly string[];
}

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
    projection = await api<ScenarioProjection>(
      `/api/v1/admin/economy/scenario-lab/preview?${query}`,
    );
  } catch (error) {
    problem =
      error instanceof ApiError && error.status === 400
        ? '입력 범위를 확인해 주세요. 기간은 1~365일, 발행·소각 변화율은 -100%~+500%입니다.'
        : '시나리오 기준 데이터를 불러오지 못했습니다.';
  }

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow="ECONOMY SCENARIO LAB" title="경제 시나리오 실험실">
        실제 정책이나 잔액을 바꾸지 않고 최근 24시간 흐름을 기준으로 통화량 변화를 계산합니다.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">가정 입력</CardTitle>
          <CardDescription>
            이 화면은 읽기 전용입니다. 결과는 정책 추천이나 자동 적용 명령으로 사용되지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4" method="get">
            <label className="grid gap-1 text-sm">
              <span>기간 (일)</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                name="days"
                type="number"
                min="1"
                max="365"
                defaultValue={days}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>일일 발행 변화 (bp)</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                name="issuanceChangeBps"
                type="number"
                min="-10000"
                max="50000"
                defaultValue={issuanceChangeBps}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>일일 소각 변화 (bp)</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                name="sinkChangeBps"
                type="number"
                min="-10000"
                max="50000"
                defaultValue={sinkChangeBps}
              />
            </label>
            <div className="flex items-end">
              <Button type="submit">시뮬레이션</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {problem ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{problem}</CardContent>
        </Card>
      ) : projection ? (
        <>
          <section className="grid gap-3" aria-labelledby="scenario-result">
            <SectionHeader
              id="scenario-result"
              eyebrow="READ-ONLY PROJECTION"
              title={`${projection.days}일 시나리오 결과`}
            />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Metric title="현재 M2" amount={projection.baseline_m2_amount} />
              <Metric title="예상 M2" amount={projection.projected_m2_amount} />
              <Metric
                title="일일 예상 발행"
                amount={projection.projected_issued_per_day}
                note={signedBps(projection.issuance_change_bps)}
              />
              <Metric
                title="일일 예상 소각"
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
                  <div className="font-semibold">
                    <Amount value={projection.projected_net_per_day} />
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">기간 M2 변화</div>
                  <div className="font-semibold">
                    <Amount value={projection.projected_m2_delta_amount} />
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">공급 바닥 도달</div>
                  <Badge variant={projection.supply_floor_reached ? 'destructive' : 'secondary'}>
                    {projection.supply_floor_reached ? '예' : '아니오'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">모델 한계</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              {projection.advisory.map((line) => (
                <p key={line}>• {line}</p>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}

      <Button variant="outline" asChild className="w-fit">
        <Link href="/admin/economy">경제 운영으로 돌아가기</Link>
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
        <CardContent className="text-xs text-muted-foreground">가정 {note}</CardContent>
      ) : null}
    </Card>
  );
}
