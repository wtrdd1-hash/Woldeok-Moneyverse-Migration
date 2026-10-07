'use client';

import React, { useActionState, useId, useState } from 'react';
import { Scale, HeartHandshake, ShieldCheck, Info, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepUpField } from '../step-up-field';
import { ActionFeedback } from '../action-feedback';
import { executeWealthTaxAction } from '../actions';
import type { ActionState } from '@/lib/action-state';

export function TreasuryWealthTaxDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const reasonId = useId();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    executeWealthTaxAction,
    { status: 'idle' },
  );

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5 text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Scale className="h-3.5 w-3.5" />
        누진적 부유세 과세
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wealth-tax-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto"
        >
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="wealth-tax-dialog-title" className="text-lg font-bold">
                    초고액 자산가 누진적 부유세 (Progressive Wealth Tax)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    자산 편중 완화 및 복지 재원 마련을 위해 고액 자산가에게 누진 과세합니다.
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
              {/* 토마스 피케티 4구간 누진 과세표준 안내 */}
              <div className="rounded-lg border bg-amber-500/5 border-amber-500/20 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Info className="h-4 w-4" /> 4구간 법정 누진 과세표준 (피케티 모델)
                  </span>
                  <span className="text-[11px] text-muted-foreground">복지기금 100% 직행</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded bg-background/80 p-2 border">
                    <span className="text-muted-foreground block">1구간 (10,000 WLD 이하)</span>
                    <span className="font-bold text-emerald-600 font-mono">0% (전액 면세)</span>
                  </div>
                  <div className="rounded bg-background/80 p-2 border">
                    <span className="text-muted-foreground block">2구간 (10,001 ~ 30,000 WLD)</span>
                    <span className="font-bold text-amber-600 font-mono">2% (초과분 과세)</span>
                  </div>
                  <div className="rounded bg-background/80 p-2 border">
                    <span className="text-muted-foreground block">3구간 (30,001 ~ 60,000 WLD)</span>
                    <span className="font-bold text-orange-600 font-mono">5% (초과분 과세)</span>
                  </div>
                  <div className="rounded bg-background/80 p-2 border">
                    <span className="text-muted-foreground block">4구간 (60,000 WLD 초과)</span>
                    <span className="font-bold text-rose-600 font-mono">8% (고래 특별 분담금)</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-amber-500/20">
                  징수된 모든 세액은 중앙 국고를 거치지 않고 전액 복지 및 시민 기본소득 환원 금고(<code>VAULT_WELFARE</code>)로 100% 직행 격리되어 신규 정착 및 취약계층 기본소득 배당으로만 환원됩니다.
                </p>
              </div>

              <div>
                <label htmlFor={reasonId} className="block text-xs font-semibold text-foreground mb-1">
                  부자 과세 집행 정책 사유 (Audit Log)
                </label>
                <input
                  id={reasonId}
                  name="reason"
                  type="text"
                  defaultValue="2026년 4분기 불평등 완화 및 복지 재원 마련을 위한 초고액 자산가 누진적 부유세 과세 집행"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <StepUpField id="step-up-wealth-tax" undo="과세 내역은 감사 원장에 영구 보존되며 복지기금으로 귀속" />
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
                  disabled={isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isPending ? '과세 집행 중...' : '누진적 부유세 즉시 과세 집행'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
