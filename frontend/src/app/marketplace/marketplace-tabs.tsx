'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Hammer,
  PackageOpen,
  Boxes,
  PlusCircle,
  Coins,
  Flame,
  Gavel,
  ArrowLeftRight,
  Award,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { CraftingPanel } from './crafting-panel';
import { MyListingsView } from './my-listings-view';
import { SellListingModal } from './sell-listing-modal';
import { VerifiedAskingSnapshot } from './verified-asking-snapshot-view';
import type { MarketplaceAskingSnapshot } from './verified-asking-snapshot';
import { AuctionView } from './auction-view';
import { DirectTradeView } from './direct-trade-view';
import { AppraisalView } from './appraisal-view';
import {
  INITIAL_MARKET_LISTINGS,
  P0_CRAFTING_RECIPES,
  type CraftingRecipe,
  type MarketListing,
} from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';

interface MarketplaceTabsProps {
  readonly initialHoldings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly walletVerified: boolean;
  readonly askingSnapshot: MarketplaceAskingSnapshot | null;
  readonly categoriesList: readonly string[];
  readonly rarities: readonly string[];
}

export function MarketplaceTabs({
  initialHoldings,
  userBalanceWld,
  walletVerified,
  askingSnapshot,
  categoriesList: _categoriesList,
  rarities: _rarities,
}: MarketplaceTabsProps) {
  const [holdings, setHoldings] = useState<MarketplaceHolding[]>([...initialHoldings]);
  const [listings, setListings] = useState<MarketListing[]>([...INITIAL_MARKET_LISTINGS]);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(userBalanceWld);

  // Handle successful craft
  const handleCraftSuccess = (recipe: CraftingRecipe) => {
    // Deduct fee from balance
    try {
      const newBal = BigInt(currentBalance) - BigInt(recipe.feeWld);
      setCurrentBalance(newBal > 0n ? newBal.toString() : '0');
    } catch {
      // Preserve the last authoritative balance when an amount is malformed.
    }

    // Add crafted item to holdings
    const newItem: MarketplaceHolding = {
      catalog_id: `crafted_${Date.now()}`,
      code: recipe.resultItem.code,
      name: recipe.resultItem.name,
      description: recipe.resultItem.description,
      category: recipe.resultItem.category,
      quantity: 1,
      acquired_at: new Date().toISOString(),
      rarity: recipe.resultItem.rarity,
      effect_kind: recipe.resultItem.effectKind,
      is_equipped: false,
      serial_number: Math.floor(Math.random() * 900) + 100,
    };

    // Deduct material quantities
    setHoldings((prev) => {
      const updated = prev.map((item) => {
        const mat = recipe.materials.find((m) => m.code === item.code);
        if (mat) {
          const newQty = Math.max(0, item.quantity - mat.requiredQuantity);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return [newItem, ...updated];
    });
  };

  // Handle create new sell listing
  const handleListingCreated = (newListing: MarketListing) => {
    setListings((prev) => [newListing, ...prev]);
    // Deduct 1 from holding
    setHoldings((prev) =>
      prev
        .map((h) => (h.code === newListing.itemCode ? { ...h, quantity: h.quantity - 1 } : h))
        .filter((h) => h.quantity > 0),
    );
  };

  // Handle cancel listing
  const handleCancelListing = (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;

    setListings((prev) => prev.filter((l) => l.id !== listingId));

    // Return item to holdings
    const restored: MarketplaceHolding = {
      catalog_id: `restored_${Date.now()}`,
      code: target.itemCode,
      name: target.itemName,
      description: target.description,
      category: target.category,
      quantity: target.quantity,
      acquired_at: new Date().toISOString(),
      rarity: target.rarity,
      effect_kind: 'trade',
      is_equipped: false,
      serial_number: target.serialNumber,
    };

    setHoldings((prev) => [restored, ...prev]);
  };

  return (
    <div className="grid gap-6">
      {/* 4-Stat Metric Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="size-3.5 text-primary" /> 조회한 활성 매물
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-foreground">
              {askingSnapshot === null ? '조회 불가' : `${askingSnapshot.count}건`}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">서버 최신 표본 최대 50건</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Flame className="size-3.5 text-amber-500" /> 등록 호가 범위
            </span>
            <div className="mt-2 break-all text-base font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
              {askingSnapshot === null ? '조회 불가' : askingSnapshot.minPriceWld === null ? '매물 없음' : `${askingSnapshot.minPriceWld} ~ ${askingSnapshot.maxPriceWld} WLD`}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">체결 거래량이 아닌 등록 가격 표본</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Hammer className="size-3.5 text-emerald-500" /> 예시 제작 레시피
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              {P0_CRAFTING_RECIPES.length} <span className="text-xs font-normal text-muted-foreground">종</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">제작 가능 여부는 별도 검증 필요</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Coins className="size-3.5 text-sky-500" /> 내 WLD 잔액
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-sky-600 dark:text-sky-400">
              {walletVerified ? <>{groupDigits(currentBalance)} <span className="text-xs font-normal text-muted-foreground">WLD</span></> : '조회 불가'}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">서버 지갑 조회 기준 · 거래 가능 여부 별도 확인</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
          <TabsList className="flex flex-wrap w-full sm:w-auto h-auto min-h-[44px] bg-muted/60 p-1 gap-1">
            <TabsTrigger value="market" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <ShoppingBag className="size-4" /> 고정가 거래소
            </TabsTrigger>
            <TabsTrigger value="auction" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <Gavel className="size-4 text-amber-500" /> 실시간 경매장
            </TabsTrigger>
            <TabsTrigger value="direct-trade" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <ArrowLeftRight className="size-4 text-blue-500" /> 1:1 직거래
            </TabsTrigger>
            <TabsTrigger value="appraisal" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <Award className="size-4 text-purple-500" /> 공인 감정소
            </TabsTrigger>
            <TabsTrigger value="crafting" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <Hammer className="size-4 text-emerald-500" /> 제작대
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <PackageOpen className="size-4" /> 내 등록
            </TabsTrigger>
            <TabsTrigger value="holdings" className="text-xs sm:text-sm font-semibold flex min-h-11 items-center gap-1.5 px-3 py-1.5">
              <Boxes className="size-4" /> 보관함
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsSellModalOpen(true)}
            size="sm"
            className="min-h-11 w-full sm:w-auto font-bold bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-1.5 size-4" /> 내 물품 판매 등록
          </Button>
        </div>

        <TabsContent value="market" className="pt-4 space-y-6">
          <VerifiedAskingSnapshot snapshot={askingSnapshot} />
          <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed">
            기존 샘플 매물의 구매·체결은 실제 원장 거래가 아니므로 이 화면에서 제공하지 않습니다.
            거래 기능은 서버 영수증 및 권한 검증을 완료한 후 별도로 제공됩니다.
          </div>
        </TabsContent>

        <TabsContent value="auction" className="pt-4">
          <AuctionView userBalanceWld={currentBalance} />
        </TabsContent>

        <TabsContent value="direct-trade" className="pt-4">
          <DirectTradeView holdings={holdings} userBalanceWld={currentBalance} />
        </TabsContent>

        <TabsContent value="appraisal" className="pt-4">
          <AppraisalView holdings={holdings} userBalanceWld={currentBalance} />
        </TabsContent>

        <TabsContent value="crafting" className="pt-4">
          <CraftingPanel
            holdings={holdings}
            userBalanceWld={currentBalance}
            onCraftSuccess={handleCraftSuccess}
          />
        </TabsContent>

        <TabsContent value="my-listings" className="pt-4">
          <MyListingsView
            listings={listings}
            onCancelListing={handleCancelListing}
            onOpenSellModal={() => setIsSellModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="holdings" className="pt-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">내 보유 인벤토리 자산 ({holdings.length}개 품목)</h3>
              <span className="text-xs text-muted-foreground">총 수량: {holdings.reduce((sum, i) => sum + i.quantity, 0)}개</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {holdings.map((item) => (
                <Card key={item.catalog_id} className="border-border/60 bg-card/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize text-[10px] font-mono">
                      {item.category}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.quantity}개 보유
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Sell Listing Modal */}
      <SellListingModal
        open={isSellModalOpen}
        onOpenChange={setIsSellModalOpen}
        holdings={holdings}
        userBalanceWld={currentBalance}
        onListingCreated={handleListingCreated}
      />
    </div>
  );
}
