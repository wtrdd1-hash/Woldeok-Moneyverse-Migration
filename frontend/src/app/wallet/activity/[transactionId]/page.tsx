import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiError, api } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { historicalReceiptDisplay, type HistoricalReceipt } from '../historical-receipt';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 WLD 거래 확인',
  robots: { index: false, follow: false },
  other: { referrer: 'no-referrer' },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function WalletHistoricalReceiptPage({
  params,
}: { params: Promise<{ transactionId: string }> }) {
  await requireMember();
  const { transactionId } = await params;
  if (!UUID.test(transactionId)) notFound();

  let receipt: HistoricalReceipt;
  let view: ReturnType<typeof historicalReceiptDisplay>;
  try {
    receipt = await api<HistoricalReceipt>(`/api/v1/wallet/activity/${encodeURIComponent(transactionId)}`);
    if (receipt.transactionId?.toLowerCase() !== transactionId.toLowerCase()) throw new Error('receipt reference mismatch');
    view = historicalReceiptDisplay(receipt);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="mv-page mv-page--finance grid gap-5">
        <PageHeader eyebrow="PRIVATE RECEIPT" title="거래 기록을 확인할 수 없습니다">
          원장 조회를 확인하지 못했습니다. 결과를 확인하기 전 같은 금융 요청을 반복하지 마세요.
        </PageHeader>
        <EmptyState title="잠시 후 다시 확인해 주세요." />
        <Button asChild variant="outline"><Link href="/wallet/activity">기록으로 돌아가기</Link></Button>
      </div>
    );
  }

  return (
    <div data-page="wallet-historical-receipt" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/wallet/activity"><ArrowLeft /> 지갑 기록</Link>
      </Button>
      <PageHeader eyebrow="VERIFIED LEDGER" title="내 WLD 거래 확인">
        본인에게 기록된 가상 WLD 원장 내역입니다. 송금 취소나 환불 처리가 아닙니다.
      </PageHeader>
      <Card><CardContent className="grid gap-4 py-5">
        <p className="text-sm font-medium">확인된 거래 · {receipt.reason}</p>
        <dl className="grid gap-3 text-sm">
          <div><dt className="text-muted-foreground">발생 시각</dt><dd>{formatMoment(receipt.occurredAt)}</dd></div>
          <div><dt className="text-muted-foreground">전체 WLD 변동</dt><dd className="font-semibold tabular-nums break-all">{view.net}</dd></div>
          <div><dt className="text-muted-foreground">활동 지갑 변동</dt><dd className="tabular-nums break-all">{view.cash}</dd></div>
          <div><dt className="text-muted-foreground">은행 보관함 변동</dt><dd className="tabular-nums break-all">{view.bank}</dd></div>
          <div><dt className="text-muted-foreground">거래 참조번호</dt><dd><code className="select-all break-all">{receipt.transactionId}</code></dd></div>
        </dl>
        <p className="text-xs text-muted-foreground">{view.scope}</p>
        {receipt.detailCompleteness === 'PARTIAL' && (
          <p role="status" className="text-sm text-muted-foreground">통장별 금액을 확인하지 못했습니다. 참조번호로 문의해 주세요.</p>
        )}
      </CardContent></Card>
    </div>
  );
}
