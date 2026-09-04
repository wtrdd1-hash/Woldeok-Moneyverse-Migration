import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { AdminSubNav } from '@/components/admin-sub-nav';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminShopView, type AdminShopItem } from './admin-shop-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '상점 관리 · 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function AdminShopPage() {
  await requireAdminConsole();

  const data = await apiOrNull<{ items: AdminShopItem[] }>('/api/v1/admin/shop/items');
  const items = data?.items || [];

  return (
    <div className="grid gap-8 pb-16">
      <AdminSubNav />

      <PageHeader
        eyebrow="OPERATIONS · STORE 2.0"
        title={
          <>
            <T korean="상점 카탈로그 및," english="Shop Catalog &," />
            <br />
            <Accent>
              <T korean="상품 가격·재고 통제" english="Price & Stock Controls" />
            </Accent>
          </>
        }
      >
        <T
          korean="등록된 78종 상품의 실시간 가격, 판매 활성화/비활성화, 한정판 수량 잔여 재고를 즉시 수정하고 제어할 수 있습니다."
          english="Inspect and control prices, availability, and remaining stocks across all 78 registered shop items."
        />
      </PageHeader>

      <AdminShopView items={items} />
    </div>
  );
}
