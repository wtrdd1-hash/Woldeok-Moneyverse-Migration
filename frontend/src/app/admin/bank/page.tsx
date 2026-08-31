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

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/bank');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

/**
 * The loan book, which nobody could read.
 *
 * 096 applied 14.4's credit ladder -- a member under seven days old or with
 * fewer than ten paid tasks cannot borrow, and each grade carries its own
 * ceiling and rate. Whether that was set right is a question about the book,
 * and the book was only ever visible one member at a time through
 * `bank_my_loans`.
 *
 * The totals come from `admin_bank_overview`, which counts every loan, and the
 * table below is a bounded page of the open ones. They are separate reads for
 * that reason: a total added up from a page would be a subtotal wearing a
 * total's label, and this is a screen somebody acts on.
 */

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
  await requireAdminConsole();
  const console_ = await apiOrNull<{
    readonly overview: AdminBankOverview;
    readonly grades: readonly AdminCreditGrade[];
    readonly loans: readonly AdminLoan[];
  }>('/api/v1/admin/bank');

  return (
    <div className="grid gap-5">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">은행 현황</CardTitle>
              <CardDescription>
                아래 합계는 전체 장부 기준이고, 목록은 그중 일부입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <dl className="grid gap-2">
                <Figure term="예금 잔액" value={console_.overview.deposit_amount} />
                <Figure
                  term="예금자"
                  value={groupDigits(console_.overview.depositor_count)}
                  plain
                />
                <Figure term="대출 잔액" value={console_.overview.outstanding_amount} />
                <Figure
                  term="남은 대출"
                  value={groupDigits(console_.overview.open_loan_count)}
                  plain
                  hint={`빌린 사람 ${groupDigits(console_.overview.borrower_count)}명`}
                />
              </dl>
              <dl className="grid gap-2">
                <Figure term="연체 잔액" value={console_.overview.overdue_amount} />
                <Figure
                  term="연체 건수"
                  value={groupDigits(console_.overview.overdue_loan_count)}
                  plain
                />
                <Figure
                  term="7일 안에 만기"
                  value={groupDigits(console_.overview.maturing_7d_count)}
                  plain
                />
                <Figure
                  term="24시간 신규 대출"
                  value={console_.overview.issued_24h_amount}
                  hint={`${groupDigits(console_.overview.issued_24h_count)}건 · 같은 기간 상환 ${groupDigits(
                    console_.overview.repaid_24h_amount,
                  )} WLD`}
                />
              </dl>
            </CardContent>
          </Card>

          <section aria-labelledby="credit-grades" className="grid gap-3">
            <SectionHeader eyebrow="CREDIT LADDER" title="신용 등급" id="credit-grades" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">등급별 조건과 장부</CardTitle>
                <CardDescription>
                  진행 중과 누적은 대출을 실행할 당시 기록된 등급으로 셉니다. 이미 나간 계약의
                  이자율은 정책이 바뀌어도 그대로입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {console_.grades.length === 0 ? (
                  <EmptyState title="등록된 신용 등급이 없습니다." />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>등급</TableHead>
                          <TableHead className="text-right">가입 일수</TableHead>
                          <TableHead className="text-right">작업 횟수</TableHead>
                          <TableHead className="text-right">한도</TableHead>
                          <TableHead className="text-right">이자</TableHead>
                          <TableHead className="text-right">기간</TableHead>
                          <TableHead className="text-right">최소 상환</TableHead>
                          <TableHead className="text-right">진행 중</TableHead>
                          <TableHead className="text-right">잔액</TableHead>
                          <TableHead className="text-right">연체</TableHead>
                          <TableHead className="text-right">누적 실행</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {console_.grades.map((grade) => (
                          <TableRow key={grade.grade}>
                            <TableCell>
                              <Badge variant={grade.active ? 'secondary' : 'outline'}>
                                {grade.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {grade.minimum_account_days}일
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {grade.minimum_work_completions}회
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={grade.credit_limit} />
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {ratePercent(grade.interest_bps)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {grade.term_days}일
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={grade.minimum_repayment} />
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(grade.open_loan_count)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={grade.outstanding_amount} />
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(grade.overdue_loan_count)}
                            </TableCell>
                            <TableCell className="tabular text-right">
                              {groupDigits(grade.issued_loan_count)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="loan-book" className="grid gap-3">
            <SectionHeader eyebrow="LOAN BOOK" title="남은 대출" id="loan-book" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">상환이 끝나지 않은 대출</CardTitle>
                <CardDescription>
                  연체가 먼저, 그다음 만기가 가까운 순입니다. 이 화면을 연 것도 감사 기록에
                  남습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {console_.loans.length === 0 ? (
                  <EmptyState title="남아 있는 대출이 없습니다." />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>회원</TableHead>
                          <TableHead>등급</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead className="text-right">원금</TableHead>
                          <TableHead className="text-right">이자</TableHead>
                          <TableHead className="text-right">남은 금액</TableHead>
                          <TableHead className="text-right">상환액</TableHead>
                          <TableHead>실행</TableHead>
                          <TableHead>만기</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {console_.loans.map((loan) => (
                          <TableRow key={loan.loan_id}>
                            <TableCell>
                              <span className="grid gap-0.5">
                                <b>{loan.display_name}</b>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {loan.user_id}
                                </span>
                              </span>
                            </TableCell>
                            <TableCell>{loan.credit_grade}</TableCell>
                            <TableCell>
                              <Badge
                                variant={loan.status === 'overdue' ? 'destructive' : 'secondary'}
                              >
                                {statusLabel(loan.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={loan.principal_amount} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={loan.interest_amount} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={loan.outstanding_amount} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={loan.repaid_amount} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatMoment(loan.issued_at)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatMoment(loan.maturity_at, '만기 없음')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
