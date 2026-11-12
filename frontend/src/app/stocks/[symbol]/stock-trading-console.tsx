'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StockOrderbook } from './stock-orderbook';
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
  readonly chartSlot?: React.ReactNode | undefined;
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
  receipt,
  chartSlot,
}: StockTradingConsoleProps) {
  const [selectedPrice, setSelectedPrice] = useState<string>(currentPrice);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [tradingTab, setTradingTab] = useState<'order' | 'conditional'>('order');
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

  const renderTradingSwitcher = () => (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/70 text-xs font-bold">
      <button
        type="button"
        onClick={() => setTradingTab('order')}
        className={`flex-1 min-h-[40px] sm:min-h-[34px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          tradingTab === 'order'
            ? 'bg-card text-foreground shadow-xs border border-border/80'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isEn ? 'Manual Order' : '호가 주문'}
      </button>
      <button
        type="button"
        onClick={() => setTradingTab('conditional')}
        className={`flex-1 min-h-[40px] sm:min-h-[34px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          tradingTab === 'conditional'
            ? 'bg-card text-foreground shadow-xs border border-border/80'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isEn ? 'Conditional (SL/TP)' : '자동 감시 (스탑로스/익절)'}
      </button>
    </div>
  );

  const renderOrderDeck = () => (
    <>
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
    </>
  );

  const gridClass = chartSlot
    ? 'grid gap-4 xl:gap-5 lg:grid-cols-[minmax(300px,1.02fr)_minmax(0,0.98fr)] xl:grid-cols-[minmax(285px,330px)_minmax(0,1fr)_minmax(310px,360px)] items-start'
    : 'grid gap-6 lg:grid-cols-[1.05fr_.95fr] items-start';

  return (
    <div className="space-y-6">
      {/* 데스크톱 3단 트레이딩 매트릭스 (좌: 호가 / 중: 차트 / 우: 주문덱) 및 반응형 1~2단 폴백 */}
      <div className={gridClass} data-testid="trading-matrix-grid">
        {chartSlot && (
          <div className="order-1 min-w-0 lg:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1">
            {chartSlot}
          </div>
        )}

        {/* 좌측 호가창 (웹소켓 실시간 틱 & 플래시 펄스 애니메이션 연동) */}
        <div
          className={
            chartSlot
              ? 'order-2 min-w-0 xl:order-none xl:col-start-1 xl:row-start-1'
              : 'min-w-0'
          }
        >
          <StockOrderbook
            stockId={stockId}
            currentPrice={currentPrice}
            dayOpenPrice={dayOpenPrice}
            isEn={isEn}
            onSelectPrice={handleSelectPrice}
          />
        </div>

        {/* 우측 주문 덱 & 마이크로 포트폴리오 (단일 인스턴스 유지, xl 이상 sticky 고정) */}
        <div
          className={
            chartSlot
              ? 'order-3 min-w-0 xl:order-none xl:col-start-3 xl:row-start-1 flex flex-col gap-4 xl:sticky xl:top-20'
              : 'min-w-0 flex flex-col gap-4'
          }
        >
          {renderOrderDeck()}

          <StockMicroPortfolio
            currentSymbol={symbol}
            currentPrice={currentPrice}
            holdingQuantity={holdingQuantity}
            isEn={isEn}
          />
        </div>
      </div>

      {/* 모바일 320px~768px 하단 고정 원터치 매수/매도 스티키 바 (Floating Bottom Action Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e17]/95 text-slate-100 backdrop-blur-md border-t border-slate-800/90 p-2.5 px-3 min-[400px]:p-3 min-[400px]:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2 min-[400px]:gap-3">
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold">{symbol} 현재가</span>
          <span className="font-mono tabular-nums text-sm font-extrabold text-slate-100 truncate">
            {groupDigits(currentPrice)} <span className="text-[10px] font-normal text-slate-400">WLD</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-[400px]:gap-2 flex-1 min-w-0 max-w-[260px]">
          <Button
            type="button"
            variant="trading-buy"
            onClick={() => handleOpenMobileOrder('buy')}
            disabled={isHalted}
            className="flex-1 min-h-[44px] h-11 rounded-xl font-bold text-xs tabular-nums shadow-sm active:scale-95 transition-all"
          >
            <ArrowUpRight className="size-3.5 mr-1 shrink-0" />
            {isEn ? 'Buy' : '매수'}
          </Button>
          <Button
            type="button"
            variant="trading-sell"
            onClick={() => handleOpenMobileOrder('sell')}
            disabled={isHalted}
            className="flex-1 min-h-[44px] h-11 rounded-xl font-bold text-xs tabular-nums shadow-sm active:scale-95 transition-all"
          >
            <ArrowDownRight className="size-3.5 mr-1 shrink-0" />
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
            {renderOrderDeck()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
