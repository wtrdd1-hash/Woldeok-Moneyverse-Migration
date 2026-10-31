import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { bankLoanStatus, parseBankLoans, type BankLoanStatus } from '@/lib/bank-loan-status';
import { requireMember } from '@/lib/session';
import { LoanList } from '../wallet-forms';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const metadata: Metadata = { title: '내 가상 대출 내역', robots: { index: false, follow: false } };
const OPTIONS: readonly [BankLoanStatus, string][] = [
  ['all', '전체'], ['active', '상환 중'], ['overdue', '연체'], ['repaid', '상환 완료'],
];
export default async function BankLoansPage({ searchParams }: {
  searchParams?: Promise<{ status?: string | string[] }>;
}) {
  await requireMember();
  const params = await searchParams;
  const status = bankLoanStatus(params?.status);
  const path = status === 'all' ? '/api/v1/bank/loans' : `/api/v1/bank/loans?status=${status}`;
  const payload = await apiOrNull<unknown>(path);
  const loans = parseBankLoans(payload, status);
  return (
    <div data-page="bank-loans" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="VIRTUAL BANK" title="내 가상 대출 내역">상태별로 최근 가상 대출을 확인할 수 있습니다.</PageHeader>
      <nav aria-label="대출 상태 필터" className="flex flex-wrap gap-2">
        {OPTIONS.map(([value, label]) => (
          <Button asChild size="sm" variant={value === status ? 'default' : 'outline'} key={value}>
            <Link href={value === 'all' ? '/wallet/loans' : `/wallet/loans?status=${value}`}
              aria-current={value === status ? 'page' : undefined}>{label}</Link>
          </Button>
        ))}
      </nav>
      <p className="text-sm text-muted-foreground">최근 20건의 본인 대출 중 선택한 상태만 표시합니다. 전체 기간 대출 검색이나 정산 증명이 아닙니다.</p>
      <Card><CardContent className="pt-6">
        {loans === null ? (
          <EmptyState title="대출 내역을 불러올 수 없어요." description="확인되지 않은 기록을 빈 목록으로 표시하지 않습니다. 잠시 후 다시 시도해 주세요." />
        ) : loans.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">최근 20건에 해당 상태의 대출이 없습니다.</p>
        ) : <LoanList loans={loans} />}
      </CardContent></Card>
      <Button asChild variant="outline" className="min-h-11 w-fit"><Link href="/wallet">내 지갑으로 돌아가기</Link></Button>
    </div>
  );
}
