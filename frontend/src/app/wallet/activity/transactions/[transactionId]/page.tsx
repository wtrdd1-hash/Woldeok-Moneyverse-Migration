import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { api, ApiError } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { parseWalletTransactionDetail } from '@/lib/wallet-transaction-detail';
import { CopyTransactionId } from './copy-transaction-id';
import { INTL_LOCALE } from '../../../copy';
import { COPY } from '../../copy';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pick(locale, COPY.detailMetaTitle),
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  };
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const formatAmount = (amount: string) => BigInt(amount).toLocaleString('ko-KR') + ' WLD';

export default async function WalletTransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  await requireMember();
  const locale = await getServerLocale();
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);
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
      ? t(COPY.detailDisabled)
      : state === 'not-found'
        ? t(COPY.detailNotFound)
        : t(COPY.detailUnavailable);

  return (
    <main data-page="wallet-transaction-detail" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="outline" className="min-h-11 w-fit">
        <Link href="/wallet/activity">{t(COPY.detailBack)}</Link>
      </Button>
      <PageHeader eyebrow="PRIVATE LEDGER READ" title={t(COPY.detailTitle)}>
        {t(COPY.detailIntro)}
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
                  {t(COPY.detailRetry)}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-4">
            <p role="status" aria-live="polite" className="font-medium">
              {t(COPY.detailReadOk)}
            </p>
            <dl aria-label={t(COPY.detailList)} className="grid gap-3 break-words">
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailType)}</dt>
                <dd>{detail.typeLabel}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailRecordedAt)}</dt>
                <dd>
                  <time dateTime={detail.occurredAtUtcMicros}>
                    {new Intl.DateTimeFormat(INTL_LOCALE[locale], {
                      timeZone: 'Asia/Seoul',
                      dateStyle: 'long',
                      timeStyle: 'medium',
                    }).format(new Date(detail.occurredAtUtcMicros))}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailCash)}</dt>
                <dd>{formatAmount(detail.cashDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailBank)}</dt>
                <dd>{formatAmount(detail.bankDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailNet)}</dt>
                <dd>{formatAmount(detail.netDelta)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t(COPY.detailId)}</dt>
                <dd className="break-all select-text">{detail.transactionId}</dd>
              </div>
            </dl>
            <CopyTransactionId transactionId={detail.transactionId} />
            <p className="text-sm text-muted-foreground">
              {t(COPY.detailDisclaimer)}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
