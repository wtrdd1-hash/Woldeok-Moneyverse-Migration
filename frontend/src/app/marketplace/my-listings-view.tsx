'use client';

import React, { useState } from 'react';
import { PackageOpen, XCircle, CheckCircle2 as _CheckCircle2, AlertCircle, ArrowRight as _ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDay, groupDigits } from '@/lib/money';
import type { MarketListing } from './crafting-recipes';

interface MyListingsViewProps {
  readonly listings: readonly MarketListing[];
  readonly onCancelListing: (listingId: string) => void;
  readonly onOpenSellModal?: () => void;
}

export function MyListingsView({
  listings,
  onCancelListing,
  onOpenSellModal,
}: MyListingsViewProps) {
  const [cancelingItem, setCancelingItem] = useState<MarketListing | null>(null);

  const myListings = listings.filter((l) => l.isOwn);

  const handleConfirmCancel = () => {
    if (!cancelingItem) return;
    onCancelListing(cancelingItem.id);
    setCancelingItem(null);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">내 등록 물품 관리</h2>
          <p className="text-sm text-muted-foreground">
            에스크로에 보관 중인 내 판매 등록 물품 현황입니다. 판매 취소 시 물품은 내 보관함으로 즉시 반환됩니다.
          </p>
        </div>
        {onOpenSellModal && (
          <Button onClick={onOpenSellModal} size="sm" className="bg-primary hover:bg-primary/90">
            새 물품 판매 등록
          </Button>
        )}
      </div>

      {myListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <PackageOpen className="mx-auto size-8 mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-sm">현재 판매 등록된 내 물품이 없습니다.</p>
          <p className="text-xs mt-1">보유 중인 아이템을 거래소에 등록하여 다른 모험가와 거래해 보세요.</p>
          {onOpenSellModal && (
            <Button onClick={onOpenSellModal} variant="outline" size="sm" className="mt-4">
              물품 판매 등록하기
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((item) => (
            <Card key={item.id} className="border-primary/40 bg-card shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize font-mono text-[10px]">
                    {item.category} · {item.rarity}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    {item.status === 'active' ? '판매 중 (ACTIVE)' : '정산 완료'}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1">{item.itemName}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              </CardHeader>

              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground pt-1 border-t">
                  <span>등록일: {formatDay(item.listedAt)}</span>
                  <span>수량: {item.quantity}개</span>
                </div>

                <div className="flex items-baseline justify-between rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground text-[11px]">희망 판매가</span>
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
                  onClick={() => setCancelingItem(item)}
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
                >
                  <XCircle className="mr-1.5 size-3.5" />
                  등록 취소 및 물품 반환
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={Boolean(cancelingItem)} onOpenChange={(open) => !open && setCancelingItem(null)}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="size-5" />
              판매 등록 취소 확인
            </DialogTitle>
            <DialogDescription>
              거래소 에스크로에 보관 중인 물품을 회수하고 판매를 취소합니다.
            </DialogDescription>
          </DialogHeader>

          {cancelingItem && (
            <div className="grid gap-3 py-3 text-sm">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
                <span className="font-bold text-foreground">{cancelingItem.itemName}</span>
                <p className="text-xs text-muted-foreground">가격: {groupDigits(cancelingItem.priceWld)} WLD</p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <p>• 취소 시 물품은 즉시 내 인벤토리로 안전하게 반환됩니다.</p>
                <p>• 기등록 시 지불된 등록 수수료(소각분)는 규정상 반환되지 않습니다.</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelingItem(null)}>
              유지하기
            </Button>
            <Button onClick={handleConfirmCancel} className="bg-rose-600 hover:bg-rose-700 text-white">
              등록 취소 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
