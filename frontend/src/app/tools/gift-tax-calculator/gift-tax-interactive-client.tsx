'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { GIFT_TAX_DEDUCTIONS, calculateGiftTax } from '@/config/pseo-gift-tax.config';

type GiverType = keyof typeof GIFT_TAX_DEDUCTIONS;

export function GiftTaxInteractiveClient() {
  const [giver, setGiver] = useState<GiverType>('부모(성인자녀)');
  const [giftAmountTenThousand, setGiftAmountTenThousand] = useState<number>(10000); // 1억원 (만원 단위)

  const giftAmount = giftAmountTenThousand * 10000;
  const deductionAmount = GIFT_TAX_DEDUCTIONS[giver];

  const result = useMemo(() => {
    return calculateGiftTax(giftAmount, deductionAmount);
  }, [giftAmount, deductionAmount]);

  const quickAmounts = [3000, 5000, 10000, 15000, 20000, 30000, 50000, 60000]; // 만원 단위

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              증여세 실시간 모의 계산기
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            2026 세법개정 반영
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 증여 관계 선택 탭 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>증여자와의 관계 (공제 한도 적용)</span>
            <span className="text-primary font-mono text-xs">
              공제한도: ₩{(deductionAmount / 10000).toLocaleString()}만원
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {(Object.keys(GIFT_TAX_DEDUCTIONS) as GiverType[]).map((g) => (
              <Button
                key={g}
                type="button"
                variant={giver === g ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGiver(g)}
                className="h-10 min-h-[44px] text-xs font-semibold"
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* 증여 금액 입력 필드 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>증여 재산가액 (원)</span>
            <span className="text-xs text-muted-foreground font-mono">
              {(giftAmountTenThousand / 10000).toLocaleString()}억원
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="100"
              step="500"
              value={giftAmountTenThousand}
              onChange={(e) => setGiftAmountTenThousand(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 pr-12 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="예: 10000 (1억원)"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              만원
            </span>
          </div>

          {/* 빠른 금액 선택 프리셋 칩 */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setGiftAmountTenThousand(amt)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  giftAmountTenThousand === amt
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border/60 hover:bg-muted text-muted-foreground'
                }`}
              >
                {amt >= 10000 ? `${amt / 10000}억` : `${amt.toLocaleString()}만`}
              </button>
            ))}
          </div>
        </div>

        {/* 계산 결과 패널 */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">최종 납부 예상 증여세</span>
              <div className="text-2xl sm:text-3xl font-mono tabular-nums font-extrabold text-emerald-950 dark:text-emerald-100 mt-0.5">
                ₩{result.finalTax.toLocaleString()}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground">실효 세율</span>
              <div className="text-lg font-mono font-bold text-foreground">
                {result.effectiveTaxRate}%
              </div>
            </div>
          </div>

          {/* 세부 계산 명세 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground">과세표준</span>
              <div className="font-mono font-bold mt-0.5">₩{result.taxableBase.toLocaleString()}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground">적용 세율</span>
              <div className="font-mono font-bold mt-0.5">{result.rate}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground">누진공제</span>
              <div className="font-mono font-bold mt-0.5">₩{result.progressiveDeduction.toLocaleString()}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground">자진신고 공제(3%)</span>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                -₩{result.reportDeduction.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 토스형 1초 시나리오 저장 & 회원 전환 액션 */}
        <CalculatorSaveAction
          scenario={{
            type: 'tax',
            title: `증여세 계산: ${giver} ₩${(giftAmount / 10000).toLocaleString()}만원`,
            badge: '증여세',
            primaryMetric: {
              label: '예상 납부세액',
              value: `₩${result.finalTax.toLocaleString()}`,
            },
            secondaryMetric: {
              label: '과세표준',
              value: `₩${result.taxableBase.toLocaleString()}`,
            },
            details: {
              giver,
              giftAmount: `₩${giftAmount.toLocaleString()}`,
              deduction: `₩${deductionAmount.toLocaleString()}`,
              rate: `${result.rate}%`,
            },
            sourceUrl: '/tools/gift-tax-calculator',
          }}
        />
      </CardContent>
    </Card>
  );
}
