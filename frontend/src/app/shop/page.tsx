import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { MyReceipts } from './my-receipts';
import { PurchaseControl } from './purchase-control';

/**
 * The catalogue is public, as it was in the original: someone deciding
 * whether to join can see what the shop sells. That is also why the page is
 * prerendered — this is one of the pages a crawler indexes.
 */
export const revalidate = 120;

export const metadata: Metadata = {
  title: '상점',
  description: '월덕 머니버스 상점에 등록된 게임 아이템과 WLD 가격',
  alternates: { canonical: '/shop' },
};

interface Item {
  readonly itemId: string;
  readonly name: string;
  readonly description: string;
  readonly price: string;
}

const PRINCIPLES = [
  '등록된 게임 아이템만 표시',
  '결제 시 서버가 가격을 다시 확인',
  '현금 교환·환전 기능 없음',
];

export default async function ShopPage() {
  const data = await publicApi<{ items: Item[] }>('/api/v1/shop/items', 120);

  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <PageHeader eyebrow="WOLDEOK MARKET · LEDGER" title={<>모은 WLD로, 우리 세계를 꾸며요.</>}>
          상점 가격과 결제 기록은 서버 경제 원장 기준으로 처리됩니다. 실제 현금 결제나 환전
          기능은 제공하지 않습니다.
        </PageHeader>
        <ul aria-label="상점 이용 원칙" className="flex flex-wrap gap-2">
          {PRINCIPLES.map((principle) => (
            <li key={principle}>
              <Badge variant="outline" className="font-normal">
                {principle}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <section aria-labelledby="catalog-title" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              CATALOG
            </p>
            <h2 id="catalog-title" className="text-lg font-medium">
              등록된 상점 목록
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            가격과 재고 판단은 브라우저가 아닌 서버에서 처리합니다.
          </p>
        </div>

        {data === null ? (
          <EmptyState
            title="지금은 상점을 불러올 수 없어요."
            description="잠시 후 다시 확인해 주세요."
          />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="지금 준비 중인 상품이에요."
            description="운영자가 실제 상품을 등록하면 이곳에 가격과 함께 표시됩니다. 임의의 상품이나 가격은 보여 주지 않아요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.items.map((item) => (
              <Card key={item.itemId} className="justify-between">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit font-normal">
                    IN-GAME ITEM
                  </Badge>
                  <CardTitle>{item.name}</CardTitle>
                  {item.description && <CardDescription>{item.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    LISTED PRICE
                  </p>
                  <p className="text-xl font-medium">
                    <Amount value={item.price} currency />
                  </p>
                </CardContent>
                <CardFooter>
                  <PurchaseControl
                    itemId={item.itemId}
                    itemName={item.name}
                    price={item.price}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <MyReceipts />
    </div>
  );
}
