import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { api, ApiError } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { parseWalletTransactionDetail } from '@/lib/wallet-transaction-detail';
import { CopyTransactionId } from './copy-transaction-id';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 지갑 거래 상세',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const formatAmount = (amount: string) => BigInt(amount).toLocaleString('ko-KR') + ' WLD';

export default async function WalletTransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  await requireMember();
  const { transactionId } = await params;
  const enabled = process.env.WALLET_TRANSACTION_DETAIL_ENABLED === 'true';
  let state: 'ok' | 'not-found' | 'unavailable' | 'disabled' = 'unavailable';
  let detail = null as ReturnType<typeof parseWalletTransactionDetail>;
  if (!enabled) {
    state = 'disabled';
  } else if (!ID.test(transactionId)) {
    state = 'not-found';
  } else {
    try {
      const result = await api<unknown>(`/api/v1/wallet/activity/transactions/${transactionId}`);
      detail = parseWalletTransactionDetail(result);
      state = detail && detail.transactionId === transactionId ? 'ok' : 'unavailable';
    } catch (error: unknown) {
      state = error instanceof ApiError && error.status === 404 ? 'not-found' : 'unavailable';
    }
  }

  const message =
    state === 'disabled'
      ? '현재 거래 상세 기능을 사용할 수 없어요.'
      : state === 'not-found'
        ? '거래 기록을 찾을 수 없어요.'
        : '거래 상세를 확인할 수 없어요.';

  return (
    <main data-page="wallet-transaction-detail" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="outline" className="min-h-11 w-fit">
        <Link href="/wallet/activity">내 지갑 기록으로 돌아가기</Link>
      </Button>
      <PageHeader eyebrow="PRIVATE LEDGER READ" title="내 지갑 거래 상세">
        내 현금·은행 계정에 기록된 거래 내역만 조회합니다. 상대방 정보나 지급 완료 여부를 증명하지
        않습니다.
      </PageHeader>
      {state !== 'ok' || !detail ? (
        <Card>
          <CardContent className="grid gap-3">
            <p role="status" aria-live="polite">
              {message}
            </p>
            {state === 'unavailable' && (
              <Button asChild variant="outline" className="min-h-11 w-fit">
                <Link href={`/wallet/activity/transactions/${encodeURIComponent(transactionId)}`}>
                  다시 시도
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-4">
            <p role="status" aria-live="polite" className="font-medium">
              원장 기록 조회됨 · 정산 검증서 아님
            </p>
            <dl aria-label="본인 거래 원장 상세" className="grid gap-3 break-words">
              <div>
                <dt className="text-sm text-muted-foreground">거래 유형</dt>
                <dd>{detail.typeLabel}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">기록 시각 (한국시간)</dt>
                <dd>
                  <time dateTime={detail.occurredAtUtcMicros}>
                    {new Intl.DateTimeFormat('ko-KR', {
                      timeZone: 'Asia/Seoul',
                      dateStyle: 'long',
                      timeStyle: 'medium',
                    }).format(new Date(detail.occurredAtUtcMicros))}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">현금 변동</dt>
                <dd>{formatAmount(detail.cashDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">은행 변동</dt>
                <dd>{formatAmount(detail.bankDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">순변동</dt>
                <dd>{formatAmount(detail.netDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">거래 ID</dt>
                <dd className="break-all select-text">{detail.transactionId}</dd>
              </div>
            </dl>
            <CopyTransactionId transactionId={detail.transactionId} />
            <p className="text-sm text-muted-foreground">
              이 화면은 본인 계정의 원장 행 조회 결과입니다. 전표 전체 대사, 지급 완료, 현재 잔액 및
              공식 증빙을 보증하지 않습니다. 순변동이 0이어도 내부 이체라고 단정할 수 없습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
