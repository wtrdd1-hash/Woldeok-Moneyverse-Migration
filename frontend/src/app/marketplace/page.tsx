import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { parseVerifiedMarketplaceListings } from './marketplace-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '플레이어 마켓 — 거래 근거 확인',
  description: '실제 거래소에 등록된 활성 매물을 확인합니다. 거래 기능은 정산 검증 전까지 제공하지 않습니다.',
  robots: { index: false, follow: false },
};

export default async function MarketplacePage() {
  await requireMember();
  const response = await apiOrNull<unknown>('/api/v1/marketplace/listings?limit=50');
  const listings = parseVerifiedMarketplaceListings(response);

  return (
    <main data-page="marketplace" className="mv-page mx-auto grid max-w-6xl gap-6 px-4 pb-16">
      <PageHeader eyebrow="PLAYER MARKETPLACE · VERIFIED READ" title="플레이어 마켓 — 거래 근거 확인">
        <p>거래소에 등록된 매물은 인증된 서버 조회 결과로만 표시합니다. 매입·판매·경매·제작은 실제 결제 및 아이템 영수증 검증이 완료될 때까지 이 화면에서 제공하지 않습니다.</p>
      </PageHeader>
      <section aria-labelledby="marketplace-listings-title" className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="marketplace-listings-title" className="text-lg font-bold">확인된 활성 매물</h2>
          <Link href="/marketplace" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</Link>
        </div>
        {listings === null ? (
          <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">매물 정보를 조회할 수 없습니다. 매물이 없다는 의미는 아니며, 서버 및 데이터베이스 확인 후 다시 시도해 주세요.</p>
        ) : listings.length === 0 ? (
          <p role="status" className="rounded-lg border border-border p-4 text-sm">현재 조회 결과에서 확인된 활성 매물이 없습니다.</p>
        ) : (
          <>
            <p role="status" className="text-sm text-muted-foreground">조회된 활성 매물 {listings.length}건 (최대 50건). 가격은 조회 당시 참고 정보이며 거래 확약이 아닙니다.</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item) => (
                <li key={item.id} className="min-w-0 space-y-2 rounded-xl border border-border p-4">
                  <h3 className="break-words font-semibold">{item.itemName}</h3>
                  <p className="text-sm text-muted-foreground">등록 수량: {item.quantity}개</p>
                  <p className="text-sm font-semibold tabular-nums">등록 가격: {groupDigits(item.priceWld)} WLD</p>
                  <p className="text-xs text-muted-foreground">읽기 전용 · 거래 기능 점검 중</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <p className="text-sm text-muted-foreground">회원 WLD 잔액, 소유 아이템, 거래량 및 거래 완료 내역은 이 화면에서 임의로 생성하거나 추정하지 않습니다.</p>
    </main>
  );
}
