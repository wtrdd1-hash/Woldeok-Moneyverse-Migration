'use client';

import React, { useState } from 'react';
import { Zap, ArrowDownUp, CheckCircle2, Calculator } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

interface QuickOrderbookSimulatorProps {
  readonly currentPrice?: number;
  readonly symbol?: string;
}

export function QuickOrderbookSimulator({
  currentPrice = 1450,
  symbol = 'WDG',
}: QuickOrderbookSimulatorProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(50);
  const [isExecuted, setIsExecuted] = useState<boolean>(false);

  const presets = [10, 50, 100, 500];
  const grossAmount = currentPrice * quantity;
  const taxRate = side === 'sell' ? 0.002 : 0; // 매도 시 거래세 0.2%
  const feeRate = 0.0005; // 0.05% 가상 수수료
  const taxAmount = Math.floor(grossAmount * taxRate);
  const feeAmount = Math.floor(grossAmount * feeRate);
  const netAmount = side === 'buy' ? grossAmount + feeAmount : grossAmount - taxAmount - feeAmount;

  const handleSimulateTrade = () => {
    setIsExecuted(true);
    setTimeout(() => {
      setIsExecuted(false);
    }, 2500);
  };

  return (
    <Card className="rounded-2xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <T korean="1-Tap 퀵 호가 체결 계산기" english="1-Tap Quick Order Simulator" japanese="1タップ即時約定計算機" chinese="一键闪电撮合模拟器" />
                <Badge variant="outline" className="text-[9px] font-mono text-amber-400 border-amber-500/30">
                  {symbol}
                </Badge>
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/60 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                side === 'buy' ? 'bg-rose-500 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                side === 'sell' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              매도
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3.5 space-y-3">
        {/* 수량 프리셋 칩 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {presets.map((qty) => (
            <Button
              key={qty}
              variant={quantity === qty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuantity(qty)}
              className="text-xs h-7 px-3 rounded-lg font-mono font-bold shrink-0"
            >
              {qty}주
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(1000)}
            className="text-xs h-7 px-3 rounded-lg font-mono font-bold shrink-0 text-amber-400 border-amber-500/30"
          >
            All-in
          </Button>
        </div>

        {/* 체결 예상액 디테일 */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-muted-foreground">
            <span>기준 단가:</span>
            <span>{currentPrice.toLocaleString()} WLD</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>주문 수량:</span>
            <span>{quantity.toLocaleString()}주</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>거래세 & 수수료:</span>
            <span>-{(taxAmount + feeAmount).toLocaleString()} WLD</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/40 font-bold text-foreground">
            <span>{side === 'buy' ? '예상 총 결제액:' : '예상 실수령액:'}</span>
            <span className={`text-sm font-black ${side === 'buy' ? 'text-rose-400' : 'text-blue-400'}`}>
              {netAmount.toLocaleString()} WLD
            </span>
          </div>
        </div>

        {/* 모의 체결 버튼 */}
        <Button
          size="sm"
          onClick={handleSimulateTrade}
          disabled={isExecuted}
          className={`w-full h-9 rounded-xl font-bold text-xs shadow-sm transition-all ${
            side === 'buy'
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isExecuted ? (
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="size-4 animate-bounce" />
              모의 즉시 체결 완료! (호가 반영 완료)
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ArrowDownUp className="size-3.5" />
              {quantity}주 즉시 {side === 'buy' ? '모의 매수' : '모의 매도'}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
