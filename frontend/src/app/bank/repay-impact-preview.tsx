'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';
import { previewRepayAction } from './actions';
import { INTL_LOCALE } from './copy';
import { useBankCopy } from './use-bank-copy';

type Result = Awaited<ReturnType<typeof previewRepayAction>>;

export function RepayImpactPreview({ loanId, amount, repayComplete }: {
  readonly loanId: string;
  readonly amount: string;
  readonly repayComplete: boolean;
}) {
  const { c, locale } = useBankCopy();
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
    <section aria-label={c('repayRegion')} className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <Button type="button" variant="outline" disabled={pending || !/^[1-9][0-9]*$/.test(normalized)} onClick={preview}>
        {pending ? c('repayChecking') : c('repayButton')}
      </Button>
      <div aria-live="polite" aria-atomic="true" className="grid gap-1 text-xs">
        {visible?.status === 'error' && <p role="alert" className="text-destructive">{visible.message}</p>}
        {visible?.status === 'ok' && (
          <>
            <p>{c('repayPayable')}<strong>{groupDigits(visible.preview.payableAmount)} WLD</strong></p>
            <p>{c('repayCash', { before: groupDigits(visible.preview.cashBefore), after: visible.preview.cashAfter === null ? c('repayCannot') : `${groupDigits(visible.preview.cashAfter)} WLD` })}</p>
            <p>{c('repayDebt', { before: groupDigits(visible.preview.debtBefore), after: groupDigits(visible.preview.debtAfter) })}</p>
            {visible.preview.adjustmentAmount !== '0' && <p>{c('repayAdjustment', { amount: groupDigits(visible.preview.adjustmentAmount) })}</p>}
            {!visible.preview.eligible && <p role="alert" className="text-destructive">{c('repayInsufficient')}</p>}
            <p>{c('repayObserved', { time: Number.isFinite(Date.parse(visible.preview.observedAt)) ? new Date(visible.preview.observedAt).toLocaleString(INTL_LOCALE[locale]) : c('repayUnknown') })}</p>
            <p className="text-muted-foreground">{c('repayReadOnly')}</p>
          </>
        )}
      </div>
    </section>
  );
}
