'use client';

import { Landmark, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { memberBankEvidence } from './member-bank-evidence';

interface BankLiquidityCardProps {
  readonly bankBalance: string;
  readonly loanDebt: string;
  readonly creditLimit: string;
  readonly isEn?: boolean;
}

export function BankLiquidityCard({ bankBalance, loanDebt, creditLimit, isEn = false }: BankLiquidityCardProps) {
  const evidence = memberBankEvidence({ bankBalance, loanDebt, creditLimit });

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/60 shadow-sm">
      <CardHeader className="space-y-2 border-b border-border/60 bg-muted/15 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Landmark aria-hidden="true" className="size-5 text-primary" />
          {isEn ? 'Your bank account and loan snapshot' : '내 예금·대출 조회 현황'}
        </CardTitle>
        <CardDescription>
          {isEn
            ? 'Figures come from your authenticated WLD bank standing, not from the bank-wide balance sheet.'
            : '인증된 회원의 WLD 은행 조회 결과입니다. 은행 전체 재무 현황이 아닙니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        {evidence ? (
          <>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [isEn ? 'Your deposits' : '내 예금 잔액', evidence.deposit],
                [isEn ? 'Outstanding loan' : '내 미상환 대출', evidence.outstanding],
                [isEn ? 'Credit limit' : '내 신용 한도', evidence.creditLimit],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-lg border border-border/70 p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-all font-mono text-base font-semibold tabular-nums">
                    {groupDigits(value)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2 rounded-lg border border-border/70 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold">{isEn ? 'Outstanding debt / credit limit' : '신용 한도 대비 미상환 대출'}</span>
                <span className="font-mono font-bold tabular-nums">
                  {evidence.debtToLimit ?? (isEn ? 'Not available' : '계산 불가')}
                </span>
              </div>
              {evidence.debtToLimitBar === null ? (
                <p className="text-xs text-muted-foreground">
                  {isEn ? 'A zero credit limit cannot be used as a denominator.' : '신용 한도가 0 WLD이므로 비율을 계산하지 않습니다.'}
                </p>
              ) : (
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${evidence.debtToLimitBar}%` }} />
                </div>
              )}
            </div>
          </>
        ) : (
          <p role="status" className="rounded-lg border border-amber-500/40 p-3 text-sm">
            {isEn ? 'Bank standing could not be verified. No estimate is displayed.' : '은행 조회값을 검증할 수 없어 추정 수치를 표시하지 않습니다.'}
          </p>
        )}
        <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {isEn
              ? 'This member-only snapshot does not prove bank-wide liquidity, a statutory reserve, guaranteed withdrawals or an applied interest rate. Loan terms are governed by the server.'
              : '이 회원별 조회값은 은행 전체 유동성·법정 지급준비금·인출 보장·실제 적용 금리를 증명하지 않습니다. 대출 조건은 서버 계약을 따릅니다.'}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}