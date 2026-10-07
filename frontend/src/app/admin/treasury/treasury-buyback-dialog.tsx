'use client';

import React, { useActionState, useId, useState } from 'react';
import { Flame, ShieldCheck, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepUpField } from '../step-up-field';
import { ActionFeedback } from '../action-feedback';
import { executeMarketBuybackBurnAction } from '../actions';
import type { ActionState } from '@/lib/action-state';
import type { AdminTreasuryVault } from '../types';
import { groupDigits } from '@/lib/money';

interface TreasuryBuybackDialogProps {
  readonly mainVault?: AdminTreasuryVault | undefined;
}

export function TreasuryBuybackDialog({ mainVault }: TreasuryBuybackDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const listingId = useId();
  const reasonId = useId();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    executeMarketBuybackBurnAction,
    { status: 'idle' },
  );

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5 text-xs h-9 bg-rose-700 hover:bg-rose-800 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Flame className="h-3.5 w-3.5" />
        역매수 영구소각
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="buyback-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="buyback-dialog-title" className="text-lg font-bold">
                    룬스케이프형 역매수 영구소각 (Buyback & Burn)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    국고 세수로 시장 덤핑 아이템을 매입하여 영구 파괴(디플레이션 유도)합니다.
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
              <div className="rounded-lg border bg-rose-500/5 border-rose-500/20 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
                  <Info className="h-4 w-4" /> 역매수 소각 메커니즘
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  국고 세수(VAULT_MAIN)에서 판매자에게 WLD 대금을 즉시 정산 지급하고, 매입된 아이템은 국고나 누구의 인벤토리에도 들어가지 않고 영구 소각(Status: settled) 처리되어 시장 바닥 시세를 방어합니다.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-rose-500/20">
                  <span className="text-muted-foreground">국고 가용 잔액:</span>
                  <span className="font-mono font-bold text-foreground">
                    {groupDigits(mainVault?.balance_wld || '0')} WLD
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor={listingId} className="block text-xs font-semibold text-foreground mb-1">
                  시장 매물 ID (Marketplace Listing UUID)
                </label>
                <div className="relative">
                  <input
                    id={listingId}
                    name="listing_id"
                    type="text"
                    placeholder="예: 00000000-0000-0000-0000-000000000000"
                    required
                    pattern="^[0-9a-fA-F-]{36}$"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  장터에서 시세보다 과도하게 덤핑된 활성 매물의 UUID를 입력하세요.
                </p>
              </div>

              <div>
                <label htmlFor={reasonId} className="block text-xs font-semibold text-foreground mb-1">
                  소각 사유 및 정책 근거
                </label>
                <input
                  id={reasonId}
                  name="reason"
                  type="text"
                  defaultValue="시세 방어 및 통화량 수축을 위한 국고 역매수 영구소각"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <StepUpField id="step-up-buyback" undo="아이템은 영구 소각되며 판매자 정산 대금은 회수 불가" />
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
                  className="bg-rose-700 hover:bg-rose-800 text-white"
                >
                  {isPending ? '역매수 소각 집행 중...' : '역매수 및 영구소각 집행'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
