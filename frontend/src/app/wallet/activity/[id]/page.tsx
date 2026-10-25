import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { api, ApiError } from '@/lib/api';
import { formatMoment, formatWld } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { isWalletReceiptId, validatedRecentReceipt } from '../../recent-receipt';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '최근 지갑 거래 영수증',
  robots: { index: false, follow: false },
};

export default async function RecentWalletReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  let response: unknown;
  let unavailable = false;
  let missing = false;
  if (!isWalletReceiptId(id)) {
    missing = true;
  } else {
    try {
      response = await api<unknown>(`/api/v1/wallet/transactions/${encodeURIComponent(id)}/receipt`);
    } catch (error) {
      missing = error instanceof ApiError && error.status === 404;
      unavailable = !missing;
    }
  }
  const receipt = validatedRecentReceipt(response, id);
  const rows = receipt ? [
    ['활동', receipt.label],
    ['거래 시각', formatMoment(receipt.occurredAt)],
    ['현금 증감', formatWld(receipt.cashDelta)],
    ['은행 증감', formatWld(receipt.bankDelta)],
    ['합계 증감', formatWld(receipt.netAmount)],
    ['원장 거래 ID', receipt.transactionId],
  ] : [];

  return (
    <div data-page="wallet-recent-receipt" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/wallet/activity"><ArrowLeft /> 내 지갑 기록</Link>
      </Button>
      <PageHeader eyebrow="LEDGER RECEIPT" title="최근 지갑 거래 영수증">
        실제 원장에 기록된 내 현금·은행 계정의 증감만 표시합니다. 거래 상대방이나 전체 원장 금액은 확인되지 않습니다.
      </PageHeader>
      {receipt ? (
        <Card>
          <CardHeader><CardTitle>확인된 최근 거래</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-4">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 border-b pb-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-all font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">최근 최대 50건 안에서 확인된 거래입니다. 전체 거래 내역 증명이나 상대방 지급 확인서는 아닙니다.</p>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title={missing ? '최근 50건에서 이 거래를 찾을 수 없어요.' : '거래 영수증을 확인할 수 없어요.'}
          description={unavailable ? '원장 조회가 실패했거나 응답을 검증할 수 없습니다. 지급·입금을 확인한 것으로 표시하지 않습니다.' : '거래가 더 오래되었거나 내 거래가 아닐 수 있습니다. 최근 기록에서 다시 확인해 주세요.'}
        />
      )}
    </div>
  );
}
