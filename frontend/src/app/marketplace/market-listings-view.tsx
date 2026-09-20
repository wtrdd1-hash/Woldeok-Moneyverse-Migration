'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDay, groupDigits } from '@/lib/money';
import { calculateSaleFee, type MarketListing } from './crafting-recipes';

interface MarketListingsViewProps {
  readonly listings: readonly MarketListing[];
  readonly userBalanceWld: string;
  readonly onBuyListing?: (listing: MarketListing) => void;
  readonly onOpenSellModal?: () => void;
}

export function MarketListingsView({
  listings,
  userBalanceWld,
  onBuyListing,
  onOpenSellModal,
}: MarketListingsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buySuccessItem, setBuySuccessItem] = useState<MarketListing | null>(null);

  const categories = ['all', 'frame', 'display', 'business', 'material', 'nameplate'];

  const filtered = listings.filter((item) => {
    if (item.status !== 'active') return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchTerm) {
      const needle = searchTerm.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(needle) ||
        item.sellerName.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return Number(BigInt(a.priceWld) - BigInt(b.priceWld));
    }
    if (sortBy === 'price_desc') {
      return Number(BigInt(b.priceWld) - BigInt(a.priceWld));
    }
    return Date.parse(b.listedAt) - Date.parse(a.listedAt);
  });

  const handleStartBuy = (item: MarketListing) => {
    setSelectedListing(item);
    setBuySuccessItem(null);
  };

  const handleExecuteBuy = () => {
    if (!selectedListing) return;
    setIsBuying(true);

    setTimeout(() => {
      setIsBuying(false);
      setBuySuccessItem(selectedListing);
      if (onBuyListing) {
        onBuyListing(selectedListing);
      }
    }, 1200);
  };

  const userBalanceBig = BigInt(userBalanceWld || '0');
  const selectedPriceBig = selectedListing ? BigInt(selectedListing.priceWld) : 0n;
  const canAfford = userBalanceBig >= selectedPriceBig;
  const balanceAfterBuy = canAfford ? (userBalanceBig - selectedPriceBig).toString() : '0';
  const saleFee = selectedListing ? calculateSaleFee(selectedListing.priceWld) : '0';

  return (
    <div className="grid gap-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="아이템명, 판매자 검색..."
              className="pl-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            aria-label="카테고리 필터"
          >
            <option value="all">전체 카테고리</option>
            <option value="frame">프레임</option>
            <option value="display">전시품</option>
            <option value="business">사업체 부스트</option>
            <option value="material">재료</option>
            <option value="nameplate">네임플레이트</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
            aria-label="정렬 기준"
          >
            <option value="newest">최신 등록순</option>
            <option value="price_asc">낮은 가격순</option>
            <option value="price_desc">높은 가격순</option>
          </select>

          {onOpenSellModal && (
            <Button onClick={onOpenSellModal} size="sm" className="bg-primary hover:bg-primary/90">
              물품 판매 등록
            </Button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <ShoppingBag className="mx-auto size-8 mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-sm">조건에 맞는 거래소 매물이 없습니다.</p>
          <p className="text-xs mt-1">검색어나 카테고리 필터를 변경해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col justify-between border transition-all duration-200 hover:shadow-md ${
                item.isOwn ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-1">
                  <Badge
                    variant={
                      item.rarity === 'legendary'
                        ? 'default'
                        : item.rarity === 'epic'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="capitalize font-mono text-[10px]"
                  >
                    {item.category} · {item.rarity}
                  </Badge>
                  {item.serialNumber !== null && (
                    <Badge variant="outline" className="font-mono text-[10px] text-amber-500 border-amber-500/30">
                      #{item.serialNumber}
                    </Badge>
                  )}
                  {item.isOwn && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                      내 매물
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1">{item.itemName}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {item.sellerName}
                  </span>
                  <span>{formatDay(item.listedAt)}</span>
                </div>

                <div className="flex items-baseline justify-between rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground text-[11px]">판매 가격</span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-foreground font-mono">
                      {groupDigits(item.priceWld)}
                    </span>{' '}
                    <span className="text-[11px] font-medium text-muted-foreground">WLD</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  onClick={() => handleStartBuy(item)}
                  disabled={item.isOwn}
                  variant={item.isOwn ? 'outline' : 'default'}
                  className="w-full text-xs font-semibold"
                >
                  <ShoppingBag className="mr-1.5 size-3.5" />
                  {item.isOwn ? '내가 등록한 물품' : '구매하기'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Buy Confirmation & Result Dialog */}
      <Dialog
        open={Boolean(selectedListing)}
        onOpenChange={(open) => {
          if (!open && !isBuying) {
            setSelectedListing(null);
            setBuySuccessItem(null);
          }
        }}
      >
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              {buySuccessItem ? '구매 완료!' : '아이템 구매 확인'}
            </DialogTitle>
            <DialogDescription>
              {buySuccessItem
                ? '아이템 소유권이 이전되었으며 인벤토리로 안전하게 지급되었습니다.'
                : '원자적 거래 계약에 따라 판매 대금을 결제하고 아이템을 인수합니다.'}
            </DialogDescription>
          </DialogHeader>

          {buySuccessItem ? (
            <div className="grid gap-4 py-4">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-2">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-lg text-foreground">{buySuccessItem.itemName}</h3>
                <p className="text-xs text-muted-foreground">
                  판매자 {buySuccessItem.sellerName}님에게 정산이 완료되었습니다.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                    인벤토리 보관 완료
                  </Badge>
                </div>
              </div>
            </div>
          ) : selectedListing ? (
            <div className="grid gap-4 py-3 text-sm">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{selectedListing.itemName}</span>
                  <Badge variant="secondary" className="capitalize text-xs font-mono">
                    {selectedListing.rarity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{selectedListing.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>판매자: {selectedListing.sellerName}</span>
                  <span>수량: {selectedListing.quantity}개</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground block">원장 정산 견적</span>
                <ul className="divide-y rounded-lg border bg-background/50 px-3">
                  <li className="flex items-center justify-between py-2">
                    <span>현재 보유 잔액</span>
                    <span className="font-mono font-bold">{groupDigits(userBalanceWld)} WLD</span>
                  </li>
                  <li className="flex items-center justify-between py-2 text-rose-500 font-semibold">
                    <span>결제 금액 (아이템 가격)</span>
                    <span className="font-mono">-{groupDigits(selectedListing.priceWld)} WLD</span>
                  </li>
                  <li className="flex items-center justify-between py-2 text-muted-foreground">
                    <span>인플레이션 억제 소각액 (1%)</span>
                    <span className="font-mono">{groupDigits(saleFee)} WLD (판매자 부담)</span>
                  </li>
                  <li className="flex items-center justify-between py-2 font-bold text-foreground border-t">
                    <span>구매 후 예상 잔액</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {groupDigits(balanceAfterBuy)} WLD
                    </span>
                  </li>
                </ul>
              </div>

              {!canAfford && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>WLD 잔액이 부족하여 구매할 수 없습니다. (부족: {groupDigits((selectedPriceBig - userBalanceBig).toString())} WLD)</span>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 p-2.5 text-xs text-sky-700 dark:text-sky-300 border border-sky-500/20">
                <ShieldCheck className="size-4 shrink-0" />
                <span>원자적 에스크로: 결제 실패 시 잔액은 100% 보존되며 아이템은 판매자에게 안전 복구됩니다.</span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            {buySuccessItem ? (
              <Button onClick={() => setSelectedListing(null)} className="w-full">
                확인
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedListing(null)}
                  disabled={isBuying}
                >
                  취소
                </Button>
                <Button
                  onClick={handleExecuteBuy}
                  disabled={isBuying || !canAfford}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> 정산 처리 중...
                    </>
                  ) : (
                    <>
                      구매 확정 <ArrowRight className="ml-1 size-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
