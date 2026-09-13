import type { Metadata } from 'next';
import Link from 'next/link';
import { Boxes, Hammer, ShoppingBag, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '플레이어 마켓 작업대 · 월덕 머니버스',
  description: '보유 아이템을 확인하고 향후 플레이어 거래와 제작에 사용할 재료를 준비하는 회원 전용 작업대',
  robots: { index: false, follow: false },
};

type Holding = {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly rarity: string;
  readonly effect_kind: string;
  readonly is_equipped: boolean;
  readonly serial_number: number | null;
};

export default async function MarketplacePage() {
  await requireMember();
  const data = await apiOrNull<{ holdings: Holding[] }>('/api/v1/shop/holdings');
  const holdings = data?.holdings ?? [];
  const totalUnits = holdings.reduce((sum, item) => sum + item.quantity, 0);
  const categories = new Set(holdings.map((item) => item.category)).size;
  const uniqueItems = holdings.filter((item) => item.serial_number !== null).length;

  return (
    <div className="grid gap-6 pb-16">
      <PageHeader
        eyebrow="PLAYER MARKETPLACE · WORKBENCH"
        title={<T korean="플레이어 마켓 작업대" english="Player marketplace workbench" />}
      >
        <T
          korean="현재 보유 아이템을 기준으로 거래·제작 준비 상태를 확인합니다. 실제 플레이어 간 이전과 제작 정산은 서버의 원자적 거래 계약이 완성되고 검증된 뒤 활성화됩니다."
          english="Review your current inventory for future trading and crafting. Player-to-player transfers and crafting settlement stay disabled until the atomic server contract is implemented and verified."
        />
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm"><T korean="보유 수량" english="Held units" /></CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{totalUnits.toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm"><T korean="보유 카테고리" english="Categories" /></CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{categories}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm"><T korean="고유 번호 아이템" english="Serialized items" /></CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{uniqueItems}</CardContent></Card>
      </div>

      <Card className="border-amber-500/30">
        <CardContent className="flex gap-3 p-5 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="grid gap-1">
            <strong><T korean="거래 안전 게이트" english="Trading safety gate" /></strong>
            <T
              korean="가격·소유권·에스크로·수수료·중복 요청 방지는 클라이언트가 결정하지 않습니다. 이 화면은 아직 판매 등록이나 구매 버튼을 노출하지 않습니다."
              english="Price, ownership, escrow, fees and replay protection are never client-authoritative. This screen intentionally exposes no listing or purchase mutation yet."
            />
          </div>
        </CardContent>
      </Card>

      {holdings.length === 0 ? (
        <EmptyState
          title={<T korean="보유 아이템이 없습니다." english="No held items yet." />}
          description={<T korean="상점에서 아이템을 획득하면 이 작업대에서 준비 상태를 확인할 수 있습니다." english="Acquire items in the shop to see them in this workbench." />}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {holdings.map((item) => (
            <Card key={item.catalog_id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Badge variant="outline">{item.rarity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary"><Boxes className="mr-1 h-3 w-3" />×{item.quantity}</Badge>
                  <Badge variant="secondary">{item.category}</Badge>
                  {item.serial_number !== null ? <Badge variant="secondary">#{item.serial_number}</Badge> : null}
                  {item.is_equipped ? <Badge><T korean="장착 중" english="Equipped" /></Badge> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/shop"><ShoppingBag className="mr-2 h-4 w-4" /><T korean="상점 보기" english="Open shop" /></Link></Button>
        <Button asChild variant="outline"><Link href="/shop"><Hammer className="mr-2 h-4 w-4" /><T korean="재료 준비하기" english="Prepare materials" /></Link></Button>
      </div>
    </div>
  );
}
