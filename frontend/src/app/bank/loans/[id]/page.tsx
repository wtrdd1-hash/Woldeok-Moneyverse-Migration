import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { formatDay } from '@/lib/money';
import { requireMember } from '@/lib/session';
import type { LoanView } from '@/app/wallet/wallet-forms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '내 가상 대출 상세',
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUS: Record<LoanView['status'], string> = {
  active: '상환 중',
  overdue: '연체',
  repaid: '상환 완료',
};

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  let loan: LoanView;
  try {
    loan = await api<LoanView>(`/api/v1/bank/loans/${encodeURIComponent(id)}`);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <main data-page="bank-loan-detail" className="mv-page grid gap-4">
        <EmptyState title="대출 상세 정보를 불러올 수 없어요." description="잠시 후 다시 확인해 주세요. 기록이 없다고 판단하지 않습니다." />
        <Button asChild variant="outline"><Link href="/wallet">내 지갑으로 돌아가기</Link></Button>
      </main>
    );
  }

  return (
    <main data-page="bank-loan-detail" className="mv-page grid gap-5">
      <Button asChild variant="ghost" className="w-fit"><Link href="/wallet">← 내 지갑</Link></Button>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">가상 대출 상세</h1>
        <p className="text-sm text-muted-foreground">실제 화폐가 아닌 WLD 가상 대출 기록입니다. 최근 20건 이내에서만 상세 조회가 가능합니다.</p>
      </header>
      <Card>
        <CardHeader><CardTitle>확인된 대출 기록</CardTitle></CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-muted-foreground">상태</dt><dd className="font-semibold">{STATUS[loan.status]}</dd></div>
            <div><dt className="text-muted-foreground">대출일</dt><dd>{formatDay(loan.issuedAt)}</dd></div>
            <div><dt className="text-muted-foreground">원금</dt><dd><Amount value={loan.principalAmount} currency /></dd></div>
            <div><dt className="text-muted-foreground">이자</dt><dd><Amount value={loan.interestAmount} currency /></dd></div>
            <div><dt className="text-muted-foreground">남은 상환액</dt><dd className="font-bold"><Amount value={loan.outstandingAmount} currency /></dd></div>
            {loan.repaidAt && <div><dt className="text-muted-foreground">상환 완료일</dt><dd>{formatDay(loan.repaidAt)}</dd></div>}
          </dl>
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">대출 참조번호</p>
            <code className="block break-all text-xs" data-testid="loan-reference">{loan.loanId}</code>
          </div>
          {loan.status !== 'repaid' && (
            <Button asChild><Link href="/wallet">내 지갑에서 상환하기</Link></Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
