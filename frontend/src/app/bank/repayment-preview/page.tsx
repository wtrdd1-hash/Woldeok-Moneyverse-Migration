import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { RepaymentPreviewCard } from './repayment-preview-card';
import type { RepaymentPreview } from './types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '가상 대출 상환 미리보기',
  robots: { index: false, follow: false },
};

export default async function BankRepaymentPreviewPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMember();
  const params = await searchParams;
  const attempted = params.amount !== undefined;
  const amount = typeof params.amount === 'string' ? params.amount : '';
  const valid = /^[1-9][0-9]{0,99}$/.test(amount);
  let preview: RepaymentPreview | null = null;
  let message: string | null = null;

  if (attempted && !valid) {
    message = '1 WLD 이상의 정수 금액을 입력해 주세요 (최대 100자리).';
  } else if (attempted) {
    try {
      preview = await api<RepaymentPreview>('/api/v1/banking/repayment-preview?amount=' + encodeURIComponent(amount));
    } catch (error) {
      message = error instanceof ApiError && error.status === 409
        ? '현재 조회할 수 있는 미상환 대출이 없습니다.'
        : '대출 상환 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    }
  }

  return (
    <main data-page="bank-repayment-preview" className="mx-auto grid w-full max-w-3xl gap-5 pb-16">
      <Link href="/bank" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">
        ← 가상 은행
      </Link>
      <h1 className="text-2xl font-bold">대출 상환 미리보기</h1>
      <p className="text-sm text-muted-foreground">
        실제 원장에 기록된 본인 대출과 현금 잔액을 기준으로 예상 상환액을 확인합니다. 미리보기는 거래를 실행하지 않습니다.
      </p>
      <form action="/bank/repayment-preview" method="GET" className="grid gap-3 rounded-xl border p-5">
        <label htmlFor="repayment-preview-amount" className="font-semibold">미리 확인할 상환 금액 (WLD)</label>
        <input
          id="repayment-preview-amount"
          name="amount"
          type="text"
          inputMode="numeric"
          pattern="[1-9][0-9]*"
          maxLength={100}
          autoComplete="off"
          defaultValue={valid ? amount : ''}
          placeholder="예: 1000"
          required
          className="min-h-11 w-full rounded-md border bg-background px-3"
        />
        <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
          잔액 및 상환 가능 여부 확인
        </button>
      </form>
      {message ? <p role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{message}</p> : null}
      {preview ? <RepaymentPreviewCard preview={preview} /> : null}
    </main>
  );
}
