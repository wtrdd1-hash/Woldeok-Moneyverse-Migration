import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DerivativesPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  // The authenticated API is the only potential market authority. Even a 200
  // response cannot enable trading until a certified ledger/feed contract ships.
  await apiOrNull<unknown>('/api/v1/stocks/derivatives/markets');

  return (
    <main data-page="derivatives" className="mv-page mv-page--finance mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <PageHeader eyebrow="DERIVATIVES · SOURCE STATUS" title={isEn ? 'Virtual derivatives' : '가상 파생상품'}>
        {isEn
          ? 'Market prices, margin balances, positions and settlements require verified server records.'
          : '파생상품 시세, 증거금, 포지션 및 정산 정보는 검증된 서버 기록이 있어야 제공할 수 있습니다.'}
      </PageHeader>
      <Card className="border-amber-500/40" role="status" aria-live="polite">
        <CardHeader className="flex flex-row items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-1 size-6 shrink-0 text-amber-600" />
          <CardTitle className="text-lg leading-relaxed">
            {isEn ? 'Derivatives trading is currently unavailable' : '현재 파생상품 거래를 이용할 수 없습니다'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            {isEn
              ? 'The server has not certified an authoritative derivatives market feed or a member-specific positions and settlement ledger. No balances, trades, liquidation prices or guaranteed protection can be displayed.'
              : '서버에서 파생상품 시세와 회원별 포지션·정산 원장을 검증하지 못했습니다. 확인되지 않은 잔액, 체결, 청산가 또는 보호 보장을 표시하지 않습니다.'}
          </p>
          <p>
            {isEn
              ? 'Opening and closing positions are disabled until the authenticated API and ledger can prove completed transactions. No WLD is charged on this page.'
              : '인증된 API와 원장이 실제 거래 완료를 증명할 때까지 포지션 진입과 청산을 지원하지 않습니다. 이 화면에서는 WLD가 차감되지 않습니다.'}
          </p>
          <nav aria-label={isEn ? 'Derivatives navigation' : '파생상품 이동'} className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/stocks"><ArrowLeft aria-hidden="true" className="size-4" />{isEn ? 'Stock market' : '주식 거래소'}</Link>
            </Button>
            <Button asChild variant="secondary" className="min-h-11">
              <Link href="/stocks/derivatives"><RefreshCw aria-hidden="true" className="size-4" />{isEn ? 'Check again' : '상태 다시 확인'}</Link>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}
