'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  ShieldAlert,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { playStockTickSound, playStockTradeSuccessSound } from '@/lib/audio-effects';

export type ConditionalType = 'stop_loss' | 'take_profit';
export type ConditionalStatus = 'WATCHING' | 'TRIGGERED' | 'CANCELLED';

export interface ConditionalOrderRule {
  readonly id: string;
  readonly stockId: string;
  readonly symbol: string;
  readonly type: ConditionalType;
  readonly triggerPrice: number;
  readonly quantity: number;
  readonly status: ConditionalStatus;
  readonly createdAt: string;
  readonly triggeredAt?: string;
}

interface StockConditionalOrdersProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly holdingQuantity?: string | undefined;
  readonly isHalted?: boolean | undefined;
  readonly isEn?: boolean | undefined;
}

export function StockConditionalOrders({
  stockId,
  symbol,
  name,
  currentPrice,
  holdingQuantity,
  isHalted = false,
  isEn = false,
}: StockConditionalOrdersProps) {
  const triggerInputId = useId();
  const qtyInputId = useId();
  const storageKey = `mv_stock_conditional_orders_${symbol}`;

  const currentPriceNum = useMemo(() => {
    return Number.parseInt(currentPrice.replaceAll(',', '') || '0', 10);
  }, [currentPrice]);

  const holdingNum = useMemo(() => {
    return Number.parseInt((holdingQuantity ?? '0').replaceAll(',', '') || '0', 10);
  }, [holdingQuantity]);

  const [orderType, setOrderType] = useState<ConditionalType>('stop_loss');
  const [triggerPriceStr, setTriggerPriceStr] = useState<string>('');
  const [quantityStr, setQuantityStr] = useState<string>('10');
  const [rules, setRules] = useState<readonly ConditionalOrderRule[]>([]);
  const [justTriggeredId, setJustTriggeredId] = useState<string | null>(null);

  // localStorage에서 해당 종목 감시 주문 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRules(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [storageKey]);

  // 규칙 변경 시 localStorage 동기화
  const saveRules = (nextRules: readonly ConditionalOrderRule[]) => {
    setRules(nextRules);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextRules));
    } catch {
      // Ignore localStorage write errors
    }
  };

  // 현재가 변경 시 감시 엔진 구동
  useEffect(() => {
    if (currentPriceNum <= 0 || rules.length === 0) return;

    let hasChange = false;
    const nextRules = rules.map((r) => {
      if (r.status !== 'WATCHING') return r;

      const isStopLossTriggered = r.type === 'stop_loss' && currentPriceNum <= r.triggerPrice;
      const isTakeProfitTriggered = r.type === 'take_profit' && currentPriceNum >= r.triggerPrice;

      if (isStopLossTriggered || isTakeProfitTriggered) {
        hasChange = true;
        setJustTriggeredId(r.id);
        playStockTradeSuccessSound();
        return {
          ...r,
          status: 'TRIGGERED' as const,
          triggeredAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
      }
      return r;
    });

    if (hasChange) {
      saveRules(nextRules);
    }
  }, [currentPriceNum, rules]);

  // 프리셋 비율로 감시 가격 자동 계산
  const handleApplyPctPreset = (pct: number) => {
    if (currentPriceNum <= 0) return;
    const calculated = Math.round(currentPriceNum * (1 + pct / 100));
    setTriggerPriceStr(calculated.toString());
    playStockTickSound();
  };

  // 수량 잔고 비율 프리셋
  const handleApplyQtyRatio = (ratio: number) => {
    if (holdingNum <= 0) return;
    const qty = Math.max(1, Math.floor(holdingNum * ratio));
    setQuantityStr(qty.toString());
    playStockTickSound();
  };

  // 감시 주문 등록
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const tPrice = Number.parseInt(triggerPriceStr.replaceAll(',', '') || '0', 10);
    const q = Number.parseInt(quantityStr.replaceAll(',', '') || '0', 10);

    if (tPrice <= 0 || q <= 0) return;

    const newRule: ConditionalOrderRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stockId,
      symbol,
      type: orderType,
      triggerPrice: tPrice,
      quantity: q,
      status: 'WATCHING',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    saveRules([newRule, ...rules]);
    playStockTickSound();
    setTriggerPriceStr('');
  };

  // 주문 취소
  const handleCancelRule = (id: string) => {
    const next = rules.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' as const } : r));
    saveRules(next);
    playStockTickSound();
  };

  // 주문 삭제
  const handleDeleteRule = (id: string) => {
    const next = rules.filter((r) => r.id !== id);
    saveRules(next);
    playStockTickSound();
  };

  return (
    <Card className="moneyverse-card border-border/80 bg-card/70 shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-primary" />
            <CardTitle className="text-sm font-bold">
              {isEn ? 'Automated Conditional Orders' : '스탑로스 & 익절 자동 감시'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
            {isEn ? 'Simulated Bot' : '자동 체결 봇'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          {isEn
            ? 'Automatically triggers market sell when target trigger price is breached.'
            : '설정한 목표가에 도달하면 시장가 매도 주문을 자동으로 실행합니다.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* 주문 유형 탭: 스탑로스(손절) vs 익절 */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/70">
          <button
            type="button"
            onClick={() => {
              setOrderType('stop_loss');
              playStockTickSound();
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              orderType === 'stop_loss'
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownRight className="size-3.5" />
            <span>{isEn ? 'Stop-Loss (Cut)' : '손절 감시 (Stop-Loss)'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderType('take_profit');
              playStockTickSound();
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              orderType === 'take_profit'
                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="size-3.5" />
            <span>{isEn ? 'Take-Profit (Win)' : '익절 감시 (Take-Profit)'}</span>
          </button>
        </div>

        {/* 조건부 주문 입력 폼 */}
        <form onSubmit={handleCreateRule} className="space-y-3">
          {/* 목표 트리거가 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={triggerInputId} className="font-semibold text-muted-foreground">
                {isEn ? 'Trigger Price' : '감시 발동 단가 (WLD)'}
              </label>
              <span className="font-mono text-[11px] text-muted-foreground">
                현재가: {groupDigits(currentPriceNum.toString())}
              </span>
            </div>
            <div className="relative">
              <Input
                id={triggerInputId}
                type="text"
                inputMode="numeric"
                value={triggerPriceStr}
                onChange={(e) => setTriggerPriceStr(e.target.value)}
                placeholder={
                  orderType === 'stop_loss'
                    ? (currentPriceNum * 0.95).toFixed(0)
                    : (currentPriceNum * 1.05).toFixed(0)
                }
                className="font-mono text-sm pr-12 tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                WLD
              </span>
            </div>

            {/* 프리셋 버튼 그룹 */}
            <div className="flex items-center gap-1 pt-1">
              <span className="text-[10px] text-muted-foreground shrink-0 mr-1">
                {isEn ? 'Quick presets:' : '빠른 설정:'}
              </span>
              {orderType === 'stop_loss' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(-3)}
                    className="h-6 text-[10px] px-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                  >
                    -3%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(-5)}
                    className="h-6 text-[10px] px-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                  >
                    -5%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(-10)}
                    className="h-6 text-[10px] px-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                  >
                    -10%
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(5)}
                    className="h-6 text-[10px] px-2 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    +5%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(10)}
                    className="h-6 text-[10px] px-2 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    +10%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPctPreset(20)}
                    className="h-6 text-[10px] px-2 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    +20%
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 감시 수량 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={qtyInputId} className="font-semibold text-muted-foreground">
                {isEn ? 'Execution Quantity' : '체결 수량 (주)'}
              </label>
              <span className="font-mono text-[11px] text-muted-foreground">
                보유 잔고: {groupDigits(holdingNum.toString())}주
              </span>
            </div>
            <div className="relative">
              <Input
                id={qtyInputId}
                type="text"
                inputMode="numeric"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                placeholder="10"
                className="font-mono text-sm pr-10 tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                주
              </span>
            </div>

            {/* 잔고 비율 프리셋 */}
            {holdingNum > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyQtyRatio(0.25)}
                  className="h-6 text-[10px] px-2"
                >
                  25%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyQtyRatio(0.5)}
                  className="h-6 text-[10px] px-2"
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyQtyRatio(1)}
                  className="h-6 text-[10px] px-2 font-bold"
                >
                  {isEn ? 'Max' : '전량 (100%)'}
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isHalted || !triggerPriceStr || !quantityStr}
            className="w-full h-10 rounded-xl font-bold text-xs gap-1.5 mt-2"
          >
            <Plus className="size-3.5" />
            <span>
              {orderType === 'stop_loss'
                ? isEn ? 'Register Stop-Loss Order' : '손절 감시 주문 등록'
                : isEn ? 'Register Take-Profit Order' : '익절 감시 주문 등록'}
            </span>
          </Button>
        </form>

        {/* 최근 체결 알림 배너 */}
        {justTriggeredId && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs flex items-center justify-between text-emerald-500 animate-in fade-in">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{isEn ? 'Conditional Order Automatically Executed!' : '목표가 도달로 감시 주문이 자동 체결되었습니다!'}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setJustTriggeredId(null)}
              className="h-6 px-1 text-emerald-500 hover:text-emerald-400"
            >
              닫기
            </Button>
          </div>
        )}

        {/* 활성 감시 주문 목록 */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              <span>{isEn ? 'Active Watch Rules' : '활성 감시 목록'}</span>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {rules.length}건
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
              {isEn ? 'No conditional orders registered.' : '등록된 자동 감시 주문이 없습니다.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
              {rules.map((rule) => {
                const isSL = rule.type === 'stop_loss';
                const diffPct =
                  currentPriceNum > 0
                    ? (((rule.triggerPrice - currentPriceNum) / currentPriceNum) * 100).toFixed(1)
                    : '0.0';

                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card/60 text-xs gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 font-bold shrink-0 ${
                            isSL
                              ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
                              : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                          }`}
                        >
                          {isSL ? '손절' : '익절'}
                        </Badge>
                        <span className="font-mono font-bold tabular-nums">
                          {groupDigits(rule.triggerPrice.toString())} WLD
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({diffPct}%)
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {rule.quantity}주 · {rule.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {rule.status === 'WATCHING' && (
                        <>
                          <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 text-[10px] flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span>감시중</span>
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelRule(rule.id)}
                            className="size-6 text-muted-foreground hover:text-foreground"
                            title="감시 취소"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </>
                      )}
                      {rule.status === 'TRIGGERED' && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">
                          체결완료
                        </Badge>
                      )}
                      {rule.status === 'CANCELLED' && (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          취소됨
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
