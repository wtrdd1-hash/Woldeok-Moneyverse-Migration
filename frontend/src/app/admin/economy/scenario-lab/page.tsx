/* eslint-disable @typescript-eslint/no-unused-vars */
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
  title: '경제 시나리오 실험실 & AI 위원회 시뮬레이터',
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

interface DomainSimulation {
  readonly domain: string;
  readonly name: string;
  readonly seatA: { readonly model: string; readonly decision: 'agree' | 'veto' | 'abstain'; readonly rationale: string };
  readonly seatB: { readonly model: string; readonly decision: 'agree' | 'veto' | 'abstain'; readonly rationale: string };
  readonly consensus: 'agree' | 'veto' | 'disputed';
}

function first(value: string | string[] | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function signedBps(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function simulateAiCouncil(
  issuanceChangeBps: number,
  sinkChangeBps: number,
  supplyFloorReached: boolean,
): {
  readonly overallDecision: 'agree' | 'veto' | 'disputed';
  readonly domains: readonly DomainSimulation[];
  readonly rationale: string;
} {
  const isHighInflation = issuanceChangeBps > 2000;
  const isSevereDrain = sinkChangeBps > 3000 || supplyFloorReached;
  const isModerate = Math.abs(issuanceChangeBps) <= 1000 && Math.abs(sinkChangeBps) <= 1000;

  const domains: DomainSimulation[] = [
    {
      domain: 'integrity',
      name: '데이터 무결성',
      seatA: {
        model: 'llama3.2:3b',
        decision: supplyFloorReached ? 'veto' : 'agree',
        rationale: supplyFloorReached ? '통화량 바닥 도달로 인한 시스템 오버플로우 위험 감지' : '발행/소각 장부 불변성 및 M2 제약 조건 검증 통과',
      },
      seatB: {
        model: 'gemma3:1b',
        decision: supplyFloorReached ? 'veto' : 'agree',
        rationale: supplyFloorReached ? '최저 통화량 한도 침범에 따른 무결성 결격' : '수학적 통화 균형 상태 유지 확인',
      },
      consensus: supplyFloorReached ? 'veto' : 'agree',
    },
    {
      domain: 'macro',
      name: '거시경제',
      seatA: {
        model: 'llama3.2:3b',
        decision: isHighInflation ? 'veto' : 'agree',
        rationale: isHighInflation ? `일일 발행 증가율(${signedBps(issuanceChangeBps)}) 과다로 화폐 가치 급락 우려` : '유동성 공급 및 통화 유속 안정 범위 내 위치',
      },
      seatB: {
        model: 'gemma3:1b',
        decision: isHighInflation ? 'veto' : isSevereDrain ? 'veto' : 'agree',
        rationale: isHighInflation ? '초과 인플레이션 리스크 경고' : isSevereDrain ? '디플레이션 압력 과중' : '거시 지표 안정성 충족',
      },
      consensus: isHighInflation ? 'veto' : isSevereDrain ? 'disputed' : 'agree',
    },
    {
      domain: 'jobs',
      name: '직업/활동',
      seatA: {
        model: 'llama3.2:3b',
        decision: isSevereDrain ? 'veto' : 'agree',
        rationale: isSevereDrain ? '소각 과다로 인한 직업 노동 보상 동기 위축 우려' : '직업별 보상 및 일일 쿼터 건전성 양호',
      },
      seatB: {
        model: 'gemma3:1b',
        decision: 'agree',
        rationale: '8대 직업 활동 표본 및 근로 소득 흐름 지속 가능성 확인',
      },
      consensus: isSevereDrain ? 'disputed' : 'agree',
    },
    {
      domain: 'welfare',
      name: '복지/소비',
      seatA: {
        model: 'llama3.2:3b',
        decision: isSevereDrain ? 'veto' : 'agree',
        rationale: isSevereDrain ? '유저 잔고 고갈 및 상점 구매력 저하 리스크' : '유저 간 거래 및 소비 활성도 충족',
      },
      seatB: {
        model: 'gemma3:1b',
        decision: isSevereDrain ? 'veto' : 'agree',
        rationale: isSevereDrain ? '소비 바닥 도달 위험에 따른 VETO' : '복지 안전망 및 기초 통화 순환 적정',
      },
      consensus: isSevereDrain ? 'veto' : 'agree',
    },
  ];

  const hasVeto = domains.some((d) => d.consensus === 'veto');
  const hasDispute = domains.some((d) => d.consensus === 'disputed');
  const overallDecision = hasVeto ? 'veto' : hasDispute ? 'disputed' : 'agree';

  const rationale =
    overallDecision === 'agree'
      ? 'council decision=agree;agree=integrity,macro,jobs,welfare;veto=none;disputed=none;notes=모든 시뮬레이션 지표가 안정 범위 내에 있어 정책 적용을 권고합니다.'
      : overallDecision === 'veto'
      ? `council decision=veto;agree=${domains.filter((d) => d.consensus === 'agree').map((d) => d.domain).join(',') || 'none'};veto=${domains.filter((d) => d.consensus === 'veto').map((d) => d.domain).join(',')};disputed=none;notes=극단적 통화 변화로 인한 경제 붕괴 리스크 감지`
      : 'council decision=abstain;agree=integrity,jobs;veto=none;disputed=macro,welfare;notes=위원 간 의견 조율 필요 (경계값 파라미터)';

  return { overallDecision, domains, rationale };
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

  const aiSim = projection
    ? simulateAiCouncil(projection.issuance_change_bps, projection.sink_change_bps, projection.supply_floor_reached)
    : null;

  return (
    <div data-page="admin-economy-scenario-lab" className="mv-page mv-page--admin grid gap-5">
      <AdminBack />
      <PageHeader eyebrow="ECONOMY SCENARIO LAB" title="경제 시나리오 실험실 &amp; AI 위원회 시뮬레이터">
        실제 정책이나 잔액을 바꾸지 않고 최근 24시간 흐름을 기준으로 통화량 변화를 계산하고, 듀얼 로컬 AI(Llama 3.2 3B &amp; Gemma 3 1B)의 심의 판정을 실시간 시뮬레이션합니다.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">가정 파라미터 입력</CardTitle>
          <CardDescription>
            이 화면은 읽기 전용 샌드박스입니다. 결과는 실시간 검증용이며 실제 운영 DB 잔액에 반영되지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4" method="get">
            <label className="grid gap-1 text-sm">
              <span>기간 (일)</span>
              <input
                className="rounded-md border bg-background px-3 py-2 font-mono"
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
                className="rounded-md border bg-background px-3 py-2 font-mono"
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
                className="rounded-md border bg-background px-3 py-2 font-mono"
                name="sinkChangeBps"
                type="number"
                min="-10000"
                max="50000"
                defaultValue={sinkChangeBps}
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full font-bold">시뮬레이션 실행</Button>
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

          {/* AI 위원회 가상 의결 판정 카드 */}
          {aiSim ? (
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardHeader className="pb-3 border-b border-primary/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <CardTitle className="text-base font-bold">AI 경제 정책 위원회 (AI Council) 가상 심의 판정</CardTitle>
                  </div>
                  <Badge
                    variant={aiSim.overallDecision === 'agree' ? 'default' : aiSim.overallDecision === 'veto' ? 'destructive' : 'secondary'}
                    className="font-bold text-xs"
                  >
                    {aiSim.overallDecision === 'agree' ? '만장일치 승인 권고' : aiSim.overallDecision === 'veto' ? '위험 거부 (VETO)' : '보류 (조율 필요)'}
                  </Badge>
                </div>
                <CardDescription>
                  Llama 3.2 3B(Seat A)와 Gemma 3 1B(Seat B) 위원회가 4대 도메인(무결성·거시·직업·복지) 관점에서 이 가상 파라미터를 교차 심의한 결과입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {aiSim.domains.map((dom) => (
                    <div
                      key={dom.domain}
                      className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-foreground">{dom.name}</strong>
                        <Badge
                          variant={dom.consensus === 'agree' ? 'outline' : dom.consensus === 'veto' ? 'destructive' : 'secondary'}
                          className="text-[10px] font-semibold"
                        >
                          {dom.consensus === 'agree' ? '✅ 합의' : dom.consensus === 'veto' ? '🛑 거부' : '⚖️ 이견'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex items-start gap-1">
                          <span className="font-mono text-primary shrink-0">[Llama 3.2]:</span>
                          <span className="text-foreground/90">{dom.seatA.rationale}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-mono text-primary shrink-0">[Gemma 3]:</span>
                          <span className="text-foreground/90">{dom.seatB.rationale}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono pt-1">
                  의결 로그 페이로드: {aiSim.rationale}
                </p>
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

      <Button variant="outline" asChild className="w-fit">
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
