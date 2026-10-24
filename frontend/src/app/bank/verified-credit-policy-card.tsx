import Link from 'next/link';
import { Amount } from '@/components/amount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VerifiedCreditPolicy {
  readonly creditGrade: string;
  readonly creditLimitWld: string;
  readonly interestRateBps: number;
  readonly termDays: number;
  readonly minimumRepaymentWld: string;
  readonly activeLoanOutstandingWld: string | null;
  readonly activeLoanStatus: 'active' | 'overdue' | null;
  readonly hasActiveLoan: boolean;
  readonly canRequestNewLoan: boolean;
  readonly source: 'BANK_STANDING';
}

export function VerifiedCreditPolicyCard({ policy, details = false }: {
  readonly policy: VerifiedCreditPolicy | null;
  readonly details?: boolean;
}) {
  if (!policy || policy.source !== 'BANK_STANDING') {
    return <Card><CardHeader><CardTitle className="text-base">검증된 대출 정책을 불러올 수 없습니다.</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">확인되지 않은 신용 점수나 대출 한도를 표시하지 않습니다.</p></CardContent></Card>;
  }
  const status = policy.activeLoanStatus === 'overdue' ? '연체 중인 가상 대출' :
    policy.hasActiveLoan ? '상환 중인 가상 대출' :
      policy.canRequestNewLoan ? '신규 신청 가능' : '신규 신청 한도 없음';
  return (
    <Card className="border-border/80 bg-background/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">확인된 가상 은행 신용 정책</CardTitle>
        <p className="text-sm text-muted-foreground">현재 은행 원장 조회 기준 · 게임 내 가상 정책이며 실제 금융 신용평가가 아닙니다.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="text-sm">정책 신용 등급: <strong>{policy.creditGrade}</strong></p>
          <p className="text-sm">대출 상태: <strong>{status}</strong></p>
          <p className="text-sm break-all">정책상 최대 한도: <strong><Amount value={policy.creditLimitWld} /> WLD</strong></p>
          <p className="text-sm">계약 기간 이자율: <strong>{(policy.interestRateBps / 100).toFixed(2)}%</strong></p>
          <p className="text-sm">계약 기간: <strong>{policy.termDays}일</strong></p>
          <p className="text-sm break-all">정책상 최소 상환액: <strong><Amount value={policy.minimumRepaymentWld} /> WLD</strong></p>
          {policy.activeLoanOutstandingWld !== null && (
            <p className="text-sm break-all">기존 대출 미상환액: <strong><Amount value={policy.activeLoanOutstandingWld} /> WLD</strong></p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">신청 가능 여부는 실행 시 재검증합니다. 이 화면은 대출 승인이나 이율 확약이 아닙니다.</p>
        {!details && <Link href="/bank/credit-policy" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">신용 정책 자세히 보기</Link>}
        {details && <Link href="/bank" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">은행으로 돌아가기</Link>}
      </CardContent>
    </Card>
  );
}
