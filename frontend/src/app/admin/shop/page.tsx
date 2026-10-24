import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminShopView, type AdminShopItem } from './admin-shop-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '상점 관리 · 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function AdminShopPage() {
  await requireAdminConsole('/admin/shop');

  const data = await apiOrNull<{ items: AdminShopItem[] }>('/api/v1/admin/shop/items');
  const items = data?.items || [];

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
          korean="상품 가격과 판매 상태를 관리합니다. 재고 수치는 참고용이며, 실제 구매 재고와 일치하는지 검증될 때까지 재고 수정은 중단됩니다."
          english="Manage catalog prices and sale status. Stock figures are reference-only; stock editing is paused pending inventory reconciliation."
        />
      </PageHeader>

      <AdminShopView items={items} />
    </div>
  );
}
