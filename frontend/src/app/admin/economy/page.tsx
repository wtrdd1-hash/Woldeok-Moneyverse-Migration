import { FaucetSinkGauge, type FaucetSinkStats } from './faucet-sink-gauge';
import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, api, apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { ReconciliationHealth } from '../types';
import {
  AcknowledgeAlertDialog,
  BulkPayoutConsole,
  KnobDialog,
  RunAutoPolicyDialog,
} from './economy-forms';
import { proposalState } from './economy';
import type {
  AutoPolicyBoard,
  AutoPolicyProposal,
  BulkPayoutItem,
  EconomyAlert,
  EconomyDashboard,
  PolicyAdjustment,
} from './economy';
import {
  AlertItem,
  HealthFigures,
  IssuanceFigures,
  KnobItem,
  PayoutReportTable,
  ProposalPanel,
  ReconciliationBadge,
  SupplyFigures,
} from './economy-parts';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/economy');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** How many alerts the list asks for; `admin_list_alerts` caps it at 200. */
const ALERT_LIMIT = 30;

/**
 * A panel that could not be filled, and which of the two reasons it was.
 *
 * Refused and unreachable are different facts and an operator can only act on
 * the first: the dashboard, the alert list and the knob registry all require
 * the `approver` role, and an administrator without it gets a 403 that
 * `apiOrNull` would flatten into "could not load" -- which is how somebody
 * spends an afternoon looking for an outage that is a missing role.
 */
type Section<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly refused: boolean };

async function section<T>(path: string): Promise<Section<T>> {
  try {
    return { ok: true, data: await api<T>(path) };
  } catch (error) {
    return { ok: false, refused: error instanceof ApiError && error.status === 403 };
  }
}

function problem(section: Section<unknown>, unreachable: string): string | null {
  if (section.ok) return null;
  return section.refused ? '이 정보를 볼 권한이 없어요. 상위 운영 역할이 필요합니다.' : unreachable;
}

/**
 * The economy console of spec 14.9 and 15.4.
 *
 * Four things on one screen because they are one job: the figures say what
 * the money is doing, the alerts say what noticed, the adjustment engine says
 * what would be done about it this week, and the batch payout is the one
 * lever an operator pulls by hand. Splitting them would mean reading a number
 * on one page and acting on it on another.
 *
 * The adjustment engine's routes live under `/admin/controls` because that is
 * where the API put them -- `admin_list_policy_knobs` and
 * `admin_preview_auto_policy` answer in one call there. The screen follows
 * the operator's job rather than the API's grouping.
 */
