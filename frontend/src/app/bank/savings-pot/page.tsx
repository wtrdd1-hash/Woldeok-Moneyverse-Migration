import type { Metadata } from 'next';
import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import type { BankStanding } from '../types';
import { parseVerifiedWld } from './savings-challenge-math';
import { SavingsChallengePlanner } from './savings-challenge-planner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '회원 전용 가상 저축 목표 계산기 | 월덕 머니버스',
  description: '실제 서버에서 조회한 회원의 가상 은행 잔액을 바탕으로 저축 목표를 계산하는 읽기 전용 도구입니다.',
  robots: { index: false, follow: false },
};

export default async function SavingsChallengePotPage() {
  await requireMember();

  const standing = await apiOrNull<Pick<BankStanding, 'bank_balance' | 'cash_balance'>>(
    '/api/v1/banking/standing',
  );
  const bankBalance = parseVerifiedWld(standing?.bank_balance);
  const cashBalance = parseVerifiedWld(standing?.cash_balance);

  if (bankBalance === null || cashBalance === null) {
    return (
      <main data-page="savings-challenge" className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold">가상 저축 목표 계산기</h1>
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          은행 잔액을 확인할 수 없습니다. 추정 잔액이나 가상 입금 기록을 대신 표시하지 않습니다.
        </p>
        <Link href="/bank" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2">
          은행 화면에서 다시 확인하기
        </Link>
      </main>
    );
  }

  return <SavingsChallengePlanner bankBalance={bankBalance} cashBalance={cashBalance} />;
}
