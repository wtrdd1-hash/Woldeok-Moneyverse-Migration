import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { formatFlowWld, parseFlowSummary } from './flow-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '최근 WLD 수입·지출 요약',
  robots: { index: false, follow: false },
};

export default async function WalletFlowsPage() {
  await requireMember();
  const response = await apiOrNull<unknown>('/api/v1/wallet/flow-summary');
  const flow = parseFlowSummary(response);

  return (
    <div data-page="wallet-flows" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/wallet/activity"><ArrowLeft aria-hidden />내 지갑 기록</Link>
      </Button>
      <PageHeader eyebrow="RECENT LEDGER FLOW" title="최근 WLD 수입·지출">
        실제 내 지갑 원장의 최근 최대 50건을 기준으로 집계합니다.
        전체 기간의 수입·지출이나 월별 결산이 아닙니다.
      </PageHeader>
      {!flow ? (
        <EmptyState title="지금은 수입·지출 내역을 확인할 수 없어요." description="실제 원장 조회가 가능해지면 다시 확인해 주세요." />
      ) : flow.transactionCount === 0 ? (
        <EmptyState title="아직 집계할 거래가 없어요." description="거래가 발생하면 최근 50건 기준 수입·지출이 표시됩니다." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="grid gap-2 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowDownLeft aria-hidden className="size-4" />받은 WLD</div>
            <p className="break-all text-xl font-semibold tabular-nums">{formatFlowWld(flow.incomingAmount)}</p>
            <p className="text-xs text-muted-foreground">{flow.incomingCount}건</p>
          </CardContent></Card>
          <Card><CardContent className="grid gap-2 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowUpRight aria-hidden className="size-4" />나간 WLD</div>
            <p className="break-all text-xl font-semibold tabular-nums">{formatFlowWld(flow.outgoingAmount)}</p>
            <p className="text-xs text-muted-foreground">{flow.outgoingCount}건</p>
          </CardContent></Card>
          <Card><CardContent className="grid gap-2 pt-6">
            <p className="text-sm text-muted-foreground">순변동</p>
            <p className="break-all text-xl font-semibold tabular-nums">{formatFlowWld(flow.netAmount)}</p>
          </CardContent></Card>
          <Card><CardContent className="grid gap-2 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowRightLeft aria-hidden className="size-4" />현금·은행 내부 이동</div>
            <p className="text-xl font-semibold tabular-nums">{flow.internalMovementCount}건</p>
            <p className="text-xs text-muted-foreground">내부 이동은 수입·지출 합계에서 제외합니다.</p>
          </CardContent></Card>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        조회된 거래 {flow?.transactionCount ?? '—'}건 · 최근 50건까지만 포함 · 전체 원장 내역이 아님
      </p>
    </div>
  );
}
