import Link from 'next/link';
import { groupDigits } from '@/lib/money';
import type { RepaymentPreview } from './types';

export function RepaymentPreviewCard({ preview }: { readonly preview: RepaymentPreview }) {
  const label = preview.reason === 'INSUFFICIENT_CASH'
    ? '현금 잔액이 부족하여 현재 상환할 수 없습니다.'
    : preview.reason === 'CAPPED_TO_OUTSTANDING'
      ? '요청액이 남은 대출보다 커서 실제 상환액은 남은 부채로 제한됩니다.'
      : '현재 잔액 기준으로 상환이 가능해 보입니다.';
  return (
    <section aria-labelledby="repayment-preview-result" className="grid gap-4 rounded-xl border p-5">
      <h2 id="repayment-preview-result" className="text-lg font-bold">상환 미리보기 결과</h2>
      <p role="status" className={preview.canRepay ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}>{label}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">요청 상환액</dt><dd>{groupDigits(preview.requestedAmount)} WLD</dd></div>
        <div><dt className="text-muted-foreground">예상 실제 상환액</dt><dd>{groupDigits(preview.effectiveAmount)} WLD</dd></div>
        <div><dt className="text-muted-foreground">현재 현금</dt><dd>{groupDigits(preview.cashBalance)} WLD</dd></div>
        <div><dt className="text-muted-foreground">현재 미상환 부채</dt><dd>{groupDigits(preview.outstandingAmount)} WLD</dd></div>
        {preview.canRepay && preview.remainingCash !== null && preview.remainingDebt !== null ? (
          <>
            <div><dt className="text-muted-foreground">상환 후 예상 현금</dt><dd>{groupDigits(preview.remainingCash)} WLD</dd></div>
            <div><dt className="text-muted-foreground">상환 후 예상 부채</dt><dd>{groupDigits(preview.remainingDebt)} WLD</dd></div>
          </>
        ) : null}
      </dl>
      <p className="text-sm text-muted-foreground">
        미리보기는 WLD를 이동시키지 않습니다. 실제 상환 시 은행 서버와 원장에서 잔액·대출 상태를 다시 검증하며 결과가 달라질 수 있습니다.
      </p>
      <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline" href="/bank">
        은행으로 돌아가 실제 상환하기
      </Link>
    </section>
  );
}
