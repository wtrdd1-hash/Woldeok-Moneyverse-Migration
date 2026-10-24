import type { Metadata } from 'next';
import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { BorrowQuoteCard, type BorrowQuoteView } from './borrow-quote-card';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '가상 은행 신규 대출 예상 견적', robots: { index: false, follow: false } };

export default async function BorrowQuotePage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  await requireMember();
  const { amount } = await searchParams;
  const valid = typeof amount === 'string' && /^[1-9][0-9]{0,99}$/.test(amount) && BigInt(amount) >= 100n;
  const quote = valid ? await apiOrNull<BorrowQuoteView>(`/api/v1/banking/borrow-quote?amount=${encodeURIComponent(amount)}`) : null;
  return (
    <main className="mx-auto max-w-xl space-y-6 py-8 px-4">
      <Link href="/bank" className="text-sm underline">← 가상 은행으로 돌아가기</Link>
      <h1 className="text-2xl font-bold">신규 가상 대출 예상 견적</h1>
      <p className="text-sm text-muted-foreground">현재 은행 정책을 조회한 읽기 전용 견적입니다. 대출 신청이나 WLD 이동은 발생하지 않습니다.</p>
      <form action="/bank/borrow-quote" method="get" className="space-y-3">
        <label htmlFor="borrow-amount" className="block font-medium">신규 대출 희망 원금 (WLD)</label>
        <input id="borrow-amount" name="amount" type="text" inputMode="numeric" pattern="[1-9][0-9]*" minLength={3} maxLength={100} required defaultValue={valid ? amount : ''} className="w-full rounded-lg border bg-background p-3" autoComplete="off" />
        <button type="submit" className="rounded-lg bg-primary px-5 py-3 text-primary-foreground">현재 정책으로 예상 견적 조회</button>
      </form>
      {amount !== undefined && !valid && <p role="alert">100 WLD 이상의 올바른 정수 금액을 입력하세요.</p>}
      {valid && (quote ? <BorrowQuoteCard quote={quote} /> : <p role="alert">은행 정책을 조회할 수 없습니다. 잠시 후 다시 시도하세요.</p>)}
    </main>
  );
}
