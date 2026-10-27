'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';
import { previewRepayAction } from './actions';

type Result = Awaited<ReturnType<typeof previewRepayAction>>;

export function RepayImpactPreview({ loanId, amount, repayComplete }: {
  readonly loanId: string;
  readonly amount: string;
  readonly repayComplete: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState<{ loanId: string; amount: string; result: Result } | null>(null);
  const normalized = amount.replaceAll(',', '').trim();
  const visible = !repayComplete && last?.loanId === loanId && last.amount === normalized ? last.result : null;

  function preview() {
    const requested = normalized;
    const form = new FormData();
    form.set('loanId', loanId);
    form.set('amount', requested);
    setLast(null);
    startTransition(async () => {
      const result = await previewRepayAction(form);
      setLast({ loanId, amount: requested, result });
    });
  }

  return (
    <section aria-label="대출 상환 예상" className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <Button type="button" variant="outline" disabled={pending || !/^[1-9][0-9]*$/.test(normalized)} onClick={preview}>
        {pending ? '상환 예상 확인 중…' : '상환 후 잔액 미리보기'}
      </Button>
      <div aria-live="polite" aria-atomic="true" className="grid gap-1 text-xs">
        {visible?.status === 'error' && <p role="alert" className="text-destructive">{visible.message}</p>}
        {visible?.status === 'ok' && (
          <>
            <p>실제 차감 예상: <strong>{groupDigits(visible.preview.payableAmount)} WLD</strong></p>
            <p>현금 잔액: {groupDigits(visible.preview.cashBefore)} → {visible.preview.cashAfter === null ? '상환 불가' : groupDigits(visible.preview.cashAfter)} WLD</p>
            <p>대출 잔액: {groupDigits(visible.preview.debtBefore)} → {groupDigits(visible.preview.debtAfter)} WLD</p>
            {visible.preview.adjustmentAmount !== '0' && <p>초과 입력 조정: {groupDigits(visible.preview.adjustmentAmount)} WLD</p>}
            {!visible.preview.eligible && <p role="alert" className="text-destructive">보유 현금이 부족해 현재 상환할 수 없습니다.</p>}
            <p className="text-muted-foreground">읽기 전용 예상 결과입니다. 실제 상환은 별도로 실행되며 최신 잔액과 대출 상태를 다시 검사합니다.</p>
          </>
        )}
      </div>
    </section>
  );
}
