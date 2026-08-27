import type { Metadata } from 'next';
import { Plate, Unavailable } from '@/components/ui/plate';
import { Amount } from '@/components/posting-strip';
import { publicApi } from '@/lib/api';

// The catalogue is public, as it was in the original: someone deciding whether
// to join can see what the shop sells.
export const revalidate = 120;

export const metadata: Metadata = {
  title: '상점',
  description: '월덕 머니버스 상점에서 판매 중인 항목',
  alternates: { canonical: '/shop' },
};

interface Item {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly priceAmount: string;
}

export default async function ShopPage() {
  const data = await publicApi<{ items: Item[] }>('/api/v1/shop/items', 120);

  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">상점</h1>
      {data === null ? (
        <Unavailable>지금은 상점을 불러올 수 없어요.</Unavailable>
      ) : data.items.length === 0 ? (
        <Unavailable>판매 중인 항목이 없어요.</Unavailable>
      ) : (
        <Plate>
          <ul className="grid gap-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-[var(--muted)]">{item.description}</p>
                  )}
                </div>
                <Amount value={item.priceAmount} className="shrink-0 text-sm" />
              </li>
            ))}
          </ul>
        </Plate>
      )}
    </div>
  );
}
