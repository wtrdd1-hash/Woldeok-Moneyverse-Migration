import { Amount } from '@/components/amount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface LoanObligations {
  readonly currency: 'WLD';
  readonly loanCount: number;
  readonly activeCount: number;
  readonly overdueCount: number;
  readonly repaidCount: number;
  readonly outstandingAmount: string;
  readonly overdueOutstandingAmount: string;
}

/** Snapshot from the authenticated bank_my_loans read model, never a repayment promise. */
export function LoanObligationsCard({
  summary, isEn,
}: {
  readonly summary: LoanObligations | null;
  readonly isEn: boolean;
}) {
  return (
    <Card data-testid="loan-obligations">
      <CardHeader>
        <CardTitle>{isEn ? 'My virtual loan obligations' : '내 가상 대출 현황'}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3" aria-live="polite">
        {!summary ? (
          <p role="status" className="text-sm text-muted-foreground">
            {isEn ? 'Cannot load loan obligations right now.' : '지금은 대출 현황을 불러올 수 없어요.'}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {isEn ? 'Total outstanding' : '남은 대출금 합계'}
            </p>
            <p className="text-xl font-semibold break-all"><Amount value={summary.outstandingAmount} currency /></p>
            <p className="text-sm">
              {isEn ? `Active: ${summary.activeCount} · Overdue: ${summary.overdueCount} · Repaid: ${summary.repaidCount}`
                : `상환 중 ${summary.activeCount}건 · 연체 ${summary.overdueCount}건 · 상환 완료 ${summary.repaidCount}건`}
            </p>
            {summary.overdueCount > 0 && (
              <p className="text-sm text-destructive">
                {isEn ? 'Overdue outstanding' : '연체 잔액'}: <Amount value={summary.overdueOutstandingAmount} currency />
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {isEn ? 'Snapshot only. Repayment eligibility is rechecked when you submit.'
                : '조회 시점의 기록이며 실제 상환 가능 여부는 실행 시 다시 확인합니다.'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
