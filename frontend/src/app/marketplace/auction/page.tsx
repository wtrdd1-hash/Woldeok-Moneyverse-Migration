import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '플레이어 경매 — 거래 출처 확인 중 | 월덕 머니버스',
  description: '경매 입찰과 낙찰은 원장·소유권·에스크로 검증이 완료될 때까지 이용할 수 없습니다.',
  robots: { index: false, follow: false },
};

export default async function AuctionMarketplacePage() {
  await requireMember();
  // The authenticated endpoint deliberately rejects migration-seeded sample
  // bids; never convert a 200-shaped response into verified ownership or cash.
  await apiOrNull<unknown>('/api/v1/marketplace/auctions');

  return (
    <main data-page="marketplace-auction" className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">MARKETPLACE · SOURCE STATUS</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">플레이어 경매</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          검증된 소유권과 원장 거래 증빙이 준비될 때까지 경매 조회 및 입찰을 중단합니다.
        </p>
      </header>
      <Card className="border-amber-500/40" role="alert" aria-live="polite">
        <CardHeader className="flex flex-row items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-1 size-6 shrink-0 text-amber-600" />
          <CardTitle className="text-lg leading-7">경매 거래 출처를 검증할 수 없습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7">
          <p>
            서버에 포함된 과거 예시 경매·입찰 기록은 실제 회원 보유 아이템이나
            WLD 정산의 근거가 아닙니다. 확인되지 않은 호가, 판매자, 낙찰자,
            회원 잔액 및 소각액을 표시하지 않습니다.
          </p>
          <p>
            거래 원장과 에스크로 및 소유권을 확인할 수 있을 때까지 신규 경매,
            입찰, 즉시 구매 및 자동 입찰을 이용할 수 없습니다. 이 화면에서는
            WLD가 차감되지 않습니다.
          </p>
          <nav aria-label="경매 이동" className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/marketplace"><ArrowLeft aria-hidden="true" className="size-4" />플레이어 마켓으로</Link>
            </Button>
            <Button asChild variant="secondary" className="min-h-11">
              <Link href="/marketplace/auction"><RefreshCw aria-hidden="true" className="size-4" />다시 확인</Link>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}
