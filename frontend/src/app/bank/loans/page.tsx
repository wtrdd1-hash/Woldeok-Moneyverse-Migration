import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { LoanHistoryPanel, type LoanHistoryEntry, type LoanStatusFilter } from '../loan-history-panel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 가상 대출 기록',
  robots: { index: false, follow: false },
};

export default async function LoanHistoryPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requireMember();
  const query = await searchParams;
  const requested = query.status;
  const status: LoanStatusFilter = typeof requested === 'string' &&
    (requested === 'active' || requested === 'overdue' || requested === 'repaid') ? requested : 'all';
  const [response, locale] = await Promise.all([
    apiOrNull<{ loans: LoanHistoryEntry[] }>(`/api/v1/bank/loans?status=${status}`),
    getServerLocale(),
  ]);
  const isEn = locale === 'en';

  return (
    <main data-page="bank-loans" className="mv-page mv-page--finance space-y-5">
      <Link href="/bank" className="inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline focus-visible:outline-2">
        <ArrowLeft className="size-4" aria-hidden />{isEn ? 'Back to Bank' : '은행으로 돌아가기'}
      </Link>
      <h1 className="text-2xl font-bold">{isEn ? 'My virtual loan history' : '내 가상 대출 기록'}</h1>
      <p className="text-sm text-muted-foreground">
        {isEn ? 'View your active, overdue and repaid virtual loans.' : '상환 중·연체·상환 완료된 가상 대출 기록을 확인하세요.'}
      </p>
      <LoanHistoryPanel loans={response?.loans ?? null} status={status} isEn={isEn} />
    </main>
  );
}
