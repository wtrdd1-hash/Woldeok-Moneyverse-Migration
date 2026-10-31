'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Hammer,
  PackageOpen,
  Boxes,
  Coins,
  Flame,
  Gavel,
  ArrowLeftRight,
  Award,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { CraftingPanel } from './crafting-panel';
import { MarketListingsView } from './market-listings-view';
import { AuctionView } from './auction-view';
import { DirectTradeView } from './direct-trade-view';
import { AppraisalView } from './appraisal-view';
import {
  P0_CRAFTING_RECIPES,
  type CraftingRecipe,
  type MarketListing,
} from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';

interface MarketplaceTabsProps {
  readonly initialHoldings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly categoriesList: readonly string[];
  readonly rarities: readonly string[];
}

export function MarketplaceTabs({
  initialHoldings,
  userBalanceWld,
  categoriesList: _categoriesList,
  rarities: _rarities,
}: MarketplaceTabsProps) {
  const [holdings, setHoldings] = useState<MarketplaceHolding[]>([...initialHoldings]);
  const listings: MarketListing[] = [];
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

  return (
    <div className="grid gap-6">
      {/* 4-Stat Metric Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="size-3.5 text-primary" /> 고정가 매물 조회
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-foreground">
              일시 중단
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">원장 검증 후 재개</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Flame className="size-3.5 text-amber-500" /> 24시간 거래 규모
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
              검증 대기
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">거래 원장 검증 전 표시 보류</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Hammer className="size-3.5 text-emerald-500" /> 공식 제작 레시피
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              {P0_CRAFTING_RECIPES.length} <span className="text-xs font-normal text-muted-foreground">종</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">변형·복원·각인·부스트</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Coins className="size-3.5 text-sky-500" /> 내 WLD 잔액
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-sky-600 dark:text-sky-400">
              {groupDigits(currentBalance)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">지갑 요약 기준 · 고정가 거래 중단</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
          <TabsList className="flex flex-wrap w-full sm:w-auto h-auto min-h-[44px] bg-muted/60 p-1 gap-1">
            <TabsTrigger value="market" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <ShoppingBag className="size-4" /> 고정가 거래소
            </TabsTrigger>
            <TabsTrigger value="auction" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <Gavel className="size-4 text-amber-500" /> 실시간 경매장
            </TabsTrigger>
            <TabsTrigger value="direct-trade" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <ArrowLeftRight className="size-4 text-blue-500" /> 1:1 직거래
            </TabsTrigger>
            <TabsTrigger value="appraisal" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <Award className="size-4 text-purple-500" /> 공인 감정소
            </TabsTrigger>
            <TabsTrigger value="crafting" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <Hammer className="size-4 text-emerald-500" /> 제작대
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <PackageOpen className="size-4" /> 내 등록
            </TabsTrigger>
            <TabsTrigger value="holdings" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5">
              <Boxes className="size-4" /> 보관함
            </TabsTrigger>
          </TabsList>

          <span role="status" className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
            판매 등록 점검 중
          </span>
        </div>

        <TabsContent value="market" className="pt-4 space-y-6">
          <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            원장 정산 검증 전까지 고정가 거래를 중단합니다. 검증되지 않은 시세와 예시 매물은 표시하지 않습니다.
          </p>
          <MarketListingsView
            listings={listings}
            userBalanceWld={currentBalance}
          />
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
          <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            원장 정산 검증 전까지 내 판매 등록 내역 조회를 일시 중단합니다. 실제 등록 건수가 0건이라는 뜻은 아닙니다.
          </p>
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

    </div>
  );
}
