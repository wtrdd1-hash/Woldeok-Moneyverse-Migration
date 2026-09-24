import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { Figure } from '../economy/economy-parts';
import type { AdminBankOverview, AdminCreditGrade, AdminLoan } from '../types';
import { BankRiskDashboard } from './bank-risk-dashboard';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/bank');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/** `virtual_bank_loans.status` (035, widened by 076), in Korean. */
const STATUS_LABELS: Readonly<Record<string, string>> = {
  active: '상환 중',
  overdue: '연체',
  repaid: '상환 완료',
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/** Basis points as a rate a person reads. `interest_bps` is an integer (076). */
function ratePercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

export default async function AdminBankPage() {
  await requireAdminConsole(AREA.href);
  const console_ = await apiOrNull<{
    readonly overview: AdminBankOverview;
    readonly grades: readonly AdminCreditGrade[];
    readonly loans: readonly AdminLoan[];
  }>('/api/v1/admin/bank');

  return (
    <div data-page="admin-bank" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {console_ === null ? (
        <EmptyState
          title="은행 현황을 불러오지 못했어요."
          description="잔액을 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
        />
      ) : (
        <>
          {/* 실시간 여신 건전성 및 신용등급 리스크 대시보드 */}
          <BankRiskDashboard
            overview={console_.overview}
            grades={console_.grades}
            loans={console_.loans}
          />

          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base">은행 기본 장부 요약</CardTitle>
              <CardDescription className="text-xs">
                중앙은행 지급준비금 및 예치금 총액, 대출 채권 합산
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Figure
                  label="은행 예치금 총액"
                  amount={console_.overview.total_bank_balance}
                  hint="사용자가 은행 계좌에 예치한 원금 총합"
                />
                <Figure
                  label="중앙은행 지급준비금"
                  amount={console_.overview.central_reserve_balance}
                  hint="지급준비율 정책에 따라 락업된 준비 자금"
                />
                <Figure
                  label="대출 원금 잔액"
                  amount={console_.overview.total_loan_principal}
                  hint="현재 실행 중인 전체 대출 원금 합계"
                />
                <Figure
                  label="대출 이자 미수금"
                  amount={console_.overview.total_loan_interest}
                  hint="원금 외 누적된 이자 채권 총액"
                />
              </div>
            </CardContent>
          </Card>

          {/* 대출 실행 목록 */}
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader>
              <SectionHeader
                title="실행 중인 대출 목록"
                description={`현재 은행 장부에 기록된 ${console_.loans.length}건의 대출 계약입니다.`}
              />
            </CardHeader>
            <CardContent className="p-0">
              {/* 모바일 뷰: 카드 스택 (md:hidden) */}
              <div className="grid gap-3 p-4 md:hidden divide-y divide-border/40">
                {console_.loans.map((loan) => (
                  <div key={loan.loan_id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{loan.display_name}</span>
                      <Badge
                        variant={
                          loan.status === 'overdue'
                            ? 'destructive'
                            : loan.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[11px] font-bold"
                      >
                        {statusLabel(loan.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-0.5">대출 원금</span>
                        <span className="font-mono font-bold text-foreground">
                          {groupDigits(loan.principal_amount)} WLD
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-0.5">누적 이자</span>
                        <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {groupDigits(loan.interest_amount)} WLD
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>금리: <span className="font-mono font-semibold text-foreground">{ratePercent(loan.interest_bps)}</span></span>
                      <span>만기일: <span className="font-mono">{formatMoment(loan.due_at)}</span></span>
                    </div>
                  </div>
                ))}
                {console_.loans.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    실행 중인 대출이 없습니다.
                  </div>
                )}
              </div>

              {/* 데스크톱 뷰: 테이블 (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">차주 (사용자)</TableHead>
                      <TableHead className="text-xs">상태</TableHead>
                      <TableHead className="text-right text-xs">대출 원금</TableHead>
                      <TableHead className="text-right text-xs">누적 이자</TableHead>
                      <TableHead className="text-right text-xs">적용 금리</TableHead>
                      <TableHead className="text-right text-xs">만기 일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {console_.loans.map((loan) => (
                      <TableRow key={loan.loan_id} className="hover:bg-surface/50">
                        <TableCell className="font-bold text-xs">{loan.display_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              loan.status === 'overdue'
                                ? 'destructive'
                                : loan.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-[11px] font-bold"
                          >
                            {statusLabel(loan.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs">
                          {groupDigits(loan.principal_amount)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-rose-600 dark:text-rose-400">
                          {groupDigits(loan.interest_amount)} WLD
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {ratePercent(loan.interest_bps)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatMoment(loan.due_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {console_.loans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                          실행 중인 대출 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
