'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  Clock,
  Sparkles,
  Coins,
  ShieldCheck,
  ChevronRight,
  Plus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  SAVINGS_PLANS,
  type SavingsPlan,
  type SavingsPotRecord,
  getStoredSavingsPots,
  openSavingsPot,
  claimDailyInterestFromPot,
  calculateExpectedMaturityYield,
} from '@/lib/savings-pot';
import { playCoinCollectSound, playBetChipSound } from '@/lib/audio-effects';
import { formatWld } from '@/lib/money';
import { toast } from 'sonner';
import { TranslatedText as T } from '@/components/translated-text';

export function SavingsPotCard({ userBalanceWld = 50000 }: { readonly userBalanceWld?: number }) {
  const [pots, setPots] = useState<SavingsPotRecord[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setPots(getStoredSavingsPots());
  }, []);

  const handleOpenPlan = (plan: SavingsPlan) => {
    setSelectedPlan(plan);
    setDepositAmount(plan.minDepositWld.toString());
    setIsDialogOpen(true);
    playBetChipSound();
  };

  const handleConfirmDeposit = () => {
    if (!selectedPlan) return;
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount < selectedPlan.minDepositWld) {
      toast.error(`최소 가입 금액은 ${formatWld(selectedPlan.minDepositWld)} WLD 입니다.`);
      return;
    }
    if (amount > selectedPlan.maxDepositWld) {
      toast.error(`최대 가입 한도는 ${formatWld(selectedPlan.maxDepositWld)} WLD 입니다.`);
      return;
    }

    const created = openSavingsPot(selectedPlan.id, amount);
    setPots(getStoredSavingsPots());
    setIsDialogOpen(false);
    playCoinCollectSound();
    toast.success(`${selectedPlan.name}에 ${formatWld(amount)} WLD 예치가 완료되었습니다!`);
  };

  const handleClaimInterest = (potId: string) => {
    const res = claimDailyInterestFromPot(potId);
    if (res.success) {
      setPots(getStoredSavingsPots());
      playCoinCollectSound();
      toast.success(`일일 복리 이자 +${res.claimedAmount} WLD를 수령했습니다!`);
    } else {
      toast.error('수령 가능한 이자가 없습니다.');
    }
  };

  const calcYield = selectedPlan
    ? calculateExpectedMaturityYield(
        Number(depositAmount) || selectedPlan.minDepositWld,
        selectedPlan.baseAprPct,
        selectedPlan.bonusMaturityPct,
        selectedPlan.periodDays
      )
    : { interest: 0, total: 0 };

  return (
    <>
      <section aria-labelledby="savings-pot-heading" className="w-full space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Landmark className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="savings-pot-heading" className="text-base font-extrabold text-foreground">
                  <T korean="중앙은행 스마트 복리 포켓 (모의 체험)" english="Central Bank Smart Savings Pots (Simulated)" />
                </h2>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                  모의 시뮬레이션
                </Badge>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                  APR 12.0% MAX
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <T
                  korean="가상 목표 저축 시뮬레이터입니다. 브라우저에서 매일 복리 이자 정산 메커니즘을 체험해 볼 수 있습니다 (실제 계좌 잔액 미차감)."
                  english="Simulated savings goal calculator. Experience compound interest calculation in your browser (no live balance deduction)."
                />
              </p>
            </div>
          </div>
        </div>

        {/* Plan Grid */}
        <div className="grid gap-3.5 sm:grid-cols-3">
          {SAVINGS_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card/80 hover:border-primary/40 transition-all shadow-sm space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[11px] font-bold border-primary/30 text-primary">
                    {plan.badgeLabel}
                  </Badge>
                  <span className="font-mono text-xs text-emerald-400 font-extrabold">
                    연 {plan.baseAprPct}% {plan.bonusMaturityPct > 0 && `(+${plan.bonusMaturityPct}%)`}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>최소 가입</span>
                  <span className="font-mono font-bold text-foreground">{formatWld(plan.minDepositWld)} WLD</span>
                </div>
                <Button
                  onClick={() => handleOpenPlan(plan)}
                  className="w-full h-9 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-98"
                >
                  <Plus className="size-3.5 mr-1" />
                  <T korean="예금 가입하기" english="Open Pot" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Pots Section */}
        {pots.length > 0 && (
          <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <PiggyBank className="size-4 text-primary" />
              <T korean="내 활성 복리 포켓 목록" english="My Active Savings Pots" /> ({pots.length}개)
            </h3>

            <div className="space-y-2.5">
              {pots.map((pot) => {
                const matchedPlan = SAVINGS_PLANS.find((p) => p.id === pot.planId);
                const plan = matchedPlan || SAVINGS_PLANS[0]!;
                const maturesDate = new Date(pot.maturesAt);
                const diffDays = Math.max(
                  0,
                  Math.ceil((maturesDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                );

                return (
                  <div
                    key={pot.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card p-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                          {plan.badgeLabel}
                        </Badge>
                        <span className="text-xs font-bold text-foreground">{plan.name}</span>
                        <span className="font-mono text-[11px] text-amber-400 font-semibold">
                          D-{diffDays}일
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>예치 원금: <strong className="font-mono text-foreground">{formatWld(pot.principalWld)} WLD</strong></span>
                        <span>누적 수령 이자: <strong className="font-mono text-emerald-400">+{pot.claimedInterestWld} WLD</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <Button
                        size="sm"
                        onClick={() => handleClaimInterest(pot.id)}
                        className="h-8 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-xs active:scale-95"
                      >
                        <Coins className="size-3.5 mr-1" />
                        <T korean="일일 이자 받기" english="Claim Daily Yield" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Deposit Dialog */}
      {selectedPlan && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold flex items-center gap-2">
                <PiggyBank className="size-5 text-primary" />
                {selectedPlan.name} 가입
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedPlan.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">예치할 WLD 금액</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min={selectedPlan.minDepositWld}
                    max={selectedPlan.maxDepositWld}
                    className="font-mono text-sm font-bold pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground font-bold">
                    WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>최소 {formatWld(selectedPlan.minDepositWld)} WLD</span>
                  <span>보유 잔액: {formatWld(userBalanceWld)} WLD</span>
                </div>
              </div>

              {/* Expected Yield Preview */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">적용 이자율</span>
                  <span className="font-mono font-bold text-primary">
                    연 {selectedPlan.baseAprPct}% {selectedPlan.bonusMaturityPct > 0 && `(+${selectedPlan.bonusMaturityPct}% 만기보너스)`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">만기 예상 수령 이자</span>
                  <span className="font-mono font-extrabold text-emerald-400">
                    +{formatWld(calcYield.interest)} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-primary/10">
                  <span className="font-bold text-foreground">만기 총 수령액</span>
                  <span className="font-mono font-black text-sm text-foreground">
                    {formatWld(calcYield.total)} WLD
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs font-semibold">
                취소
              </Button>
              <Button onClick={handleConfirmDeposit} className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
                예치 확정
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
