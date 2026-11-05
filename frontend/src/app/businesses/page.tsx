import type { Metadata } from 'next';
import { Building2, CheckCircle2, Clock, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { SupplyChainWidget } from './supply-chain-widget';
import type { EquityStanding } from './equity';
import { equityGateNote, equitySummary, meetsEquityRequirement } from './equity';
import {
  parseBusinessCatalog,
  parseBusinessOwnerships,
  parseBusinessEquity,
  parseBusinessInventory,
  parseBusinessUnlocks,
} from './business-evidence';
import type { BusinessType } from './business-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상 사업체 — 게임 내 비즈니스 운영',
  description: '월덕 머니버스 게임 안에서 다양한 가상 사업체를 설립·운영하고 정산 기록과 부스트 아이템을 확인합니다.',
  robots: { index: false, follow: false },
};

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
    apiOrNull<unknown>('/api/v1/business-types'),
    apiOrNull<unknown>('/api/v1/businesses/my-v2'),
    apiOrNull<unknown>('/api/v1/progression/early-game'),
    apiOrNull<unknown>('/api/v1/business-equity'),
    apiOrNull<unknown>('/api/v1/shop/holdings'),
  ]);

  // These are owner-scoped SQL reads. Missing evidence is not an empty portfolio.
  const verifiedCatalog = parseBusinessCatalog(catalog);
  const verifiedBusinesses = parseBusinessOwnerships(mineV2);
  const verifiedUnlocks = parseBusinessUnlocks(ladder);
  const standing = parseBusinessEquity(capital);
  const verifiedInventory = parseBusinessInventory(inventoryRes);
  const businesses = verifiedBusinesses ?? [];
  const owned = new Set(businesses.map((b) => b.businessTypeId));
  const unlocks = verifiedUnlocks ?? [];
  const userItems = verifiedInventory ?? [];
  const purchaseReady = verifiedBusinesses !== null && verifiedUnlocks !== null && standing !== null;

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
        게임 내 사업체와 일일 정산 예상액을 확인합니다. 실제 지급·소각 여부는 서버의 정산 영수증을 기준으로 확인해 주세요.
        조회가 실패한 정보는 보유 수량이나 거래 가능 상태로 추정하지 않습니다.
      </PageHeader>

      {(verifiedBusinesses === null || verifiedCatalog === null || verifiedUnlocks === null || standing === null || verifiedInventory === null) && (
        <div role="alert" aria-live="polite" className="flex flex-col gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>일부 사업체·보유·자기자본 정보를 확인할 수 없습니다. 확인되지 않은 목록을 비어 있다고 표시하지 않으며 구입·설립은 제한됩니다.</p>
          <Button asChild variant="outline" className="min-h-11 shrink-0">
            <a href="/businesses">다시 조회</a>
          </Button>
        </div>
      )}

      {/* Only verified owner rows may contribute to the portfolio totals. */}
      {businesses.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <span className="text-xs font-bold tracking-wider text-primary uppercase flex items-center gap-1.5">
                <Building2 className="size-4" /> 내 사업체 포트폴리오 요약
              </span>
              <h2 className="text-2xl font-black mt-1 text-foreground">
                확인된 사업체 {businesses.length}개
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {unsettledCount > 0 ? (
                <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                  <Clock className="size-3.5" /> 오늘 정산 대기 {unsettledCount}건
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> 오늘 정산 대상 모두 처리됨
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="size-3.5 text-emerald-500" /> 일일 매출 예상액
              </span>
              <p className="text-xl font-black font-mono mt-1 text-emerald-500">
                +{groupDigits(totalDailyGross.toString())} WLD
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-rose-500" /> 일일 운영비 예상액
              </span>
              <p className="text-xl font-black font-mono mt-1 text-rose-500">
                -{groupDigits(totalDailyCost.toString())} WLD
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
              <span className="text-xs text-primary font-bold flex items-center gap-1">
                <Sparkles className="size-3.5" /> 일일 순수익 예상액
              </span>
              <p className="text-xl font-black font-mono mt-1 text-primary">
                +{groupDigits(totalDailyNet.toString())} WLD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 서플라이 체인 및 원자재 B2B 조달 루프 위젯 */}
      {verifiedBusinesses !== null && businesses[0] ? (
        <SupplyChainWidget
          businessId={businesses[0].ownershipId}
          businessName={businesses[0].name}
          businessSymbol={businesses[0].symbol}
        />
      ) : null}

      {/* 1. 인벤토리 내 보유 사업 라이선스 (설립 대기) */}
      {verifiedBusinesses !== null && licenseItems.length > 0 && (
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
            내 사업체 {verifiedBusinesses === null ? '(조회 불가)' : `(${businesses.length}개 확인됨)`}
          </h2>
          <p className="text-sm text-muted-foreground">
            매일 한 번 일일 정산 버튼을 눌러 매출 WLD를 수령하고 운영비를 소각 정산하세요. (매일 00:00 KST 갱신)
          </p>
        </div>

        {verifiedBusinesses === null ? (
          <EmptyState title="사업체 보유 내역을 확인할 수 없습니다." description="잠시 후 다시 조회해 주세요. 현재는 보유 내역이 없다고 판단할 수 없습니다." />
        ) : businesses.length === 0 ? (
          <EmptyState
            title="확인된 사업체가 아직 없어요."
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
                      {verifiedInventory !== null && business.status === 'active' ? (
                        <ApplyBoostModalButton
                          ownershipId={business.ownershipId}
                          businessName={business.name}
                          boostItems={boostItems}
                          activeBoost={boost}
                        />
                      ) : null}
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
                    {business.status === 'active' ? (
                      <SettleV2Button
                        ownershipId={business.ownershipId}
                        isSettledToday={business.isSettledToday}
                      />
                    ) : <Badge variant="outline">현재 정산할 수 없는 사업체</Badge>}
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

        {verifiedCatalog === null ? (
          <EmptyState title="사업 정보를 불러오지 못했어요." />
        ) : verifiedCatalog.length === 0 ? (
          <EmptyState title="등록된 사업이 아직 없어요." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verifiedCatalog.map((type) => (
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
                      lockedReason={!purchaseReady ? '보유 사업체·자기자본·해금 상태 확인 후 구입할 수 있습니다.' : locked(unlocks, standing, type)}
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
