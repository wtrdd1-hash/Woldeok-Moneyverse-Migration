import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { ClaimButton, SubmitTaskButton, TakeButton } from './work-forms';
import type { WorkAssignment, WorkReceipt, WorkSummary, WorkTask } from './work';
import {
  boardOrder,
  difficultyLabel,
  durationLabel,
  hasExpired,
  isOpen,
  isSpent,
  jobLabel,
  progressPercent,
  remaining,
  rewardSentence,
  statusLabel,
  secondsUntilSubmittable,
} from './work';

/** One member's own work. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '작업',
  robots: { index: false, follow: false },
};

/**
 * The work loop, on one screen.
 *
 * Everything below it already existed and none of it was reachable. 066
 * seeded five tasks, 067 assigns and takes a submission, 068 verifies and
 * mints the reward, 069 reports the caps -- but `work_task_catalog` is
 * revoked from the application role and nothing read it back, so there was no
 * way to learn a task's id and therefore no way to take one. 095 adds the
 * board and the receipts; this is the screen the specification asks for in
 * 14.6, and the order of the sections is the order of the loop: what is left
 * today, what is in hand, what can be taken, what was paid.
 */
export default async function WorkPage() {
  await requireMember();

  // Four reads, one round trip each, issued together. None of them depends on
  // another's answer.
  const [summary, board, assignments, receipts] = await Promise.all([
    apiOrNull<WorkSummary>('/api/v1/work'),
    apiOrNull<{ tasks: readonly WorkTask[] }>('/api/v1/work/tasks'),
    apiOrNull<{ assignments: readonly WorkAssignment[] }>('/api/v1/work/assignments'),
    apiOrNull<{ receipts: readonly WorkReceipt[] }>('/api/v1/work/receipts'),
  ]);

  const tasks = board?.tasks ?? [];
  const open = (assignments?.assignments ?? []).filter(isOpen);
  const paid = receipts?.receipts ?? [];
  // One clock for the whole render. Read twice, the two halves of a countdown
  // could disagree by a second and show a task as both ready and not.
  const now = Date.now();
  const durations = new Map(tasks.map((task) => [task.task_id, task.minimum_duration_seconds]));

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="DAILY WORK" title="작업하고 보상 받기">
        작업을 맡아 최소 수행 시간을 채우고 제출하면 WLD와 경험치를 받습니다. 보상액과 한도는
        모두 서버가 정하며, 이 화면에 보이는 금액은 지금 마쳤을 때 실제로 지급될 금액입니다.
      </PageHeader>

      <section aria-labelledby="caps-title" className="grid gap-3">
        <h2 id="caps-title" className="text-lg">
          오늘 남은 보상
        </h2>
        {summary === null ? (
          <EmptyState
            title="보상 한도를 불러오지 못했어요."
            description="한도를 추정해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <CapCard
              label="오늘"
              paid={summary.daily_paid}
              cap={summary.daily_cap}
              note="매일 한국 시간 자정에 다시 열려요."
            />
            <CapCard
              label="이번 주"
              paid={summary.weekly_paid}
              cap={summary.weekly_cap}
              note="주간 한도는 월요일에 다시 열려요."
            />
          </div>
        )}
      </section>

      {open.length > 0 && (
        <section aria-labelledby="open-title" className="grid gap-3">
          <h2 id="open-title" className="text-lg">
            진행 중인 작업
          </h2>
          <div className="grid gap-3">
            {open.map((assignment) => {
              const wait = secondsUntilSubmittable(
                assignment.assigned_at,
                durations.get(assignment.task_id) ?? 0,
                now,
              );
              const expired = hasExpired(assignment.expires_at, now);
              return (
                <Card key={assignment.assignment_id}>
                  <CardHeader>
                    <CardDescription>{jobLabel(assignment.job_type)}</CardDescription>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {assignment.name}
                      <Badge variant="secondary">{statusLabel(assignment.status)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {formatMoment(assignment.assigned_at)}에 맡았어요. 기한은{' '}
                      {formatMoment(assignment.expires_at)}까지예요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {expired ? (
                      <p>
                        기한이 지나 제출할 수 없어요. 같은 작업을 아래에서 다시 맡을 수 있어요.
                      </p>
                    ) : assignment.status === 'submitted' ? (
                      <p>제출을 마쳤어요. 보상을 받으면 원장에 기록되고 경험치가 쌓여요.</p>
                    ) : wait > 0 ? (
                      <p>최소 수행 시간이 {durationLabel(wait)} 남았어요.</p>
                    ) : (
                      <p>최소 수행 시간을 채웠어요. 이제 제출할 수 있어요.</p>
                    )}
                  </CardContent>
                  {!expired && (
                    <CardFooter>
                      {assignment.status === 'submitted' ? (
                        <ClaimButton assignmentId={assignment.assignment_id} />
                      ) : (
                        <SubmitTaskButton
                          assignmentId={assignment.assignment_id}
                          disabled={wait > 0}
                          label={wait > 0 ? `${durationLabel(wait)} 뒤 제출` : undefined}
                        />
                      )}
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="board-title" className="grid gap-3">
        <h2 id="board-title" className="text-lg">
          맡을 수 있는 작업
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          오늘의 추천 3개를 먼저 보여 드려요. 추천은 하루에 한 번 바뀌고, 오늘 횟수를 다 쓴 작업은
          추천하지 않아요.
        </p>

        {board === null ? (
          <EmptyState
            title="작업 목록을 불러오지 못했어요."
            description="잠시 후 다시 확인해 주세요."
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="지금 열려 있는 작업이 없어요."
            description="운영자가 작업을 다시 열면 여기에 표시돼요."
          />
        ) : (
          <div className="grid gap-3">
            {boardOrder(tasks).map((task) => {
              const spent = isSpent(task);
              return (
                <Card key={task.task_id}>
                  <CardHeader>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      {jobLabel(task.job_type)}
                      <span aria-hidden>·</span>
                      {difficultyLabel(task.difficulty)}
                      {task.recommended && <Badge>오늘의 추천</Badge>}
                    </CardDescription>
                    <CardTitle>{task.name}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm">
                    <dl className="grid gap-1 sm:grid-cols-3">
                      <Fact label="최소 수행 시간">
                        {durationLabel(task.minimum_duration_seconds)}
                      </Fact>
                      <Fact label="경험치">{groupDigits(task.base_experience)} XP</Fact>
                      <Fact label="오늘 맡은 횟수">
                        {task.taken_today} / {task.daily_limit}
                      </Fact>
                    </dl>
                    <p className="text-muted-foreground">{rewardSentence(task)}</p>
                  </CardContent>
                  <CardFooter>
                    <TakeButton
                      taskId={task.task_id}
                      disabled={spent}
                      label={spent ? '오늘 횟수를 다 썼어요' : undefined}
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="receipts-title" className="grid gap-3">
        <h2 id="receipts-title" className="text-lg">
          최근 지급 영수증
        </h2>
        {receipts === null ? (
          <EmptyState title="영수증을 불러오지 못했어요." />
        ) : paid.length === 0 ? (
          <EmptyState
            title="아직 지급받은 작업이 없어요."
            description="작업을 맡아 제출하고 보상을 받으면 여기에 영수증이 남아요."
          />
        ) : (
          <Card>
            <CardContent className="grid gap-3">
              {paid.map((receipt) => (
                <div
                  key={receipt.receipt_id}
                  className="grid gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{receipt.name}</span>
                    <span className="tabular text-sm">
                      {groupDigits(receipt.reward_amount)} WLD · 경험치{' '}
                      {groupDigits(receipt.experience_amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatMoment(receipt.created_at)}
                    {/* A reward the caps clamped to zero has no transaction,
                        because nothing was minted. Saying so is the honest
                        answer; a blank where a ledger link belongs reads as a
                        missing record. */}
                    {receipt.transaction_id === null
                      ? ' · 한도가 차 WLD 지급 없이 경험치만 쌓였어요.'
                      : ` · 원장 거래 ${receipt.transaction_id.slice(0, 8)}`}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost">
                <Link href="/wallet/activity">내 지갑 기록에서 원장 확인하기 →</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </section>
    </div>
  );
}

function CapCard({
  label,
  paid,
  cap,
  note,
}: {
  readonly label: string;
  readonly paid: string;
  readonly cap: string;
  readonly note: string;
}) {
  const left = remaining(paid, cap);
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label} 남은 보상</CardDescription>
        <CardTitle className="tabular text-3xl">{groupDigits(left)} WLD</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Progress value={progressPercent(paid, cap)} />
        <p className="tabular text-sm text-muted-foreground">
          {groupDigits(paid)} / {groupDigits(cap)} WLD 지급됨
        </p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function Fact({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 sm:grid sm:gap-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular text-sm">{children}</dd>
    </div>
  );
}
