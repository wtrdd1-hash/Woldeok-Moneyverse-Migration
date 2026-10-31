import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Virtual real estate source status | Woldeok Moneyverse',
  description: 'Virtual landmark auctions and rental payouts are unavailable until verified ledger evidence exists.',
  robots: { index: false, follow: false },
};

export default async function RealEstatePage() {
  await requireMember();
  const isEn = (await getServerLocale()) === 'en';
  return (
    <main data-page="real-estate" className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {isEn ? 'Virtual real estate' : '가상 부동산'}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {isEn ? 'Landmark auction and rental settlement source status' : '랜드마크 경매 및 임대료 정산 출처 확인'}
        </p>
      </header>
      <Card role="status" aria-live="polite" className="border-amber-500/40">
        <CardHeader className="flex flex-row items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-1 size-6 shrink-0 text-amber-600" />
          <CardTitle className="text-lg leading-relaxed">
            {isEn ? 'Auction and rent claims are unavailable' : '경매 입찰과 임대료 수령을 이용할 수 없습니다'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7">
          <p>
            {isEn
              ? 'The service cannot verify member ownership, live bids, unclaimed rent or a completed WLD payout against an authoritative ledger. No balance or earnings are shown as confirmed.'
              : '현재 원장에서 회원별 소유 지분, 실시간 입찰, 미수령 임대료 및 WLD 지급 완료 내역을 검증할 수 없습니다. 확인되지 않은 잔액이나 수익은 표시하지 않습니다.'}
          </p>
          <p className="text-muted-foreground">
            {isEn
              ? 'The earlier landmark auction was a local simulation, not an actual transaction. No bid, purchase or rent claim can be submitted here until a verified backend contract is available.'
              : '기존 랜드마크 경매는 실제 거래가 아닌 로컬 시뮬레이션이었습니다. 검증된 서버 계약이 마련되기 전까지 이 화면에서 입찰·구매·임대료 수령을 처리하지 않습니다.'}
          </p>
          <nav aria-label={isEn ? 'Real estate navigation' : '부동산 화면 이동'} className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/wallet"><ArrowLeft aria-hidden="true" className="size-4" />{isEn ? 'Verified wallet' : '지갑 확인'}</Link>
            </Button>
            <Button asChild variant="secondary" className="min-h-11">
              <Link href="/spaces/real-estate"><RefreshCw aria-hidden="true" className="size-4" />{isEn ? 'Check again' : '상태 다시 확인'}</Link>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}
