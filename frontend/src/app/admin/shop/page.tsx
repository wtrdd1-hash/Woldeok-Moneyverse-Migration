import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { api } from '@/lib/api';
import { parseShopCatalog } from './shop-evidence';
import Link from 'next/link';
import { requireAdminConsole } from '@/lib/session';
import { AdminShopView } from './admin-shop-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '상점 관리 · 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function AdminShopPage() {
  await requireAdminConsole('/admin/shop');

  const data = await api<unknown>('/api/v1/admin/shop/items').catch(() => null);
  const items = parseShopCatalog(data);

  return (
    <div data-page="admin-shop" className="mv-page mv-page--admin grid gap-8 pb-16">
      <PageHeader
        eyebrow="OPERATIONS · STORE 2.0"
        title={
          <>
            <T korean="상점 카탈로그 및 " english="Shop Catalog & " />
            <br />
            <Accent>
              <T korean="상품 가격·재고 통제" english="Price & Stock Controls" />
            </Accent>
          </>
        }
      >
        <T
          korean="검증된 상점 목록의 가격, 판매 상태와 재고를 조회하고 변경할 수 있습니다."
          english="Inspect verified shop prices, availability and stock; changes require administrator verification."
        />
      </PageHeader>

      {items === null ? (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/5 p-5 text-sm">
          <p className="font-semibold">상점 목록을 확인하지 못했습니다. 상품 상태를 변경할 수 없습니다.</p>
          <Link href="/admin/shop" className="mt-3 inline-flex min-h-11 items-center rounded-md border px-4 py-2 underline underline-offset-4">다시 조회</Link>
        </div>
      ) : (
        <>
          <p role="status" className="text-sm text-muted-foreground">서버에서 확인한 상품 {items.length}종 · {items.length === 0 ? '등록된 상품이 없습니다.' : '변경 시 최근 본인 확인이 필요할 수 있습니다.'}</p>
          <AdminShopView items={items} />
        </>
      )}
    </div>
  );
}
