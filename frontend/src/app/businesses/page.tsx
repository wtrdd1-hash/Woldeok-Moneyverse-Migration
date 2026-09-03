import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import type { EarlyUnlock } from '@/app/progression/unlocks';
import { businessGate, businessGateNote } from '@/app/progression/unlocks';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { PurchaseButton, SettleButton } from './business-forms';
import type { EquityStanding } from './equity';
import { equityGateNote, equitySummary, meetsEquityRequirement } from './equity';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '마이비즈 (소규모 게임 사업) — 가상 사업체 운영',
  description: '월덕 머니버스 세계관 속 다양한 사업체를 인수하고 운영하여 일일 정산 수익을 창출하세요.',
  robots: { index: true, follow: true },
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

  // The ladder and the equity standing come along because 101 gates three of
  // these businesses on a job level and 105 gates every one of them on own
  // capital, and a button that submits into a refusal is the defect this screen
  // would otherwise ship: the member presses 구입, waits, and is told
  // "지금은 사업을 구입할 수 없어요" without ever learning it was the level, or
  // that the money in their wallet is the bank's. `apiOrNull` for both, so a
  // read that fails costs an explanation and not the page -- the database
  // refuses the purchase either way.
  const [catalog, mine, ladder, capital] = await Promise.all([
    apiOrNull<{ businessTypes: BusinessType[] }>('/api/v1/business-types'),
    apiOrNull<{ businesses: Ownership[] }>('/api/v1/businesses'),
    apiOrNull<{ unlocks: EarlyUnlock[] }>('/api/v1/progression/early-game'),
    apiOrNull<{ equity: EquityStanding }>('/api/v1/business-equity'),
  ]);

  const owned = new Set((mine?.businesses ?? []).map((business) => business.businessTypeId));
  const unlocks = ladder?.unlocks ?? [];
  const standing = capital?.equity ?? null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="GAME ECONOMY" title="게임 사업">
        사업권, 매출, 운영비는 모두 WLD 게임 데이터입니다. 실제 사업·투자·현금 수익과 연결되지
        않습니다.
      </PageHeader>

      <section aria-labelledby="catalog-title" className="grid gap-3">
        <div>
          <h2 id="catalog-title" className="text-lg">
            구입 가능한 사업
          </h2>
          {standing ? (
            <p className="text-sm text-muted-foreground">{equitySummary(standing)}</p>
          ) : null}
        </div>
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
                    <PurchaseButton
                      businessTypeId={type.id}
                      lockedReason={locked(unlocks, standing, type)}
                    />
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

/**
 * The sentence to show instead of an enabled purchase, or null to enable it.
 *
 * The level comes first when both hold. Both refusals are true, and the
 * database happens to raise the equity one first -- BEFORE ROW triggers fire in
 * name order (105) -- but a level is the half a member cannot fix with today's
 * balance, so it is the half worth printing.
 *
 * A standing that failed to load disables nothing, exactly as a ladder that
 * failed to load does: the database refuses either way, and a button disabled
 * by a missing read is a lock nobody can explain.
 */
function locked(
  unlocks: readonly EarlyUnlock[],
  standing: EquityStanding | null,
  type: BusinessType,
): string | null {
  const gate = businessGate(unlocks, type.symbol);
  if (gate) return businessGateNote(gate);
  if (standing && !meetsEquityRequirement(type.purchaseCost, standing)) {
    return equityGateNote(type.purchaseCost, standing);
  }
  return null;
}
