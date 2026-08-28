import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { PurchaseButton, SettleButton } from './business-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '게임 사업',
  robots: { index: false, follow: false },
};

interface BusinessType {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchaseCost: string;
  readonly dailyRevenue: string;
  readonly dailyOperatingCost: string;
}

interface Ownership {
  readonly ownershipId: string;
  readonly businessTypeId: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly dailyRevenue: string;
  readonly dailyOperatingCost: string;
  readonly purchasedAt: string;
  readonly lastSettlementDate: string | null;
}

export default async function BusinessesPage() {
  await requireMember();

  const [catalog, mine] = await Promise.all([
    apiOrNull<{ businessTypes: BusinessType[] }>('/api/v1/business-types'),
    apiOrNull<{ businesses: Ownership[] }>('/api/v1/businesses'),
  ]);

  const owned = new Set((mine?.businesses ?? []).map((business) => business.businessTypeId));

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="GAME ECONOMY" title="게임 사업">
        사업권, 매출, 운영비는 모두 WLD 게임 데이터입니다. 실제 사업·투자·현금 수익과 연결되지
        않습니다.
      </PageHeader>

      <section aria-labelledby="catalog-title" className="grid gap-3">
        <h2 id="catalog-title" className="text-lg">
          구입 가능한 사업
        </h2>
        {catalog === null ? (
          <EmptyState title="사업 정보를 불러오지 못했어요." />
        ) : catalog.businessTypes.length === 0 ? (
          <EmptyState title="등록된 사업이 아직 없어요." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.businessTypes.map((type) => (
              <Card key={type.id} className="justify-between gap-4">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit font-mono">
                    {type.symbol}
                  </Badge>
                  <CardTitle className="text-base">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  <Line term="구입 비용" value={type.purchaseCost} />
                  <Line term="일 매출" value={type.dailyRevenue} />
                  <Line term="일 운영비" value={type.dailyOperatingCost} />
                </CardContent>
                <CardFooter>
                  {owned.has(type.id) ? (
                    <Badge variant="outline">보유 중</Badge>
                  ) : (
                    <PurchaseButton businessTypeId={type.id} />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="mine-title" className="grid gap-3">
        <div>
          <h2 id="mine-title" className="text-lg">
            내 사업
          </h2>
          <p className="text-sm text-muted-foreground">
            하루 한 번 매출에서 운영비를 뺀 순수익을 정산할 수 있습니다.
          </p>
        </div>
        {mine === null ? (
          <EmptyState title="보유 사업을 불러오지 못했어요." />
        ) : mine.businesses.length === 0 ? (
          <EmptyState
            title="아직 보유한 사업이 없어요."
            description="사업권을 구입하면 매일 정산할 수 있습니다."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.businesses.map((business) => (
              <Card key={business.ownershipId} className="justify-between gap-4">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit font-mono">
                    {business.symbol}
                  </Badge>
                  <CardTitle className="text-base">{business.name}</CardTitle>
                  <CardDescription>
                    {formatDay(business.purchasedAt)} 구입 ·{' '}
                    {business.lastSettlementDate
                      ? `${formatDay(business.lastSettlementDate)} 마지막 정산`
                      : '아직 정산한 적이 없어요'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  <Line term="일 매출" value={business.dailyRevenue} />
                  <Line term="일 운영비" value={business.dailyOperatingCost} />
                </CardContent>
                <CardFooter>
                  <SettleButton ownershipId={business.ownershipId} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Line({ term, value }: { readonly term: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{term}</span>
      <Amount value={value} currency />
    </div>
  );
}
