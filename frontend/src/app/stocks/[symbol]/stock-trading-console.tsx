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
import { VerifiedStockDepth, type StockDepthAvailability } from './verified-stock-depth';
import { StockOrderPanel } from './stock-order-panel';
import { StockMicroPortfolio } from './stock-micro-portfolio';
import { StockConditionalOrders } from './stock-conditional-orders';
import type { StockHaltReceiptData } from './stock-halt-receipt-dialog';
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
  readonly receipt?: StockHaltReceiptData | null | undefined;
  readonly depthStatus?: StockDepthAvailability | null | undefined;
}

export function StockTradingConsole({
  stockId,
  symbol,
  name,
  currentPrice,
  availableShares,
  holdingQuantity,
  isHalted = false,
  isEn = false,
  receipt,
  depthStatus = null,
}: StockTradingConsoleProps) {
  const selectedPrice = currentPrice;
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [tradingTab, setTradingTab] = useState<'order' | 'conditional'>('order');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleOpenMobileOrder = (orderSide: 'buy' | 'sell') => {
    setSide(orderSide);
    setIsMobileDrawerOpen(true);
  };

  const renderTradingSwitcher = () => (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/70 text-xs font-bold">
      <button
        type="button"
        onClick={() => setTradingTab('order')}
        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          tradingTab === 'order'
            ? 'bg-card text-foreground shadow-xs border border-border/80'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isEn ? 'Manual Order' : '직접 주문'}
      </button>
      <button
        type="button"
        onClick={() => setTradingTab('conditional')}
        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          tradingTab === 'conditional'
            ? 'bg-card text-foreground shadow-xs border border-border/80'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isEn ? 'Conditional (SL/TP)' : '자동 감시 (스탑로스/익절)'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 본문 2열 트레이딩 그리드 (좌측: 검증 상태, 우측: 주문패널) */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        {/* 검증된 주문 잔량이 없으면 허위 매수/매도 잔량을 표시하지 않는다 */}
        <div>
          <VerifiedStockDepth
            currentPrice={currentPrice}
            status={depthStatus}
            isEn={isEn}
          />
        </div>

        {/* 우측 주문 패널 (데스크톱에서는 상시 표시) */}
        <div className="hidden lg:flex flex-col gap-4">
          {renderTradingSwitcher()}

          {tradingTab === 'order' ? (
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
              receipt={receipt}
            />
          ) : (
            <StockConditionalOrders
              stockId={stockId}
              symbol={symbol}
              name={name}
              currentPrice={currentPrice}
              holdingQuantity={holdingQuantity}
              isHalted={isHalted}
              isEn={isEn}
            />
          )}

          <StockMicroPortfolio
            currentSymbol={symbol}
            currentPrice={currentPrice}
            holdingQuantity={holdingQuantity}
            isEn={isEn}
          />
        </div>

        {/* 모바일 화면에서는 일반 스크롤 영역에도 주문 패널을 노출 (하단 바와 함께) */}
        <div className="flex flex-col gap-4 lg:hidden">
          {renderTradingSwitcher()}

          {tradingTab === 'order' ? (
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
              receipt={receipt}
            />
          ) : (
            <StockConditionalOrders
              stockId={stockId}
              symbol={symbol}
              name={name}
              currentPrice={currentPrice}
              holdingQuantity={holdingQuantity}
              isHalted={isHalted}
              isEn={isEn}
            />
          )}

          <StockMicroPortfolio
            currentSymbol={symbol}
            currentPrice={currentPrice}
            holdingQuantity={holdingQuantity}
            isEn={isEn}
          />
        </div>
      </div>

      {/* 모바일 320px~768px 하단 고정 원터치 액션 바 (Floating Bottom Action Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 p-2.5 px-3 min-[400px]:p-3 min-[400px]:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2 min-[400px]:gap-3">
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-[10px] text-muted-foreground font-semibold">{symbol} 현재가</span>
          <span className="font-mono text-sm font-extrabold text-foreground truncate">
            {groupDigits(currentPrice)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-[400px]:gap-2 flex-1 min-w-0 max-w-[260px]">
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

          <div className="space-y-4">
            {renderTradingSwitcher()}

            {tradingTab === 'order' ? (
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
                receipt={receipt}
              />
            ) : (
              <StockConditionalOrders
                stockId={stockId}
                symbol={symbol}
                name={name}
                currentPrice={currentPrice}
                holdingQuantity={holdingQuantity}
                isHalted={isHalted}
                isEn={isEn}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
