import Link from 'next/link';
import { Amount } from '@/components/amount';
import { Card, CardContent } from '@/components/ui/card';
import { formatMoment } from '@/lib/money';

export type LoanStatusFilter = 'all' | 'active' | 'overdue' | 'repaid';

export interface LoanHistoryEntry {
  readonly loanId: string;
  readonly principalAmount: string;
  readonly interestAmount: string;
  readonly outstandingAmount: string;
  readonly status: 'active' | 'overdue' | 'repaid';
  readonly issuedAt: string;
  readonly repaidAt: string | null;
}

const filters: readonly LoanStatusFilter[] = ['all', 'active', 'overdue', 'repaid'];

export function LoanHistoryPanel({
  loans,
  status,
  isEn,
}: {
  readonly loans: readonly LoanHistoryEntry[] | null;
  readonly status: LoanStatusFilter;
  readonly isEn: boolean;
}) {
  const labels = isEn
    ? { all: 'All', active: 'Active', overdue: 'Overdue', repaid: 'Repaid' }
    : { all: '전체', active: '상환 중', overdue: '연체', repaid: '상환 완료' };

  return (
    <div className="space-y-4">
      <nav aria-label={isEn ? 'Loan status' : '대출 상태'} className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter}
            href={filter === 'all' ? '/bank/loans' : `/bank/loans?status=${filter}`}
            aria-current={status === filter ? 'page' : undefined}
            className={`rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${status === filter ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
          >
            {labels[filter]}
          </Link>
        ))}
      </nav>
      {loans === null ? (
        <p role="status" className="rounded-lg border p-4 text-muted-foreground">
          {isEn ? 'Loan history is unavailable.' : '대출 기록을 불러올 수 없습니다.'}
        </p>
      ) : loans.length === 0 ? (
        <p role="status" className="rounded-lg border p-4 text-muted-foreground">
          {isEn ? 'No loans match this status.' : '이 상태에 해당하는 대출 기록이 없습니다.'}
        </p>
      ) : (
        <ol className="grid gap-3">
          {loans.map((loan) => (
            <li key={loan.loanId}>
              <Card>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{labels[loan.status]}</strong>
                    <time dateTime={loan.issuedAt} className="text-xs text-muted-foreground">{formatMoment(loan.issuedAt)}</time>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <dt>{isEn ? 'Principal' : '대출 원금'}</dt><dd className="text-right"><Amount value={loan.principalAmount} currency /></dd>
                    <dt>{isEn ? 'Interest' : '이자'}</dt><dd className="text-right"><Amount value={loan.interestAmount} currency /></dd>
                    <dt>{isEn ? 'Outstanding' : '남은 상환액'}</dt><dd className="text-right"><Amount value={loan.outstandingAmount} currency /></dd>
                    {loan.repaidAt && <><dt>{isEn ? 'Repaid on' : '상환 완료일'}</dt><dd className="text-right">{formatMoment(loan.repaidAt)}</dd></>}
                  </dl>
                  <p className="break-all text-xs text-muted-foreground">{isEn ? 'Loan ID' : '대출 ID'}: {loan.loanId}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-muted-foreground">
        {isEn ? 'Records are from your verified virtual-bank ledger. Repayments are managed in the Bank screen.' : '본인 가상 은행의 확인된 기록만 표시합니다. 상환은 은행 화면에서 진행할 수 있습니다.'}
      </p>
    </div>
  );
}
