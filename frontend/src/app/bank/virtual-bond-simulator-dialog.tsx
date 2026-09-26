'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Landmark,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';

interface VirtualBondSimulatorDialogProps {
  readonly onApply?: (bondCode: 'BOND_7D' | 'BOND_30D', amount: string) => void;
  readonly children?: React.ReactNode;
}

const BOND_TYPES = [
  {
    code: 'BOND_7D' as const,
    name: '7일 만기 단기 국채',
    days: 7,
    yieldRatePct: 3.0,
    yieldBps: 300,
    annualizedPct: 156.4, // 3% / 7 * 365
    badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  },
  {
    code: 'BOND_30D' as const,
    name: '30일 만기 프리미엄 국채',
    days: 30,
    yieldRatePct: 15.0,
    yieldBps: 1500,
    annualizedPct: 182.5, // 15% / 30 * 365
    badgeColor: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
  },
] as const;

export function VirtualBondSimulatorDialog({
  onApply,
  children,
}: VirtualBondSimulatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<'BOND_7D' | 'BOND_30D'>('BOND_7D');
  const [principal, setPrincipal] = useState<number>(50000);

  const selectedBond = BOND_TYPES.find((b) => b.code === selectedCode) || BOND_TYPES[0];

  // 계산 로직
  const { maturityAmount, interestAmount, bankComparisonInterest, excessProfit, excessRatio } = useMemo(() => {
    const p = BigInt(principal);
    const bondInterest = (p * BigInt(selectedBond.yieldBps) + 5000n) / 10000n;
    const total = p + bondInterest;

    // 동기간 일반 복리예금(일 0.1% 단리 기준 비교: 0.1% * days)
    // 7일 = 0.7%, 30일 = 3.0%
    const bankBps = BigInt(selectedBond.days * 10);
    const bankInt = (p * bankBps + 5000n) / 10000n;

    const excess = bondInterest > bankInt ? bondInterest - bankInt : 0n;
    const ratio = bankInt > 0n ? Number((excess * 100n) / bankInt) : 0;

    return {
      maturityAmount: total.toString(),
      interestAmount: bondInterest.toString(),
      bankComparisonInterest: bankInt.toString(),
      excessProfit: excess.toString(),
      excessRatio: ratio,
    };
  }, [principal, selectedBond]);

  const handleSelectPreset = (amount: number) => {
    setPrincipal(amount);
  };

  const handleConfirmApply = () => {
    onApply?.(selectedCode, principal.toString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
            <Calculator className="size-3.5 text-amber-500" />
            <span>만기 시뮬레이터</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="size-5 text-amber-500" />
            <span>가상 국채 만기 수익 시뮬레이터</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            만기 보유 시의 확정 수익금 및 일반 예금 대비 초과 수익률을 실시간 비교합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. 채권 상품 선택 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">투자 상품 선택</label>
            <div className="grid grid-cols-2 gap-2">
              {BOND_TYPES.map((bond) => {
                const isSelected = selectedCode === bond.code;
                return (
                  <button
                    key={bond.code}
                    type="button"
                    onClick={() => setSelectedCode(bond.code)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-sm'
                        : 'border-border/80 bg-background/60 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{bond.name}</span>
                      <Badge variant="outline" className={`font-mono text-[10px] font-bold ${bond.badgeColor}`}>
                        +{bond.yieldRatePct}%
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {bond.days}일 만기 · 연환산 {bond.annualizedPct}%
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 투자 원금 설정 (입력 + 슬라이더 + 프리셋) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-principal" className="font-bold text-foreground">투자 원금</label>
              <span className="font-mono font-bold text-primary text-sm">
                {groupDigits(principal.toString())} WLD
              </span>
            </div>

            <div className="relative">
              <input
                id="sim-principal"
                type="number"
                min={1000}
                step={1000}
                value={principal}
                onChange={(e) => setPrincipal(Math.max(1000, Number.parseInt(e.target.value, 10) || 1000))}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 font-mono text-sm font-bold pr-12 shadow-xs focus:ring-1 focus:ring-ring"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-muted-foreground">
                WLD
              </span>
            </div>

            <input
              type="range"
              min={1000}
              max={500000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number.parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-lg bg-muted accent-amber-500 cursor-pointer"
              aria-label="투자 원금 슬라이더"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {[10000, 50000, 100000, 300000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectPreset(val)}
                  className="h-8 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted text-[11px] font-mono font-semibold transition-all active:scale-95"
                >
                  {val >= 10000 ? `${val / 10000}만` : groupDigits(val.toString())}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 시뮬레이션 계산 결과 서피스 */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-amber-500/20 pb-2.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>만기 총 수령액 (원금+수익)</span>
              </span>
              <span className="font-mono text-base font-extrabold text-amber-600 dark:text-amber-400">
                {groupDigits(maturityAmount)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-background/80 p-2.5 border border-border/60">
                <span className="text-[11px] text-muted-foreground block">확정 이자 수익</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +{groupDigits(interestAmount)} WLD
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  약정 수익률 +{selectedBond.yieldRatePct}%
                </span>
              </div>

              <div className="rounded-lg bg-background/80 p-2.5 border border-border/60">
                <span className="text-[11px] text-muted-foreground block">일반 예금 대비 초과</span>
                <span className="font-mono font-bold text-primary text-sm">
                  +{groupDigits(excessProfit)} WLD
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  예금 대비 +{excessRatio}% 추가 수익
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span>락업 운용 기간: {selectedBond.days}일</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <ShieldCheck className="size-3 text-emerald-500" />
                <span>만기 도래 시 즉시 전액 지급 보장</span>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            닫기
          </Button>
          {onApply && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmApply}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
            >
              <span>이 조건으로 매입창 바인딩</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
