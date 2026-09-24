'use client';

import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import type { AdminBankOverview, AdminCreditGrade, AdminLoan } from '../types';

interface Props {
  readonly overview: AdminBankOverview;
  readonly grades: readonly AdminCreditGrade[];
  readonly loans: readonly AdminLoan[];
}

export function BankRiskDashboard({ overview, grades, loans }: Props) {
  const activeLoans = loans.filter((l) => l.status === 'active');
  const overdueLoans = loans.filter((l) => l.status === 'overdue');
  const totalPrincipal = loans.reduce((acc, l) => acc + BigInt(l.principal_amount || '0'), 0n);
  const overduePrincipal = overdueLoans.reduce((acc, l) => acc + BigInt(l.principal_amount || '0'), 0n);

  const overdueRatioPercent =
    totalPrincipal > 0n ? Number((overduePrincipal * 1000n) / totalPrincipal) / 10 : 0;

  const totalGradeOutstanding = grades.reduce(
    (acc, g) => acc + BigInt(g.outstanding_amount || '0'),
    0n,
  );

  const getRiskStatus = (ratio: number) => {
    if (ratio >= 30) return { label: '심각 (High Risk)', variant: 'destructive' as const, desc: '연체율이 30%를 초과하여 대손 충당금 확충 및 긴급 회수 조치가 시급합니다.' };
    if (ratio >= 15) return { label: '경고 (Warning)', variant: 'outline' as const, desc: '연체율이 15% 이상입니다. 신규 여신 승인 한도 축소를 권고합니다.' };
    if (ratio >= 5) return { label: '주의 (Caution)', variant: 'secondary' as const, desc: '일부 연체 대출이 식별되었습니다. 모니터링 주기를 단축하세요.' };
    return { label: '건전 (Healthy)', variant: 'default' as const, desc: '전체 연체율이 5% 미만으로 은행 여신 건전성이 우수하게 유지되고 있습니다.' };
  };

  const riskStatus = getRiskStatus(overdueRatioPercent);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 1. 여신 리스크 종합 게이지 */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base">은행 여신 리스크 & 건전성 모니터링</CardTitle>
            <Badge variant={riskStatus.variant} className="text-xs font-bold">
              {riskStatus.label}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            전체 대출 자산 대비 연체 원금 비율과 부실채권(NPL) 위험도를 평가합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/60 bg-surface/50 p-3">
              <span className="text-[11px] text-muted-foreground block mb-0.5">총 대출 건수</span>
              <span className="text-lg font-bold font-mono tracking-tight text-foreground">
                {loans.length} <span className="text-xs font-normal text-muted-foreground font-sans">건</span>
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-surface/50 p-3">
              <span className="text-[11px] text-muted-foreground block mb-0.5">정상 상환 중</span>
              <span className="text-lg font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {activeLoans.length} <span className="text-xs font-normal text-muted-foreground font-sans">건</span>
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-surface/50 p-3 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground block mb-0.5">연체 대출 건수</span>
              <span className="text-lg font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {overdueLoans.length} <span className="text-xs font-normal text-muted-foreground font-sans">건</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">연체 원금 비율 (NPL Ratio)</span>
              <span className="font-mono font-bold text-foreground">
                {overdueRatioPercent.toFixed(1)}% <span className="text-[11px] font-normal text-muted-foreground">({groupDigits(overduePrincipal.toString())} / {groupDigits(totalPrincipal.toString())} WLD)</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-500 ${
                  overdueRatioPercent > 30
                    ? 'bg-rose-500'
                    : overdueRatioPercent > 15
                    ? 'bg-amber-500'
                    : overdueRatioPercent > 5
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, overdueRatioPercent))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-surface/80 border border-border/60 rounded-xl p-3">
            💡 <strong className="text-foreground">리스크 진단</strong>: {riskStatus.desc}
          </p>
        </CardContent>
      </Card>

      {/* 2. 신용등급별 대출 잔액 및 점유율 수평 바 차트 */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>신용등급별 대출 잔액 점유율</span>
            <span className="text-xs font-normal text-muted-foreground font-mono">
              총 {grades.length}개 등급
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            신용등급(1~5)별 대출 잔액 비중과 이자율, 대출 건수 현황입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {grades.map((grade) => {
            const gradeAmt = BigInt(grade.outstanding_amount || '0');
            const sharePercent =
              totalGradeOutstanding > 0n
                ? Number((gradeAmt * 1000n) / totalGradeOutstanding) / 10
                : 0;

            return (
              <div key={grade.grade} className="grid gap-1.5 rounded-xl border border-border/60 p-3 bg-surface/40">
                <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono font-bold text-xs px-2">
                      등급 {grade.grade}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">
                      이자율: <span className="font-mono font-semibold">{(grade.interest_bps / 100).toFixed(1)}%</span> | 한도: <span className="font-mono">{groupDigits(grade.credit_limit)}</span> WLD
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-medium">
                    <span>{groupDigits(grade.open_loan_count)}건</span>
                    <span className="text-primary font-bold">({sharePercent.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, sharePercent))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>대출 잔액</span>
                  <span className="font-mono font-bold text-foreground">
                    {groupDigits(grade.outstanding_amount)} WLD
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
