import type { Metadata } from 'next';
import { Building2, CheckCircle2, Clock, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import type { EarlyUnlock } from '@/app/progression/unlocks';
import { businessGate, businessGateNote } from '@/app/progression/unlocks';
import { formatDay, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import {
  ActivateLicenseButton,
  ApplyBoostModalButton,
  PurchaseButton,
  SettleV2Button,
} from './business-forms';
import type { EquityStanding } from './equity';
import { equityGateNote, equitySummary, meetsEquityRequirement } from './equity';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 사업체 — 게임 내 비즈니스 운영',
  description: '월덕 머니버스 게임 안에서 다양한 가상 사업체를 설립·운영하고 정산 기록과 부스트 아이템을 확인합니다.',
  alternates: { canonical: canonicalUrl('/businesses') },
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

interface OwnershipV2 {
  readonly ownershipId: string;
  readonly businessTypeId: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchaseCost: string;
  readonly dailyRevenue: string;
  readonly dailyOperatingCost: string;
  readonly purchasedAt: string;
  readonly lastSettlementDate: string | null;
  readonly isSettledToday: boolean;
  readonly boostActive: Record<string, unknown> | null;
  readonly status: string;
}

interface InventoryItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
}

const LICENSE_NAMES: Readonly<Record<string, string>> = {
  biz_cvs_license: '24시 편의점 사업체',
  biz_farm_license: '유기농 스마트 농장',
  biz_logistics_license: '스마트 운송 물류센터',
};

function locked(
  unlocks: readonly EarlyUnlock[],
  standing: EquityStanding | null,
  type: BusinessType,
): string | null {
  const gate = businessGate(unlocks, type.symbol);
  if (gate !== null) {
    return businessGateNote(gate);
  }
  if (standing !== null && !meetsEquityRequirement(type.purchaseCost, standing)) {
    return equityGateNote(type.purchaseCost, standing);
  }
  return null;
}

export default async function BusinessesPage() {
  await requireMember();

  const [catalog, mineV2, ladder, capital, inventoryRes] = await Promise.all([
    apiOrNull<{ businessTypes: BusinessType[] }>('/api/v1/business-types'),
    apiOrNull<{ businesses: OwnershipV2[] }>('/api/v1/businesses/my-v2'),
    apiOrNull<{ unlocks: EarlyUnlock[] }>('/api/v1/progression/early-game'),
    apiOrNull<{ equity: EquityStanding }>('/api/v1/business-equity'),
    apiOrNull<{ inventory: InventoryItem[] }>('/api/v1/shop/inventory'),
  ]);

  const businesses = mineV2?.businesses ?? [];
  const owned = new Set(businesses.map((b) => b.businessTypeId));
  const unlocks = ladder?.unlocks ?? [];
  const standing = capital?.equity ?? null;
  const userItems = inventoryRes?.inventory ?? [];

  // Filter licenses and boost items in inventory
  const licenseItems = userItems.filter(
    (item) => item.quantity > 0 && item.code in LICENSE_NAMES,
  );
  const boostItems = userItems
    .filter((item) => item.quantity > 0 && item.code.startsWith('biz_') && !item.code.endsWith('_license'))
    .map((item) => ({
      code: item.code,
      name: item.name,
      quantity: item.quantity,
    }));

  // Aggregate daily financials
  let totalDailyGross = BigInt(0);
  let totalDailyCost = BigInt(0);
  let unsettledCount = 0;

  for (const b of businesses) {
    totalDailyGross += BigInt(b.dailyRevenue);
    totalDailyCost += BigInt(b.dailyOperatingCost);
    if (!b.isSettledToday) {
      unsettledCount += 1;
    }
  }
  const totalDailyNet = totalDailyGross - totalDailyCost;

  return (
    <div data-page="businesses" className="mv-page mv-page--finance grid gap-8 pb-12">
      <PageHeader eyebrow="BUSINESS ECONOMY 2.0" title="가상 사업체 및 일일 정산">
        상점에서 라이선스를 획득하여 사업체를 설립하고, 전문 소모품 부스트를 장착하여 일일 순수익을 극대화하세요.
        일일 매출은 SYSTEM_MINT에서 지급되며, 운영비는 SYSTEM_SINK로 소각되는 안전한 복식부기 가상 경제입니다.
      </PageHeader>

      {/* Toss-style Business Executive Summary Card */}
      {businesses.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <span className="text-xs font-bold tracking-wider text-primary uppercase flex items-center gap-1.5">
                <Building2 className="size-4" /> 내 사업체 포트폴리오 요약
              </span>
              <h2 className="text-2xl font-black mt-1 text-foreground">
                총 {businesses.length}개 사업장 운영 중
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {unsettledCount > 0 ? (
                <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                  <Clock className="size-3.5" /> 오늘 정산 대기 {unsettledCount}건
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> 오늘 모든 정산 완료
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="size-3.5 text-emerald-500" /> 일일 총 매출
              </span>
              <p className="text-xl font-black font-mono mt-1 text-emerald-500">
                +{groupDigits(totalDailyGross.toString())} WLD
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-rose-500" /> 일일 총 운영비 (소각)
              </span>
              <p className="text-xl font-black font-mono mt-1 text-rose-500">
                -{groupDigits(totalDailyCost.toString())} WLD
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
              <span className="text-xs text-primary font-bold flex items-center gap-1">
                <Sparkles className="size-3.5" /> 일일 예상 순수익
              </span>
              <p className="text-xl font-black font-mono mt-1 text-primary">
                +{groupDigits(totalDailyNet.toString())} WLD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. 인벤토리 내 보유 사업 라이선스 (설립 대기) */}
      {licenseItems.length > 0 && (
        <section aria-labelledby="licenses-title" className="grid gap-4">
          <h2 id="licenses-title" className="text-xl font-bold flex items-center gap-2">
            인벤토리 보유 사업 라이선스 (즉시 설립 가능)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {licenseItems.map((lic) => {
              const bizName = LICENSE_NAMES[lic.code] ?? lic.name;
              return (
                <Card key={lic.id} className="border-primary/40 bg-primary/5 shadow-md rounded-2xl">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-primary/20 text-primary border-primary/30">
                      라이선스 보유
                    </Badge>
                    <CardTitle className="text-base mt-2">{lic.name}</CardTitle>
                    <CardDescription className="text-xs">{lic.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <ActivateLicenseButton
                      catalogCode={lic.code}
                      businessName={bizName}
                      quantity={lic.quantity}
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. 내 사업체 목록 (부스트 및 일일 정산 v2) */}
      <section aria-labelledby="mine-title" className="grid gap-4">
        <div>
          <h2 id="mine-title" className="text-xl font-bold flex items-center gap-2">
            내 사업체 ({businesses.length}개 운영 중)
          </h2>
          <p className="text-sm text-muted-foreground">
            매일 한 번 일일 정산 버튼을 눌러 매출 WLD를 수령하고 운영비를 소각 정산하세요. (매일 00:00 KST 갱신)
          </p>
        </div>

        {businesses.length === 0 ? (
          <EmptyState
            title="아직 운영 중인 사업체가 없어요."
            description="상점 2.0에서 사업권 라이선스를 구매하거나 아래 구입 가능한 사업을 인수하세요."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => {
              const boost = business.boostActive;
              const hasBoost = boost && boost.name;
              const gross = business.dailyRevenue;
              const cost = business.dailyOperatingCost;
              const net = (BigInt(gross) - BigInt(cost)).toString();

              return (
                <Card
                  key={business.ownershipId}
                  className="flex flex-col justify-between border-border/80 bg-card shadow-md transition-all hover:shadow-lg backdrop-blur-sm rounded-2xl"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="font-mono text-xs font-bold">
                        {business.symbol}
                      </Badge>
                      <ApplyBoostModalButton
                        ownershipId={business.ownershipId}
                        businessName={business.name}
                        boostItems={boostItems}
                        activeBoost={boost}
                      />
                    </div>
                    <CardTitle className="text-lg mt-2 font-black">{business.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatDay(business.purchasedAt)} 설립 ·{' '}
                      {business.lastSettlementDate
                        ? `${formatDay(business.lastSettlementDate)} 마지막 정산`
                        : '아직 정산한 적 없음'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-3 text-xs py-2">
                    {hasBoost ? (
                      <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-[11px] flex items-center justify-between">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <Sparkles className="size-3.5" /> {String(boost.name)}
                        </span>
                        <span className="text-muted-foreground">
                          {String(boost.expires_at).slice(5, 10)} 만료
                        </span>
                      </div>
                    ) : null}

                    <div className="rounded-2xl bg-muted/40 p-3.5 grid gap-2 border border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">일일 매출</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          +{groupDigits(gross)} WLD
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">일일 운영비 (소각)</span>
                        <span className="font-mono font-medium text-rose-700 dark:text-rose-300">
                          -{groupDigits(cost)} WLD
                        </span>
                      </div>
                      <div className="border-t border-border/60 pt-2 flex justify-between items-center font-bold text-sm">
                        <span>일일 순수익</span>
                        <span className="font-mono text-primary font-black">
                          +{groupDigits(net)} WLD
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <SettleV2Button
                      ownershipId={business.ownershipId}
                      isSettledToday={business.isSettledToday}
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. 구입 가능한 사업체 카탈로그 */}
      <section aria-labelledby="catalog-title" className="grid gap-4">
        <div>
          <h2 id="catalog-title" className="text-xl font-bold flex items-center gap-2">
            사업체 인수 카탈로그
          </h2>
          {standing ? (
            <p className="text-xs text-muted-foreground mt-1">{equitySummary(standing)}</p>
          ) : null}
        </div>

        {catalog === null ? (
          <EmptyState title="사업 정보를 불러오지 못했어요." />
        ) : catalog.businessTypes.length === 0 ? (
          <EmptyState title="등록된 사업이 아직 없어요." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.businessTypes.map((type) => (
              <Card key={type.id} className="flex flex-col justify-between border-border/70 rounded-2xl">
                <CardHeader className="pb-2">
                  <Badge variant="secondary" className="w-fit font-mono text-xs">
                    {type.symbol}
                  </Badge>
                  <CardTitle className="text-base mt-2 font-bold">{type.name}</CardTitle>
                  <CardDescription className="text-xs">{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-xs py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">인수 비용</span>
                    <span className="font-mono font-bold text-foreground">
                      {groupDigits(type.purchaseCost)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">일일 매출</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-300">
                      +{groupDigits(type.dailyRevenue)} WLD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">일일 운영비</span>
                    <span className="font-mono text-rose-700 dark:text-rose-300">
                      -{groupDigits(type.dailyOperatingCost)} WLD
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  {owned.has(type.id) ? (
                    <Badge variant="outline" className="w-full justify-center py-2.5 min-h-11 rounded-xl">
                      이미 운영 중
                    </Badge>
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
    </div>
  );
}
