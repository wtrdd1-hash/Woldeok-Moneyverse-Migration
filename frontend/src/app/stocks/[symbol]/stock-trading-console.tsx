'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StockOrderbook } from './stock-orderbook';
import { StockOrderPanel } from './stock-order-panel';
import { groupDigits } from '@/lib/money';

interface StockTradingConsoleProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly dayOpenPrice?: string | undefined;
  readonly availableShares?: string | undefined;
  readonly holdingQuantity?: string | undefined;
  readonly isHalted?: boolean | undefined;
  readonly isEn?: boolean | undefined;
}

export function StockTradingConsole({
  stockId,
  symbol,
  name,
  currentPrice,
  dayOpenPrice,
  availableShares,
  holdingQuantity,
  isHalted = false,
  isEn = false,
}: StockTradingConsoleProps) {
  const [selectedPrice, setSelectedPrice] = useState<string>(currentPrice);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 호가창에서 특정 호가 클릭 시 단가 및 매수/매도 탭 자동 연동
  const handleSelectPrice = (price: string, targetSide: 'buy' | 'sell') => {
    setSelectedPrice(price);
    setSide(targetSide);
  };

  const handleOpenMobileOrder = (orderSide: 'buy' | 'sell') => {
    setSide(orderSide);
    setIsMobileDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 본문 2열 트레이딩 그리드 (좌측: 호가창, 우측: 주문패널) */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        {/* 좌측 호가창 */}
        <div>
          <StockOrderbook
            currentPrice={currentPrice}
            dayOpenPrice={dayOpenPrice}
            isEn={isEn}
            onSelectPrice={handleSelectPrice}
          />
        </div>

        {/* 우측 주문 패널 (데스크톱에서는 상시 표시) */}
        <div className="hidden lg:block">
          <StockOrderPanel
            stockId={stockId}
            symbol={symbol}
            name={name}
            currentPrice={currentPrice}
            availableShares={availableShares}
            holdingQuantity={holdingQuantity}
            isHalted={isHalted}
            isEn={isEn}
            selectedPrice={selectedPrice}
            activeSide={side}
            onSideChange={setSide}
          />
        </div>

        {/* 모바일 화면에서는 일반 스크롤 영역에도 주문 패널을 노출 (하단 바와 함께) */}
        <div className="block lg:hidden">
          <StockOrderPanel
            stockId={stockId}
            symbol={symbol}
            name={name}
            currentPrice={currentPrice}
            availableShares={availableShares}
            holdingQuantity={holdingQuantity}
            isHalted={isHalted}
            isEn={isEn}
            selectedPrice={selectedPrice}
            activeSide={side}
            onSideChange={setSide}
          />
        </div>
      </div>

      {/* 모바일 320px~768px 하단 고정 원터치 액션 바 (Floating Bottom Action Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-semibold">{symbol} 현재가</span>
          <span className="font-mono text-sm font-extrabold text-foreground">
            {groupDigits(currentPrice)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[260px]">
          <Button
            type="button"
            onClick={() => handleOpenMobileOrder('buy')}
            disabled={isHalted}
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <ArrowUpRight className="size-3.5 mr-1" />
            {isEn ? 'Buy' : '매수'}
          </Button>
          <Button
            type="button"
            onClick={() => handleOpenMobileOrder('sell')}
            disabled={isHalted}
            variant="destructive"
            className="flex-1 h-11 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <ArrowDownRight className="size-3.5 mr-1" />
            {isEn ? 'Sell' : '매도'}
          </Button>
        </div>
      </div>

      {/* 모바일 바텀시트 주문 모달 */}
      <Dialog open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
        <DialogContent className="max-w-md p-4 pt-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>{symbol} 원터치 빠른 주문</span>
            </DialogTitle>
          </DialogHeader>

          <StockOrderPanel
            stockId={stockId}
            symbol={symbol}
            name={name}
            currentPrice={currentPrice}
            availableShares={availableShares}
            holdingQuantity={holdingQuantity}
            isHalted={isHalted}
            isEn={isEn}
            selectedPrice={selectedPrice}
            activeSide={side}
            onSideChange={setSide}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