export default async function AdminEconomyPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminConsole();
  const params = await searchParams;

  // A payout id arrives from the link the confirmation leaves behind. The
  // route's ParseUUIDPipe would answer 400 for anything else, so a value
  // typed by hand is dropped rather than turned into a failure the operator
  // has to interpret.
  const requested = typeof params.payout === 'string' ? params.payout : '';
  const payoutId = UUID.test(requested) ? requested : null;

  const [dashboard, alerts, autoPolicy, health, report] = await Promise.all([
    section<EconomyDashboard>('/api/v1/admin/economy'),
    section<{ alerts: EconomyAlert[] }>(`/api/v1/admin/economy/alerts?limit=${ALERT_LIMIT}`),
    section<AutoPolicyBoard>('/api/v1/admin/controls/auto-policy'),
    apiOrNull<ReconciliationHealth>('/api/v1/admin/economy/reconciliations/latest'),
    payoutId === null
      ? Promise.resolve(null)
      : section<{ items: BulkPayoutItem[] }>(
          `/api/v1/admin/economy/bulk-payouts/${payoutId}/report`,
        ),
  ]);

  const board = dashboard.ok ? dashboard.data : null;
  const boardProblem = problem(dashboard, '경제 지표를 불러오지 못했어요.');
  const alertList = alerts.ok ? alerts.data.alerts : null;
  const alertProblem = problem(alerts, '알림을 불러오지 못했어요.');
  const engine = autoPolicy.ok ? autoPolicy.data : null;
  const faucetSinkStats = await apiOrNull<FaucetSinkStats>('/api/v1/admin/economy/stats');
  const engineProblem = problem(autoPolicy, '자동 조정 엔진 상태를 불러오지 못했어요.');

  // Three answers, and the middle one only exists once a payout id is in the
  // address: no report was asked for, the report could not be read, or these
  // are its rows.
  const reportProblem =
    report === null ? null : problem(report, '지급 보고서를 불러오지 못했어요.');
  const reportItems = report !== null && report.ok ? report.data.items : null;

  // Annotated rather than inferred: `{}` on its own is a type with no
  // `adjustments` on it, and every field of a proposal is optional because
  // the API answers an empty document when the function returned no row.
  const proposal: AutoPolicyProposal = engine?.preview ?? {};
  const adjustments = new Map<string, PolicyAdjustment>(
    (proposal.adjustments ?? []).map((adjustment) => [adjustment.knob, adjustment] as const),
  );
  const engineState = proposalState(proposal);

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      <section aria-labelledby="economy-figures" className="grid gap-3">
        <FaucetSinkGauge stats={faucetSinkStats} />
      <SectionHeader eyebrow="MONEY SUPPLY" title="통화량과 발행" id="economy-figures" />

        {board === null ? (
          <EmptyState title={boardProblem ?? '경제 지표를 불러오지 못했어요.'} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">통화량 구성</CardTitle>
                <CardDescription>
                  지금 이 순간 원장에서 계산한 값입니다. 저장된 집계가 아니라 전표를 직접 읽습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupplyFigures dashboard={board} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">발행과 소각</CardTitle>
                <CardDescription>
                  발행이 소각을 계속 웃돌면 자동 조정 엔진이 상점 가격과 유지비를 올립니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssuanceFigures dashboard={board} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">운영 상태</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <ReconciliationBadge
                  ok={board.reconciliation_ok}
                  at={board.reconciliation_at}
                />
                <HealthFigures dashboard={board} />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">경제 대사 스냅숏</CardTitle>
            <CardDescription>
              {health?.available && health.calculatedAt
                ? `${formatMoment(health.calculatedAt)} 기준 스냅숏`
                : '가장 최근 스냅숏'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health === null ? (
              <EmptyState title="대사 현황을 불러오지 못했어요." />
            ) : !health.available || !health.integrity || !health.supply ? (
              <EmptyState
                title="아직 기록된 대사 스냅숏이 없어요."
                description="대사 작업이 한 번 이상 실행된 뒤에 표시됩니다."
              />
            ) : (
              <div className="grid gap-4">
                <Badge
                  variant={health.integrity.ok ? 'secondary' : 'destructive'}
                  className="w-fit"
                >
                  {health.integrity.ok ? '정합성 정상' : '정합성 불일치'}
                </Badge>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <Metric term="원장 거래 수" value={health.integrity.ledgerTransactionCount} plain />
                  <Metric
                    term="미균형 거래"
                    value={health.integrity.unbalancedTransactionCount}
                    plain
                  />
                  <Metric
                    term="잔액 불일치 계정"
                    value={health.integrity.balanceMismatchAccountCount}
                    plain
                  />
                  <Metric term="잔액 총차" value={health.integrity.balanceTotalDeltaAmount} />
                  <Metric term="국고 잔액" value={health.supply.treasuryBalanceAmount} />
                  {health.treasury24h && (
                    <>
                      <Metric term="24시간 유입" value={health.treasury24h.inflowAmount} />
                      <Metric term="24시간 유출" value={health.treasury24h.outflowAmount} />
                      <Metric term="24시간 순흐름" value={health.treasury24h.netFlowAmount} />
                    </>
                  )}
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="economy-alerts" className="grid gap-3">
        <SectionHeader eyebrow="ALERTS" title="알림" id="economy-alerts" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 알림 {ALERT_LIMIT}건</CardTitle>
            <CardDescription>
              확인하지 않은 알림이 먼저 옵니다. 확인 처리는 알림을 지우지 않고, 누가 언제 읽었는지를
              함께 남깁니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {alertList === null ? (
              <EmptyState title={alertProblem ?? '알림을 불러오지 못했어요.'} />
            ) : alertList.length === 0 ? (
              <EmptyState
                title="올라온 알림이 없어요."
                description="감시 항목이 기준을 벗어나면 여기에 쌓입니다."
              />
            ) : (
              alertList.map((alert) => (
                <AlertItem key={alert.alert_id} alert={alert}>
                  <AcknowledgeAlertDialog alertId={alert.alert_id} />
                </AlertItem>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="economy-engine" className="grid gap-3">
        <SectionHeader
          eyebrow="AUTOMATIC ADJUSTMENT"
          title="자동 조정 엔진"
          id="economy-engine"
        />

        {engine === null ? (
          <Card>
            <CardContent>
              <EmptyState title={engineProblem ?? '자동 조정 엔진 상태를 불러오지 못했어요.'} />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">이번 주 제안</CardTitle>
                <CardDescription>
                  엔진은 매주 한 번 돌면서 지표를 읽고, 바꿀 값이 있으면 새 정책 버전을 만들어
                  적용합니다. 아래는 지금 실행했을 때 실제로 일어나는 일입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <ProposalPanel proposal={proposal} />
                <RunAutoPolicyDialog
                  adjustmentCount={(proposal.adjustments ?? []).length}
                  blocked={engineState === 'blocked'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">조정 항목</CardTitle>
                <CardDescription>
                  엔진이 움직일 수 있는 값과 그 허용 범위입니다. 여기에 없는 값은 어떤 계산으로도
                  자동으로 바뀌지 않습니다 — 카지노와 대출에는 조정 항목이 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {engine.knobs.length === 0 ? (
                  <EmptyState
                    title="등록된 조정 항목이 없어요."
                    description="항목 등록은 마이그레이션으로만 이뤄집니다."
                  />
                ) : (
                  engine.knobs.map((knob) => (
                    <KnobItem
                      key={knob.knob_key}
                      knob={knob}
                      adjustment={adjustments.get(knob.knob_key)}
                    >
                      <KnobDialog knob={knob} />
                    </KnobItem>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <section aria-labelledby="economy-payout" className="grid gap-3">
        <SectionHeader eyebrow="BULK PAYOUT" title="일괄 지급" id="economy-payout" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">조건을 정하고, 먼저 확인한 뒤 실행</CardTitle>
            <CardDescription>
              한 번에 최대 5,000명에게 지급합니다. 되돌리려면 회원마다 반대 방향의 정정 거래를
              올려야 하므로, 실행 전에 대상 수와 지급 불가 인원을 반드시 확인해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkPayoutConsole />
          </CardContent>
        </Card>

        <Card id="payout-report">
          <CardHeader>
            <CardTitle className="text-base">지급 보고서</CardTitle>
            <CardDescription>
              회원 한 명이 한 줄입니다. 지급되지 않은 회원과 그 사유는 여기에서만 확인할 수
              있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payoutId === null ? (
              <EmptyState
                title="열어 둔 보고서가 없어요."
                description="지급을 실행하면 그 결과로 이 자리에 보고서가 열립니다."
              />
            ) : reportProblem !== null ? (
              <EmptyState title={reportProblem} />
            ) : reportItems === null || reportItems.length === 0 ? (
              <EmptyState
                title="이 지급에는 대상이 없었어요."
                description="조건에 맞는 회원이 한 명도 없었거나, 다른 지급 기록입니다."
              />
            ) : (
              <PayoutReportTable items={reportItems} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/**
 * One line of the reconciliation snapshot.
 *
 * Kept local to this page: the snapshot comes from a different controller
 * with a camelCase shape of its own, and the console's own figures are
 * rendered by `Figure` in `economy-parts`.
 */
function Metric({
  term,
  value,
  plain = false,
}: {
  readonly term: string;
  readonly value: string;
  /** A count, not money: it gets grouping but no currency mark. */
  readonly plain?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-2">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-sm">
        <Amount value={value} currency={!plain} />
      </dd>
    </div>
  );
}
