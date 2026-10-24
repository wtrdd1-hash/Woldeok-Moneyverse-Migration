import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ApiError, api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { receiptPath } from '../receipt-path';
import { WalletReceiptCard } from '../receipt-card';
import type { TransactionView } from '../../sides';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: '내 WLD 거래 확인',
  robots: { index: false, follow: false },
  other: { referrer: 'no-referrer' },
};

export default async function WalletReceiptPage({
  params,
}: { readonly params: Promise<{ transactionId: string }> }) {
  await requireMember();
  const { transactionId } = await params;
  if (!receiptPath(transactionId)) notFound();

  let receipt: TransactionView;
  try {
    receipt = await api<TransactionView>(`/api/v1/wallet/activity/${encodeURIComponent(transactionId)}`);
    if (receipt.transactionId?.toLowerCase() !== transactionId.toLowerCase()) {
      throw new Error('wallet receipt reference mismatch');
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="mv-page mv-page--finance grid gap-5">
        <PageHeader eyebrow="PRIVATE RECEIPT" title="거래 기록을 확인할 수 없습니다">
          조회 상태가 불확실합니다. 원장 조회를 확인하기 전 같은 금융 요청을 반복하지 마세요.
        </PageHeader>
        <EmptyState title="잠시 후 다시 확인해 주세요." />
        <Button asChild variant="outline"><Link href="/wallet/activity">기록으로 돌아가기</Link></Button>
      </div>
    );
  }

  return (
    <div data-page="wallet-historical-receipt" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="-ml-3 w-fit">
        <Link href="/wallet/activity"><ArrowLeft /> 지갑 기록</Link>
      </Button>
      <PageHeader eyebrow="VERIFIED LEDGER" title="내 WLD 거래 확인">
        최근 기록보다 오래된 거래도 참조번호로 확인할 수 있습니다.
      </PageHeader>
      <WalletReceiptCard receipt={receipt} />
    </div>
  );
}
