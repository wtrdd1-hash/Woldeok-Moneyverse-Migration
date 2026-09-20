'use client';

import React, { useState } from 'react';
import { ShoppingBag, Hammer, PackageOpen, Boxes, PlusCircle, Coins, Flame, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';
import { CraftingPanel } from './crafting-panel';
import { MarketListingsView } from './market-listings-view';
import { MyListingsView } from './my-listings-view';
import { SellListingModal } from './sell-listing-modal';
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
  readonly categoriesList: readonly string[];
  readonly rarities: readonly string[];
}

export function MarketplaceTabs({
  initialHoldings,
  userBalanceWld,
  categoriesList,
  rarities,
}: MarketplaceTabsProps) {
  const [holdings, setHoldings] = useState<MarketplaceHolding[]>([...initialHoldings]);
  const [listings, setListings] = useState<MarketListing[]>([...INITIAL_MARKET_LISTINGS]);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(userBalanceWld);

  // Stats calculation
  const activeListingsCount = listings.filter((l) => l.status === 'active').length;
  const totalVolumeWld = listings
    .reduce((sum, item) => sum + BigInt(item.priceWld || '0'), 0n)
    .toString();

  // Handle successful craft
  const handleCraftSuccess = (recipe: CraftingRecipe) => {
    // Deduct fee from balance
    try {
      const newBal = BigInt(currentBalance) - BigInt(recipe.feeWld);
      setCurrentBalance(newBal > 0n ? newBal.toString() : '0');
    } catch {}

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

  // Handle successful buy
  const handleBuyListing = (boughtItem: MarketListing) => {
    // Deduct purchase price
    try {
      const newBal = BigInt(currentBalance) - BigInt(boughtItem.priceWld);
      setCurrentBalance(newBal > 0n ? newBal.toString() : '0');
    } catch {}

    // Mark listing as settled
    setListings((prev) =>
      prev.map((l) => (l.id === boughtItem.id ? { ...l, status: 'settled' } : l)),
    );

    // Add purchased item to holdings
    const purchasedHolding: MarketplaceHolding = {
      catalog_id: `buy_${Date.now()}`,
      code: boughtItem.itemCode,
      name: boughtItem.itemName,
      description: boughtItem.description,
      category: boughtItem.category,
      quantity: boughtItem.quantity,
      acquired_at: new Date().toISOString(),
      rarity: boughtItem.rarity,
      effect_kind: 'trade',
      is_equipped: false,
      serial_number: boughtItem.serialNumber,
    };

    setHoldings((prev) => [purchasedHolding, ...prev]);
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
              <ShoppingBag className="size-3.5 text-primary" /> 활성 거래 매물
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-foreground">
              {activeListingsCount} <span className="text-xs font-normal text-muted-foreground">건</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">P0 에스크로 등록 물품</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 via-background to-muted/20">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Flame className="size-3.5 text-amber-500" /> 24h 시장 규모
            </span>
            <div className="mt-2 text-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
              {groupDigits(totalVolumeWld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">1% HARD_SINK 소각 연동</p>
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
            <p className="mt-0.5 text-[11px] text-muted-foreground">거래 및 제작 즉시 사용 가능</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto h-11 bg-muted/60 p-1">
            <TabsTrigger value="market" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <ShoppingBag className="size-4" /> 거래소
            </TabsTrigger>
            <TabsTrigger value="crafting" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <Hammer className="size-4" /> 제작대
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <PackageOpen className="size-4" /> 내 등록
            </TabsTrigger>
            <TabsTrigger value="holdings" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <Boxes className="size-4" /> 보관함
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsSellModalOpen(true)}
            size="sm"
            className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-1.5 size-4" /> 내 물품 판매 등록
          </Button>
        </div>

        <TabsContent value="market" className="pt-4">
          <MarketListingsView
            listings={listings}
            userBalanceWld={currentBalance}
            onBuyListing={handleBuyListing}
            onOpenSellModal={() => setIsSellModalOpen(true)}
          />
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
