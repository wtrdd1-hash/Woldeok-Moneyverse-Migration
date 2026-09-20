'use client';

import React, { useState } from 'react';
import { PlusCircle, ShieldAlert, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { calculateListingFee, calculateSaleFee, calculateSellerNet, type MarketListing } from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';

interface SellListingModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly onListingCreated: (listing: MarketListing) => void;
}

export function SellListingModal({
  open,
  onOpenChange,
  holdings,
  userBalanceWld,
  onListingCreated,
}: SellListingModalProps) {
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const selectedItem = holdings.find((h) => h.catalog_id === selectedCatalogId) || null;
  const listingFee = calculateListingFee(priceInput);
  const saleFee = calculateSaleFee(priceInput);
  const netPayout = calculateSellerNet(priceInput);
  const canPayListingFee = BigInt(userBalanceWld || '0') >= BigInt(listingFee);

  const handleCreateListing = () => {
    if (!selectedItem) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessNotice(true);

      const newListing: MarketListing = {
        id: `list_${Date.now()}`,
        sellerId: 'user_current',
        sellerName: '나 (내 등록)',
        isOwn: true,
        itemCode: selectedItem.code,
        itemName: selectedItem.name,
        category: selectedItem.category,
        rarity: (selectedItem.rarity as MarketListing['rarity']) || 'common',
        quantity: 1,
        priceWld: priceInput,
        listedAt: new Date().toISOString(),
        serialNumber: selectedItem.serial_number,
        status: 'active',
        description: selectedItem.description,
      };

      onListingCreated(newListing);
    }, 1000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setSuccessNotice(false);
      setSelectedCatalogId('');
      setPriceInput('100');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="size-5 text-primary" />
            {successNotice ? '판매 등록 완료!' : '마켓플레이스 물품 판매 등록'}
          </DialogTitle>
          <DialogDescription>
            {successNotice
              ? '아이템이 거래소 에스크로에 안전하게 등록되었습니다.'
              : '보유 아이템을 선택하고 판매 희망 가격을 설정하세요.'}
          </DialogDescription>
        </DialogHeader>

        {successNotice ? (
          <div className="grid gap-4 py-4">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-2">
              <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-lg text-foreground">등록이 완료되었습니다</h3>
              <p className="text-xs text-muted-foreground">
                다른 모험가가 구매하면 판매 대금({groupDigits(netPayout)} WLD)이 지갑으로 자동 정산됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-2 text-sm">
            {/* Item Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                판매할 보유 아이템 선택
              </label>
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="">아이템을 선택해 주세요</option>
                {holdings.map((item) => (
                  <option key={item.catalog_id} value={item.catalog_id}>
                    {item.name} ({item.category}) - 보유: {item.quantity}개
                    {item.serial_number !== null ? ` [#${item.serial_number}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{selectedItem.name}</span>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {selectedItem.rarity}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">{selectedItem.description}</p>
              </div>
            )}

            {/* Price Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                판매 희망 가격 (WLD)
              </label>
              <Input
                type="number"
                min="1"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="판매 가격 입력 (예: 250)"
                className="font-mono text-sm"
              />
            </div>

            {/* Fee Calculator Box */}
            <div className="space-y-2 rounded-xl border bg-background/60 p-3.5 text-xs">
              <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                실시간 수수료 및 정산 견적
              </span>
              <ul className="divide-y divide-border/40">
                <li className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">등록 수수료 (선차감 소각)</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -{groupDigits(listingFee)} WLD
                  </span>
                </li>
                <li className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">판매 완료 시 수수료 (1% 소각)</span>
                  <span className="font-mono text-muted-foreground">
                    -{groupDigits(saleFee)} WLD
                  </span>
                </li>
                <li className="flex items-center justify-between py-2 border-t font-bold text-foreground">
                  <span>판매 시 최종 순수령액</span>
                  <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                    {groupDigits(netPayout)} WLD
                  </span>
                </li>
              </ul>
            </div>

            {!canPayListingFee && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
                <ShieldAlert className="size-4 shrink-0" />
                <span>등록 수수료({listingFee} WLD)를 지불할 WLD 잔액이 부족합니다.</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {successNotice ? (
            <Button onClick={handleClose} className="w-full">
              완료
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                취소
              </Button>
              <Button
                onClick={handleCreateListing}
                disabled={isSubmitting || !selectedItem || !canPayListingFee || Number(priceInput) <= 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> 에스크로 등록 중...
                  </>
                ) : (
                  <>
                    등록 승인 및 게시 <ArrowRight className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
