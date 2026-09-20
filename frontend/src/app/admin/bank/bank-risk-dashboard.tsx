'use client';

import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import type { AdminBankOverview, AdminCreditGrade, AdminLoan } from '../types';

interface BankRiskDashboardProps {
  readonly overview: AdminBankOverview;
  readonly grades: readonly AdminCreditGrade[];
  readonly loans: readonly AdminLoan[];
}

export function BankRiskDashboard({ overview, grades, loans: _loans }: BankRiskDashboardProps) {
  const _deposit = BigInt(overview.deposit_amount || '0');
  const outstanding = BigInt(overview.outstanding_amount || '0');
  const overdue = BigInt(overview.overdue_amount || '0');
  const issued24h = BigInt(overview.issued_24h_amount || '0');
  const repaid24h = BigInt(overview.repaid_24h_amount || '0');

  const overdueRatioPercent =
    outstanding > 0n ? Number((overdue * 1000n) / outstanding) / 10 : 0;

  const riskStatus = (() => {
    if (overdueRatioPercent > 30) {
      return {
        label: '🚨 고위험 (ALERT)',
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        desc: '연체율이 30%를 초과하여 대손 위험이 높습니다. 신규 대출 한도 축소 및 회수 조치가 필요합니다.',
      };
    }
    if (overdueRatioPercent > 15) {
      return {
        label: '⚠️ 주의 (WARNING)',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        desc: '연체율이 15% 이상입니다. 만기 도래 대출의 모니터링이 권장됩니다.',
      };
    }
    if (overdueRatioPercent > 5) {
      return {
        label: 'ℹ️ 보통 (MODERATE)',
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        desc: '연체율이 적정 관리 범위(5~15%) 내에 있습니다.',
      };
    }
    return {
      label: '✅ 정상 건전 (HEALTHY)',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      desc: '연체율이 5% 미만으로 매우 건전한 여신 포트폴리오를 유지하고 있습니다.',
    };
  })();

  const totalGradeOutstanding = grades.reduce(
    (sum, g) => sum + BigInt(g.outstanding_amount || '0'),
    0n,
  );

  return (
    <div className="grid gap-6">
      {/* 1. 은행 여신 건전성 및 리스크 요약 카드 */}
      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🏦</span> 은행 여신 건전성 & 연체 리스크 모니터링
              </CardTitle>
              <CardDescription>
                전체 대출 장부 대비 연체 잔액 비율 및 24시간 자금 흐름을 실시간 분석합니다.
              </CardDescription>
            </div>
            <Badge className={riskStatus.badgeClass}>{riskStatus.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          {/* 주요 4대 지표 그리드 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-muted/40 p-3.5 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">총 대출 잔액</span>
              <span className="font-semibold tabular text-primary">
                <Amount value={overview.outstanding_amount} />
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">연체 잔액 (Overdue)</span>
              <span className="font-semibold tabular text-rose-600 dark:text-rose-400">
                <Amount value={overview.overdue_amount} />
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">장부 연체율 (Ratio)</span>
              <span className="font-bold tabular text-base">
                {overdueRatioPercent.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">24h 넷 자금 흐름 (대출-상환)</span>
              <span className="font-semibold tabular">
                {issued24h >= repaid24h ? '+' : '-'}
                {groupDigits((issued24h >= repaid24h ? issued24h - repaid24h : repaid24h - issued24h).toString())} WLD
              </span>
            </div>
          </div>

          {/* 연체율 시각 게이지 */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>연체율 지수 게이지</span>
              <span className="font-semibold text-foreground">{overdueRatioPercent.toFixed(1)}% (연체 {groupDigits(overview.overdue_loan_count)}건)</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
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

          <p className="text-xs text-muted-foreground bg-background/50 border rounded-md p-2.5">
            💡 <strong>리스크 진단</strong>: {riskStatus.desc}
          </p>
        </CardContent>
      </Card>

      {/* 2. 신용등급별 대출 잔액 및 점유율 수평 바 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>📊 신용등급별 대출 잔액 점유율</span>
            <span className="text-xs font-normal text-muted-foreground tabular">
              총 {grades.length}개 등급
            </span>
          </CardTitle>
          <CardDescription>
            신용등급(A~F / 등급 1~5)별 대출 잔액 비중과 이자율, 대출 건수 현황입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3.5">
          {grades.map((grade) => {
            const gradeAmt = BigInt(grade.outstanding_amount || '0');
            const sharePercent =
              totalGradeOutstanding > 0n
                ? Number((gradeAmt * 1000n) / totalGradeOutstanding) / 10
                : 0;

            return (
              <div key={grade.grade} className="grid gap-1.5 rounded-md border p-3 bg-muted/20">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono font-bold text-xs px-2">
                      등급 {grade.grade}
                    </Badge>
                    <span className="text-muted-foreground">
                      이자율: {(grade.interest_bps / 100).toFixed(1)}% | 한도: {groupDigits(grade.credit_limit)} WLD
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular font-medium">
                    <span>{groupDigits(grade.open_loan_count)}건 대출 중</span>
                    <span className="text-primary font-semibold">({sharePercent.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, sharePercent))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>대출 잔액</span>
                  <Amount value={grade.outstanding_amount} className="font-medium text-foreground" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
