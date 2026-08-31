import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import type { CreditLoan, CreditRung } from './credit';
import {
  gradeLabel,
  hasOverdueLoan,
  isRepayable,
  lendsNothing,
  ratePercent,
  rungConditions,
} from './credit';
import { LoanBoard, RefreshButton } from './progression-forms';
import type { ProgressionStatus } from './stages';
import { STAGES, requirementLines, stageIndex, stageLabel } from './stages';

/** One member's own standing. Never cached, and never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '성장 단계',
  robots: { index: false, follow: false },
};

interface CreditStanding {
  readonly grade: string | null;
  readonly loans: readonly CreditLoan[];
  readonly ladder: readonly CreditRung[];
}

export default async function ProgressionPage() {
  await requireMember();

  // Both reads in one round. The credit half is a second request only because
  // it is a second concern, not because the first one has to finish first.
  const [progression, credit] = await Promise.all([
    apiOrNull<{ progression: ProgressionStatus | null }>('/api/v1/progression'),
    apiOrNull<CreditStanding>('/api/v1/progression/credit'),
  ]);

  const status = progression?.progression ?? null;
  const loans = credit?.loans ?? [];
  const ladder = credit?.ladder ?? [];
  // Borrowing lives on the wallet, and 077 refuses a second loan while one is
  // still open -- so the way there is offered only when it would work.
  const canBorrow = !loans.some((loan) => isRepayable(loan.status));
  const current = stageIndex(status?.stage_code ?? null);
  const requirements = requirementLines(status?.next_requirements ?? null);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="GROWTH STAGE" title="성장 단계와 신용">
        단계와 신용 등급은 게임 활동 기록으로만 정해집니다. 실제 신용 평가·금융 거래와는 관련이
        없습니다.
      </PageHeader>

      {/* An overdue loan is the one thing on this page that cannot wait, so it
          is said once at the top and again on the loan itself. */}
      {hasOverdueLoan(loans) && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>상환 기한이 지난 대출이 있어요.</AlertTitle>
          <AlertDescription>
            아래 대출을 상환하면 연체가 풀려요. 연체 중에는 새 대출을 신청할 수 없어요.
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="stage-title" className="grid gap-3">
        <h2 id="stage-title" className="text-lg">
          내 성장 단계
        </h2>

        {progression === null ? (
          <EmptyState
            title="성장 단계를 불러오지 못했어요."
            description="단계를 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : status === null ? (
          // A different fact from the one above: the request worked and the
          // member simply has no `user_progression` row yet. The refresh is
          // the only thing that ever creates one.
          <EmptyState
            title="아직 성장 단계가 계산되지 않았어요."
            description="단계 새로고침을 누르면 지금까지의 활동으로 단계를 계산해요."
          >
            <RefreshButton label="단계 계산하기" />
          </EmptyState>
        ) : (
          <Card>
            <CardHeader>
              <CardDescription>현재 단계</CardDescription>
              <CardTitle className="text-3xl">{stageLabel(status.stage_code)}</CardTitle>
              <CardDescription>{formatDay(status.reached_at)}부터 이 단계예요.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* The whole ladder, not just the rung the member is on. It is
                  hidden entirely for a stage this build has not been taught:
                  four steps with none of them marked would read as "before
                  the first one", which is a different and false statement. */}
              {current >= 0 && (
                <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {STAGES.map((stage, index) => {
                    const here = index === current;
                    const passed = index < current;
                    return (
                      <li
                        key={stage.code}
                        aria-current={here ? 'step' : undefined}
                        className={`grid gap-1 rounded-[14px] border p-3 ${
                          here
                            ? 'border-forest-soft bg-mint'
                            : passed
                              ? 'bg-surface'
                              : 'border-dashed text-muted-foreground'
                        }`}
                      >
                        <span className="tabular text-xs text-muted-foreground">
                          {index + 1}단계
                        </span>
                        <span className="text-sm font-medium">{stage.label}</span>
                        {here && <span className="text-xs text-forest-soft">지금 여기</span>}
                      </li>
                    );
                  })}
                </ol>
              )}

              {status.next_stage_code === null ? (
                <p className="text-sm text-muted-foreground">
                  마지막 단계에 도달했어요. 더 올라갈 단계가 없습니다.
                </p>
              ) : (
                <div className="grid gap-2 rounded-[14px] border bg-surface p-4">
                  <p className="text-sm">
                    다음 단계 <b className="font-medium">{stageLabel(status.next_stage_code)}</b> 조건
                  </p>
                  {requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      다음 단계에 필요한 조건이 따로 없어요. 단계 새로고침을 누르면 반영돼요.
                    </p>
                  ) : (
                    <dl className="grid gap-1 text-sm">
                      {requirements.map((line) => (
                        <div key={line.key} className="flex items-baseline justify-between gap-3">
                          <dt className="text-muted-foreground">{line.label}</dt>
                          <dd className="tabular">{line.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="text-xs text-muted-foreground">
                    조건을 모두 채운 뒤 단계 새로고침을 누르면 단계가 올라가요. 한 번 올라간 단계는
                    내려가지 않아요. 보유한 사업은{' '}
                    <Link href="/businesses" className="text-clay-ink">
                      게임 사업
                    </Link>{' '}
                    화면에서 확인할 수 있어요.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <RefreshButton />
            </CardFooter>
          </Card>
        )}
      </section>

      <section aria-labelledby="credit-title" className="grid gap-3">
        <h2 id="credit-title" className="text-lg">
          신용과 대출
        </h2>

        {credit === null ? (
          <EmptyState
            title="신용 정보를 불러오지 못했어요."
            description="등급과 대출은 원장 기록을 기준으로 표시됩니다. 잠시 후 다시 확인해 주세요."
          />
        ) : (
          <div className="grid gap-3">
            <Card>
              <CardHeader>
                <CardDescription>내 신용 등급</CardDescription>
                <CardTitle className="text-3xl">
                  {credit.grade === null ? '확인 중' : gradeLabel(credit.grade)}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                {credit.grade === null ? (
                  <p>계정이 활성 상태가 되면 등급이 매겨져요.</p>
                ) : (
                  <p>
                    등급은 가입한 기간과{' '}
                    <Link href="/work" className="text-clay-ink">
                      작업
                    </Link>{' '}
                    화면에서 보상을 받은 횟수로 정해집니다.
                  </p>
                )}

                {/* The numbers, now that they are the ones the database keeps.
                    096 made `credit_limit` and `interest_bps` load-bearing:
                    before it, `bank_borrow` charged everybody a flat 5% and
                    enforced no ceiling, so this card said so rather than
                    reciting a table nothing read. */}
                {ladder.length === 0 ? (
                  <p>등급별 한도와 이자율을 불러오지 못했어요.</p>
                ) : (
                  <ul className="grid gap-2">
                    {ladder.map((rung) => (
                      <li
                        key={rung.grade}
                        className={`grid gap-1 rounded-[14px] border p-3 ${
                          rung.held ? 'border-forest-soft bg-mint' : 'bg-surface'
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {gradeLabel(rung.grade)}
                            {rung.held && <span className="ml-2 text-xs text-forest-soft">지금 내 등급</span>}
                          </span>
                          <span className="tabular text-sm text-foreground">
                            {lendsNothing(rung)
                              ? '대출 불가'
                              : `${groupDigits(rung.credit_limit)} WLD · 이자 ${ratePercent(rung.interest_bps)} · ${rung.term_days}일`}
                          </span>
                        </div>
                        <span className="text-xs">{rungConditions(rung)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs">
                  한도를 넘는 금액은 신청할 수 없고, 이자는 대출을 받는 순간의 등급으로 정해져 이후
                  등급이 바뀌어도 그대로예요. 갚지 않은 대출이 있으면 동전 게임을 할 수 없어요.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>내 대출</CardTitle>
                <CardDescription>
                  원금과 이자를 합한 금액을 상환합니다. 기한이 지난 대출은 연체로 표시됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <EmptyState
                    title="진행 중인 대출이 없어요."
                    description="대출은 내 지갑에서 신청할 수 있어요."
                  >
                    <Button asChild variant="outline" className="min-h-11">
                      <Link href="/wallet">내 지갑으로 가기 →</Link>
                    </Button>
                  </EmptyState>
                ) : (
                  <LoanBoard loans={loans} />
                )}
              </CardContent>
              {loans.length > 0 && canBorrow && (
                <CardFooter>
                  <Button asChild variant="ghost" className="min-h-11">
                    <Link href="/wallet">내 지갑에서 대출 신청하기 →</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
