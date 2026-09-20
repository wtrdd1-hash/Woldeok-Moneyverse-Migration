import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleAlert, Compass, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { UnlockLadder } from './unlock-parts';
import type { EarlyUnlock } from './unlocks';

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

  const [progression, credit, earlyGame] = await Promise.all([
    apiOrNull<{ progression: ProgressionStatus | null }>('/api/v1/progression'),
    apiOrNull<CreditStanding>('/api/v1/progression/credit'),
    apiOrNull<{ unlocks: readonly EarlyUnlock[] }>('/api/v1/progression/early-game'),
  ]);

  const status = progression?.progression ?? null;
  const loans = credit?.loans ?? [];
  const ladder = credit?.ladder ?? [];
  const canBorrow = !loans.some((loan) => isRepayable(loan.status));
  const current = stageIndex(status?.stage_code ?? null);
  const requirements = requirementLines(status?.next_requirements ?? null);

  return (
    <div data-page="progression" className="mv-page mv-page--gameplay grid gap-8 pb-12">
      <PageHeader eyebrow="GROWTH STAGE" title="성장 단계와 신용">
        단계와 신용 등급은 게임 활동 기록으로만 정해집니다. 실제 신용 평가·금융 거래와는 관련이
        없습니다.
      </PageHeader>

      {hasOverdueLoan(loans) && (
        <Alert variant="destructive" className="rounded-2xl">
          <CircleAlert />
          <AlertTitle>상환 기한이 지난 대출이 있어요.</AlertTitle>
          <AlertDescription>
            아래 대출을 상환하면 연체가 풀려요. 연체 중에는 새 대출을 신청할 수 없어요.
          </AlertDescription>
        </Alert>
      )}

      {/* Stage Roadmap Section */}
      <section aria-labelledby="stage-title" className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 id="stage-title" className="text-xl font-bold flex items-center gap-2">
            <Compass className="size-5 text-primary" /> 내 성장 단계 로드맵
          </h2>
          {status && (
            <Badge className="bg-primary/20 text-primary border-primary/30 font-bold px-3 py-1">
              현재: {stageLabel(status.stage_code)}
            </Badge>
          )}
        </div>

        {progression === null ? (
          <EmptyState
            title="성장 단계를 불러오지 못했어요."
            description="단계를 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : status === null ? (
          <EmptyState
            title="아직 성장 단계가 계산되지 않았어요."
            description="단계 새로고침을 누르면 지금까지의 활동으로 단계를 계산해요."
          >
            <RefreshButton label="단계 계산하기" />
          </EmptyState>
        ) : (
          <Card className="rounded-2xl border-border/80 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  CURRENT STAGE
                </CardDescription>
                <CardDescription className="text-xs">
                  {formatDay(status.reached_at)} 달성
                </CardDescription>
              </div>
              <CardTitle className="text-3xl font-black mt-1 text-foreground">
                {stageLabel(status.stage_code)}
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5">
              {current >= 0 && (
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {STAGES.map((stage, index) => {
                    const here = index === current;
                    const passed = index < current;
                    return (
                      <li
                        key={stage.code}
                        aria-current={here ? 'step' : undefined}
                        className={`relative grid gap-2 rounded-2xl border p-4 transition-all shadow-sm ${
                          here
                            ? 'border-primary bg-primary/10 ring-1 ring-primary/40 font-bold'
                            : passed
                              ? 'border-border/80 bg-card'
                              : 'border-dashed border-border/60 bg-muted/20 text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="tabular text-xs font-mono font-semibold text-primary">
                            STAGE 0{index + 1}
                          </span>
                          {passed && (
                            <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-bold px-2 py-0.5">
                              ✓ 완료
                            </Badge>
                          )}
                          {here && (
                            <Badge className="text-xs text-primary bg-primary/20 border-primary/30 font-black px-2 py-0.5">
                              ● 현재 단계
                            </Badge>
                          )}
                          {!passed && !here && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="size-3" /> 잠김
                            </span>
                          )}
                        </div>
                        <span className="text-base font-black text-foreground">{stage.label}</span>
                        <p className="text-xs text-muted-foreground">
                          {passed ? '달성 완료' : here ? '현재 활동 중' : '조건 달성 시 자동 해금'}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}

              {requirements.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 grid gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ArrowRight className="size-3.5 text-primary" /> 다음 단계 해금 조건
                  </span>
                  <ul className="grid gap-1.5 text-xs text-muted-foreground pl-2">
                    {requirements.map((req) => (
                      <li key={req.key} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary shrink-0" />
                          <span>{req.label}</span>
                        </span>
                        <span className="font-mono font-bold text-foreground">{req.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t flex justify-end">
              <RefreshButton label="내 활동 기록으로 단계 새로고침" />
            </CardFooter>
          </Card>
        )}
      </section>

      {/* Credit & Loans Section */}
      <section aria-labelledby="credit-title" className="grid gap-4">
        <h2 id="credit-title" className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" /> 신용 등급 및 대출 한도
        </h2>

        {credit === null ? (
          <EmptyState title="신용 정보를 불러오지 못했어요." />
        ) : (
          <Card className="rounded-2xl border-border/80 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    CREDIT RATING
                  </CardDescription>
                  <CardTitle className="text-2xl font-black mt-1">
                    {gradeLabel(credit.grade ?? 'new')}
                  </CardTitle>
                </div>
                {canBorrow && (
                  <Link
                    href="/wallet"
                    className="min-h-11 inline-flex items-center justify-center rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                  >
                    지갑에서 대출 신청하기 →
                  </Link>
                )}
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ladder.map((rung) => {
                  const here = rung.grade === credit.grade;
                  return (
                    <div
                      key={rung.grade}
                      className={`rounded-2xl border p-4 grid gap-2 transition-all ${
                        here
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                          : 'border-border/60 bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-foreground">
                          {gradeLabel(rung.grade)}
                        </span>
                        {here && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                            내 등급
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs grid gap-1">
                        <div className="flex justify-between">
                          <span>최대 한도</span>
                          <span className="font-mono font-bold text-foreground">
                            {lendsNothing(rung) ? '이용 불가' : `${groupDigits(rung.credit_limit)} WLD`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>일일 이자율</span>
                          <span className="font-mono font-bold text-foreground">
                            {ratePercent(rung.interest_bps)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 border-t border-border/40 pt-1.5">
                        {rungConditions(rung)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {loans.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <LoanBoard loans={loans} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Early Game Unlocks Section */}
      {earlyGame?.unlocks && earlyGame.unlocks.length > 0 && (
        <section aria-labelledby="unlocks-title" className="grid gap-4">
          <h2 id="unlocks-title" className="text-xl font-bold flex items-center gap-2">
            <span>🔓</span> 주요 기능 해금 현황
          </h2>
          <UnlockLadder unlocks={earlyGame.unlocks} />
        </section>
      )}
    </div>
  );
}
