import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  parseCashBalance,
  parseMarketplaceHoldings,
  parseMarketplaceListings,
} from './verified-browse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '플레이어 마켓 — 검증된 매물 현황',
  description: '실제 서버에 기록된 매물과 내 보유 아이템을 확인합니다.',
  robots: { index: false, follow: false },
};

/**
 * Read-only until the marketplace SQL uses the authoritative ledger and
 * returns replayable purchase receipts. Migration 232's buy helper changes
 * account_balances directly and returns a listing ID, not a transaction ID.
 * A frontend purchase button must never imply that this is safe settlement.
 */
export default async function MarketplacePage() {
  await requireMember();

  const [walletResponse, holdingsResponse, listingsResponse] = await Promise.all([
    apiOrNull<unknown>('/api/v1/wallet?recent=1'),
    apiOrNull<unknown>('/api/v1/shop/holdings'),
    apiOrNull<unknown>('/api/v1/marketplace/listings?limit=50'),
  ]);

  const cashBalance = parseCashBalance(walletResponse);
  const holdings = parseMarketplaceHoldings(holdingsResponse);
  const listings = parseMarketplaceListings(listingsResponse);

  return (
    <div data-page="marketplace" className="mv-page mv-page--finance grid min-w-0 gap-7 pb-12">
      <PageHeader eyebrow="PLAYER MARKETPLACE" title="플레이어 마켓 · 확인된 기록">
        서버가 확인한 매물과 내 보유 아이템만 표시합니다. 이 화면에서 실제 WLD 결제나 소유권 이전은 진행되지 않습니다.
      </PageHeader>

      <div role="status" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">
        <p className="font-bold">거래 기능은 안전성 검증 후 제공됩니다.</p>
        <p className="mt-1 text-muted-foreground">
          고정가 구매·판매, 경매, 직거래 및 제작의 결제·정산은 이 화면에서 제공하지 않습니다.
          서버 원장 기록과 재시도 영수증이 검증되기 전에는 결제 성공으로 간주하지 않습니다.
        </p>
        <Button asChild variant="outline" className="mt-3 min-h-11">
          <Link href="/shop">공식 상점으로 이동</Link>
        </Button>
      </div>

      <section aria-labelledby="marketplace-owner-title" className="grid gap-3">
        <SectionHeader eyebrow="OWNER VERIFIED" title="내 계정 기록" id="marketplace-owner-title" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="grid gap-2">
              <h3 className="text-sm font-bold">확인된 현금 잔액</h3>
              {cashBalance === null ? (
                <p role="alert" className="text-sm text-muted-foreground">지갑 조회에 실패했습니다. 잔액을 추정하지 않습니다.</p>
              ) : (
                <p className="break-all text-xl font-bold tabular-nums">{groupDigits(cashBalance)} WLD</p>
              )}
              <p className="text-xs text-muted-foreground">읽기 전용 · 거래 가능 금액을 보장하지 않습니다.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2">
              <h3 className="text-sm font-bold">확인된 보유 아이템</h3>
              {holdings === null ? (
                <p role="alert" className="text-sm text-muted-foreground">보유 목록 조회에 실패했습니다. 보유 수량을 추정하지 않습니다.</p>
              ) : (
                <p className="text-xl font-bold tabular-nums">{holdings.length}개 품목</p>
              )}
              <Button asChild variant="outline" className="min-h-11 justify-start">
                <Link href="/inventory">내 인벤토리 확인</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="marketplace-list-title" className="grid gap-3">
        <SectionHeader eyebrow="SERVER VERIFIED · READ ONLY" title="현재 등록된 매물" id="marketplace-list-title" />
        {listings === null ? (
          <EmptyState title="실제 매물 정보를 불러오지 못했어요." description="등록된 매물이 없는 상태와 API 장애는 다릅니다. 잠시 후 다시 확인해 주세요.">
            <Button asChild variant="outline" className="min-h-11"><Link href="/marketplace">매물 다시 확인</Link></Button>
          </EmptyState>
        ) : listings.length === 0 ? (
          <EmptyState title="현재 확인된 매물이 없습니다." description="서버가 반환한 매물 목록이 비어 있습니다." />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">서버에서 확인된 최근 매물 최대 50건 · 구매 기능 비활성화</p>
            <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <li key={listing.id} className="min-w-0">
                  <Card className="h-full">
                    <CardContent className="grid min-w-0 gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words font-bold">{listing.name}</h3>
                        <Badge variant="outline">{listing.category}</Badge>
                      </div>
                      {listing.description && <p className="break-words text-sm text-muted-foreground">{listing.description}</p>}
                      <dl className="grid gap-1 text-sm">
                        <div className="flex justify-between gap-3"><dt>등록 수량</dt><dd>{listing.quantity}개</dd></div>
                        <div className="flex justify-between gap-3"><dt>표시 가격</dt><dd className="break-all text-right font-semibold tabular-nums">{groupDigits(listing.priceWld)} WLD</dd></div>
                        <div className="flex justify-between gap-3"><dt>등록 시각</dt><dd className="text-right"><time dateTime={listing.createdAt}>{formatMoment(listing.createdAt)}</time></dd></div>
                      </dl>
                      <p className="text-xs font-semibold text-muted-foreground">거래 검증 대기 · 읽기 전용</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
