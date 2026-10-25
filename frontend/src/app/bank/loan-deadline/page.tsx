import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '가상 대출 만기·상환 준비 | 월덕 머니버스',
  robots: {index: false, follow: false},
};

interface DeadlineSnapshot {
  readonly hasActiveLoan: boolean;
  readonly quoteOnly: true;
  readonly observedAt: string;
  readonly loanStatus?: 'active' | 'overdue';
  readonly maturityAt?: string;
  readonly dueState?: 'scheduled' | 'due_soon' | 'overdue';
  readonly daysUntilDue?: number | null;
  readonly overdueDays?: number | null;
  readonly outstandingAmount?: string;
  readonly minimumRepayment?: string;
  readonly cashBalance?: string;
  readonly canCoverMinimum?: boolean | null;
}

const DECIMAL = /^(0|[1-9][0-9]*)$/;
function isVerified(value: DeadlineSnapshot | null): value is DeadlineSnapshot {
  if (!value || value.quoteOnly !== true || !Number.isFinite(Date.parse(value.observedAt))) return false;
  if (value.hasActiveLoan === false) return true;
  return value.hasActiveLoan === true &&
    ['scheduled', 'due_soon', 'overdue'].includes(value.dueState ?? '') &&
    Number.isFinite(Date.parse(value.maturityAt ?? '')) &&
    ['outstandingAmount', 'minimumRepayment', 'cashBalance'].every((key) => {
      const amount = value[key as keyof DeadlineSnapshot];
      return typeof amount === 'string' && amount.length <= 128 && DECIMAL.test(amount);
    }) &&
    (typeof value.canCoverMinimum === 'boolean' || value.canCoverMinimum === null) &&
    (value.daysUntilDue === null || (typeof value.daysUntilDue === 'number' && Number.isSafeInteger(value.daysUntilDue) && value.daysUntilDue >= 0)) &&
    (value.overdueDays === null || (typeof value.overdueDays === 'number' && Number.isSafeInteger(value.overdueDays) && value.overdueDays >= 0));
}

export default async function LoanDeadlinePage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';
  const snapshot = await apiOrNull<DeadlineSnapshot>('/api/v1/banking/loan-deadline');
  const valid = isVerified(snapshot);

  const status = snapshot?.dueState === 'overdue'
    ? (isEn ? 'Maturity passed' : '만기 경과')
    : snapshot?.dueState === 'due_soon'
      ? (isEn ? 'Due within 7 days' : '7일 이내 만기')
      : (isEn ? 'Scheduled maturity' : '만기 예정');

  return (
    <main data-page="bank-loan-deadline" className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{isEn ? 'Virtual loan maturity and cash readiness' : '가상 대출 만기·상환 준비 현황'}</h1>
        <p className="text-sm text-muted-foreground">
          {isEn ? 'Verified read-only snapshot. No repayment or reminder is scheduled.' :
            '조회 시점의 대출 정보만 표시합니다. 실제 상환이나 알림 예약이 실행되지 않습니다.'}
        </p>
        <Button asChild variant="outline"><Link href="/bank">{isEn ? 'Back to bank' : '은행으로 돌아가기'}</Link></Button>
      </header>
      {!valid ? (
        <p role="alert" className="rounded-lg border border-destructive p-4">
          {isEn ? 'Cannot verify loan maturity information right now.' : '현재 대출 만기 정보를 확인할 수 없습니다.'}
        </p>
      ) : !snapshot.hasActiveLoan ? (
        <p className="rounded-lg border p-4">{isEn ? 'No active loan to repay.' : '상환 중인 대출이 없습니다.'}</p>
      ) : (
        <Card>
          <CardHeader><CardTitle>{status}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{isEn ? 'Maturity date' : '계약상 만기 시각'}: <time dateTime={snapshot.maturityAt}>
              {new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul'}).format(new Date(snapshot.maturityAt!))}
            </time></p>
            {snapshot.dueState === 'overdue' ? (
              <p role="status">{isEn ? `At least ${snapshot.overdueDays} whole days since maturity (snapshot).` : `만기 이후 ${snapshot.overdueDays}일 경과(완료된 일수 기준)`}</p>
            ) : (
              <p role="status">{isEn ? `Up to ${snapshot.daysUntilDue} calendar days until maturity.` : `만기까지 약 ${snapshot.daysUntilDue}일(부분 일수 올림)`}</p>
            )}
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt>{isEn ? 'Outstanding virtual WLD' : '미상환 가상 WLD'}</dt><dd><Amount value={snapshot.outstandingAmount!} /></dd></div>
              <div><dt>{isEn ? 'Minimum repayment (capped at debt)' : '최소 상환액(미상환액 이내)'}</dt><dd><Amount value={snapshot.minimumRepayment!} /></dd></div>
              <div><dt>{isEn ? 'Current cash' : '현재 보유 현금'}</dt><dd><Amount value={snapshot.cashBalance!} /></dd></div>
            </dl>
            <p aria-live="polite" className="rounded-md border p-3">
              {snapshot.canCoverMinimum === null
                ? (isEn ? 'No positive minimum repayment is specified; cash readiness is unknown.' : '설정된 양의 최소 상환액이 없어 현금 충당 여부를 판단할 수 없습니다.')
                : snapshot.canCoverMinimum
                  ? (isEn ? 'Current cash covers the minimum repayment.' : '현재 현금으로 최소 상환액을 충당할 수 있습니다.')
                  : (isEn ? 'Current cash cannot cover the minimum repayment.' : '최소 상환액을 충당할 현금이 부족합니다.')}
            </p>
            <p className="text-muted-foreground">
              {isEn ? 'This is not a payment receipt or automated reminder. The authoritative bank function checks balances again at repayment.' :
                '이 화면은 납부 영수증이나 자동 알림이 아닙니다. 실제 상환 시 은행 원장 함수가 잔액과 상태를 다시 검증합니다.'}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
