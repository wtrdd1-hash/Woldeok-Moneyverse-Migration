import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireAdministrator } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { ReconciliationHealth } from '../types';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/economy');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminEconomyPage() {
  await requireAdministrator();
  const health = await apiOrNull<ReconciliationHealth>(
    '/api/v1/admin/economy/reconciliations/latest',
  );

  return (
    <div className="grid gap-5">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">경제 대사</CardTitle>
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
                <Badge variant={health.integrity.ok ? 'secondary' : 'destructive'} className="w-fit">
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
                  <Metric term="통화량(M2)" value={health.supply.m2Amount} />
                  <Metric term="순발행" value={health.supply.netMintIssuanceAmount} />
                  <Metric term="소각 흡수" value={health.supply.sinkAbsorbedAmount} />
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
    </div>
  );
}

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
