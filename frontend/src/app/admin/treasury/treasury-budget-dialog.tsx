'use client';

import React, { useActionState, useId, useState } from 'react';
import { Layers, ShieldCheck, AlertTriangle, ArrowRight, Flame, HeartHandshake, Building2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepUpField } from '../step-up-field';
import { ActionFeedback } from '../action-feedback';
import { distributeBudgetRuleAction } from '../actions';
import type { ActionState } from '@/lib/action-state';
import type { AdminTreasuryVault } from '../types';
import { groupDigits } from '@/lib/money';

interface TreasuryBudgetDialogProps {
  readonly mainVault?: AdminTreasuryVault | undefined;
}

export function TreasuryBudgetDialog({ mainVault }: TreasuryBudgetDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const amountId = useId();
  const reasonId = useId();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    distributeBudgetRuleAction,
    { status: 'idle' },
  );

  const [amountInput, setAmountInput] = useState<string>('1000000');

  const mainBalBig = BigInt(mainVault?.balance_wld || '0');
  const safeReserve = (mainBalBig * BigInt(30)) / BigInt(100);
  const availableBudget = mainBalBig > safeReserve ? mainBalBig - safeReserve : BigInt(0);

  const numAmount = BigInt(amountInput || '0');
  const welfareAmount = (numAmount * BigInt(40)) / BigInt(100);
  const infraAmount = (numAmount * BigInt(30)) / BigInt(100);
  const emergencyAmount = (numAmount * BigInt(20)) / BigInt(100);
  const burnAmount = numAmount - (welfareAmount + infraAmount + emergencyAmount);

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5 text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Layers className="h-3.5 w-3.5" />
        4분할 예산 배분
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="budget-dialog-title" className="text-lg font-bold">
                    헌법적 4분할 원자적 예산 배정 (Fiscal Budgeting)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    국고 세수 잉여금을 4대 목적별 금고로 자동 분할 배분합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="mt-4 space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">메인 국고 잔액:</span>
                  <span className="font-mono font-bold text-foreground">
                    {groupDigits(mainVault?.balance_wld || '0')} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> 30% 법정 안전 비축금:
                  </span>
                  <span className="font-mono text-amber-600 font-semibold">
                    {groupDigits(safeReserve.toString())} WLD (배분 불가 보호)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t pt-1.5">
                  <span className="font-semibold text-foreground">배분 가용 여유 자금:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {groupDigits(availableBudget.toString())} WLD
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor={amountId} className="block text-xs font-semibold text-foreground mb-1">
                  총 배분 예산 금액 (WLD)
                </label>
                <div className="relative">
                  <input
                    id={amountId}
                    name="amount_wld"
                    type="number"
                    min="1000"
                    step="1000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-semibold"
                  />
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {['100000', '500000', '1000000', '5000000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountInput(preset)}
                      className="rounded border bg-muted/40 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                    >
                      +{groupDigits(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4분할 시뮬레이션 미리보기 */}
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span>헌법적 4분할 원자적 배분 명세</span>
                  <span>100% 자동 분할</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between rounded bg-background/80 p-2 border">
                    <span className="flex items-center gap-1 text-purple-600 font-medium">
                      <HeartHandshake className="h-3 w-3" /> 복지기금 (40%)
                    </span>
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                      {groupDigits(welfareAmount.toString())} WLD
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-background/80 p-2 border">
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Building2 className="h-3 w-3" /> 공공인프라 (30%)
                    </span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                      {groupDigits(infraAmount.toString())} WLD
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-background/80 p-2 border">
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <ShieldCheck className="h-3 w-3" /> 비상준비금 (20%)
                    </span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                      {groupDigits(emergencyAmount.toString())} WLD
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-background/80 p-2 border">
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <Flame className="h-3 w-3" /> 영구소각 (10%)
                    </span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                      {groupDigits(burnAmount.toString())} WLD
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor={reasonId} className="block text-xs font-semibold text-foreground mb-1">
                  감사 승인 사유 (Audit Log)
                </label>
                <input
                  id={reasonId}
                  name="reason"
                  type="text"
                  defaultValue="2026-Q4 정기 국고 세수 잉여금 4분할 헌법적 재정 배분"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <StepUpField id="step-up-budget" undo="예산 배분은 원장 트랜잭션으로 기록되며 금고 간 재조정 가능" />
              <ActionFeedback state={state} />

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || numAmount <= BigInt(0)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isPending ? '원자적 배정 중...' : '4분할 예산 즉시 배정'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
