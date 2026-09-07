import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TruncatedList } from '@/components/truncated-list';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { ClaimButton, JobSwitchButton, SubmitTaskButton } from './work-forms';
import { CareerTasksBoard } from './career-tasks-board';

import type {
  JobProfileResponse,
  WorkAssignment,
  WorkReceipt,
  WorkTask,
} from './work';
import {
  CAREER_JOBS,
  durationLabel,
  hasExpired,
  isOpen,
  jobLabel,
  jobMeta,
  secondsUntilSubmittable,
  statusLabel,
} from './work';

export const dynamic = 'force-dynamic';

const RECEIPTS_ON_WORK = 5;

export const metadata: Metadata = {
  title: '직업 및 업무 — 월덕 머니버스 전문 직업 2.0',
  description: '8대 전문 직업군으로 자유롭게 전직하고 업무를 수행하여 WLD와 경험치를 획득하세요.',
  robots: { index: false, follow: false },
};

export default async function WorkPage() {
  await requireMember();
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const [board, assignments, receipts, profile] = await Promise.all([
    apiOrNull<{ tasks: readonly WorkTask[] }>('/api/v1/work/tasks'),
    apiOrNull<{ assignments: readonly WorkAssignment[] }>('/api/v1/work/assignments'),
    apiOrNull<{ receipts: readonly WorkReceipt[] }>('/api/v1/work/receipts'),
    apiOrNull<JobProfileResponse>('/api/v1/work/profile'),
  ]);

  const tasks = board?.tasks ?? [];
  const open = (assignments?.assignments ?? []).filter(isOpen);
  const paid = receipts?.receipts ?? [];
  const now = Date.now();
  const durations = new Map(tasks.map((task) => [task.task_id, task.minimum_duration_seconds]));

  const activeJob = profile?.active_job;
  const allJobsMap = new Map((profile?.all_jobs ?? []).map((j) => [j.job_type, j]));
  const activeMeta = activeJob?.job_type ? jobMeta(activeJob.job_type, locale) : undefined;

  const currentExp = activeJob?.experience ?? 0;
  const nextExp = activeJob?.next_level_exp ?? 100;
  const expPercent = Math.min(100, Math.round((currentExp / (nextExp || 1)) * 100));

  return (
    <div className="grid gap-8 pb-12">
      <PageHeader
        eyebrow="CAREER & WORK 2.0"
        title={isEn ? 'Professional Careers & Work Tasks' : '전문 직업 및 업무 수행'}
      >
        {isEn
          ? 'Perform tasks across 8 specialized professions to earn WLD and proficiency EXP. Switch between careers anytime with zero fee, and your career proficiency is permanently preserved.'
          : '8대 전문 직업군을 넘나들며 업무를 수행하고 WLD와 숙련도 경험치(EXP)를 획득하세요. 전직 수수료와 대기시간 없이 언제든 원하는 직업으로 전환할 수 있으며, 직업별 경험치는 영구 보존됩니다.'}
      </PageHeader>

      {/* 1. 활성 직업 및 숙련도 게이지 섹션 */}
      <section aria-labelledby="active-job-title" className="grid gap-4">
        <h2 id="active-job-title" className="text-xl font-bold flex items-center gap-2">
          <span>🎯</span> {isEn ? 'Active Career & Proficiency' : '현재 활성 직업 및 숙련도'}
        </h2>

        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card/80 to-primary/5 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shadow-inner">
                {activeMeta?.icon ?? '💼'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight">
                    {activeMeta?.name ?? (isEn ? 'None selected (Choose a career)' : '미선택 (전직을 선택하세요)')}
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm font-semibold">
                    Lv.{activeJob?.level ?? 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeMeta?.roleDescription ??
                    (isEn
                      ? 'Select one of the 8 professional careers below to start work.'
                      : '아래 8대 직업군 중 하나를 선택하여 업무를 시작할 수 있습니다.')}
                </p>
              </div>
            </div>

            <div className="w-full md:w-80 grid gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{isEn ? 'Proficiency EXP' : '숙련도 경험치'}</span>
                <span className="text-primary font-mono">
                  {currentExp.toLocaleString()} / {nextExp.toLocaleString()} EXP ({expPercent}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-secondary/80 rounded-full overflow-hidden p-0.5 border border-border/50">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-right">
                {isEn
                  ? `${(nextExp - currentExp).toLocaleString()} EXP needed to Lv.${(activeJob?.level ?? 1) + 1}`
                  : `다음 레벨(Lv.${(activeJob?.level ?? 1) + 1})까지 ${(nextExp - currentExp).toLocaleString()} EXP 필요`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 8대 직업 탐색 및 즉시 전직 카드 그리드 */}
      <section aria-labelledby="careers-grid-title" className="grid gap-4">
        <div>
          <h2 id="careers-grid-title" className="text-xl font-bold flex items-center gap-2">
            <span>🏛️</span> {isEn ? 'Available Careers (Zero-Fee Instant Switch)' : '8대 전문 직업군 탐색 및 전직'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEn
              ? 'Career switches are instant and free. Each career keeps its own proficiency EXP even after you switch away.'
              : '전직은 수수료와 대기시간 없이 즉시 적용되며, 다른 직업으로 옮겨도 각 직업에서 쌓은 숙련도 EXP는 그대로 보존됩니다.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_JOBS.map((job) => {
            const mastery = allJobsMap.get(job.code);
            const level = mastery?.level ?? 1;
            const exp = mastery?.experience ?? 0;
            const nextLevelExp = mastery?.next_level_exp ?? Math.max(100, level * level * 100);
            const previousLevelExp = level <= 1 ? 0 : (level - 1) * (level - 1) * 100;
            const levelSpan = Math.max(1, nextLevelExp - previousLevelExp);
            const levelProgress = Math.min(
              100,
              Math.max(0, Math.round(((exp - previousLevelExp) / levelSpan) * 100)),
            );
            const isActive = activeJob?.job_type === job.code;
            const jobDisplayName = isEn ? (job.enName ?? job.name) : job.name;
            const jobDisplayDesc = isEn ? (job.enRoleDescription ?? job.roleDescription) : job.roleDescription;

            return (
              <Card
                key={job.code}
                className={`transition-all duration-200 hover:shadow-lg relative flex flex-col justify-between ${
                  isActive
                    ? 'border-primary ring-1 ring-primary/50 bg-primary/[0.03]'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{job.icon}</span>
                    <Badge variant={isActive ? 'default' : 'secondary'} className="font-mono text-xs">
                      Lv.{level}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{jobDisplayName}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                    {jobDisplayDesc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3 text-xs grid gap-2">
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    <span>{isEn ? 'Proficiency' : '직업 숙련도'}</span>
                    <span className="font-mono font-medium text-foreground">
                      {exp.toLocaleString()} / {nextLevelExp.toLocaleString()} EXP
                    </span>
                  </div>
                  <Progress value={levelProgress} aria-label={isEn ? 'Career proficiency progress' : '직업 숙련도 진행률'} />
                  <p className="text-[11px] text-muted-foreground">
                    {level >= 50
                      ? isEn
                        ? 'Maximum career level reached'
                        : '최대 직업 레벨 달성'
                      : isEn
                        ? `${Math.max(0, nextLevelExp - exp).toLocaleString()} EXP until Lv.${level + 1}`
                        : `Lv.${level + 1}까지 ${Math.max(0, nextLevelExp - exp).toLocaleString()} EXP`}
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <JobSwitchButton job={job} isActive={isActive} level={level} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Repeatable career task list */}
      <section aria-labelledby="tasks-title" className="grid gap-4">
        <div>
          <h2 id="tasks-title" className="text-xl font-bold flex items-center gap-2">
            <span>📋</span> {isEn ? 'Career Work' : '직업 업무'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEn
              ? 'Only work for your active career can be performed. Tasks may be repeated, and each completion pays the server-validated WLD and proficiency EXP shown below.'
              : '현재 활성 직업의 업무만 수행할 수 있습니다. 같은 업무는 반복 가능하며, 아래에 표시된 WLD와 숙련도 EXP가 서버 검증 후 매회 즉시 지급됩니다.'}
          </p>
        </div>

        <CareerTasksBoard tasks={tasks} activeJobType={activeJob?.job_type} />
      </section>

      {/* 4. 진행 중인 작업 */}
      {open.length > 0 && (
        <section aria-labelledby="open-title" className="grid gap-3">
          <h2 id="open-title" className="text-lg font-semibold">
            {isEn ? 'Active In-Progress Tasks' : '기존 진행 중인 작업'}
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
                    <CardDescription>{jobLabel(assignment.job_type, locale)}</CardDescription>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {assignment.name}
                      <Badge variant="secondary">{statusLabel(assignment.status, locale)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {isEn
                        ? `Assigned at ${formatMoment(assignment.assigned_at)}. Due by ${formatMoment(assignment.expires_at)}.`
                        : `${formatMoment(assignment.assigned_at)}에 맡았어요. 기한은 ${formatMoment(assignment.expires_at)}까지예요.`}
                    </CardDescription>
                  </CardHeader>
                  {expired ? (
                    <CardContent className="text-sm text-muted-foreground">
                      <p>{isEn ? 'Expired and cannot be submitted. You may take this task again.' : '기한이 지나 제출할 수 없어요. 같은 작업을 다시 맡을 수 있어요.'}</p>
                    </CardContent>
                  ) : assignment.status === 'submitted' ? (
                    <CardFooter>
                      <ClaimButton assignmentId={assignment.assignment_id} />
                    </CardFooter>
                  ) : (
                    <CardFooter>
                      <SubmitTaskButton
                        assignmentId={assignment.assignment_id}
                        disabled={wait > 0}
                        label={
                          wait > 0
                            ? isEn
                              ? `Submittable in ${durationLabel(wait, locale)}`
                              : `${durationLabel(wait)} 후 제출 가능`
                            : isEn
                            ? 'Submit Work'
                            : '작업 완료 제출'
                        }
                      />
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. 최근 수령 영수증 */}
      {paid.length > 0 && (
        <section aria-labelledby="receipts-title" className="grid gap-3">
          <h2 id="receipts-title" className="text-lg font-semibold">
            {isEn ? 'Recent Rewards Claimed' : '최근 수령한 보상'}
          </h2>
          <TruncatedList
            title={isEn ? 'Recent Rewards Claimed' : '최근 수령한 보상'}
            visibleCount={RECEIPTS_ON_WORK}
            listClassName="grid gap-2"
            rows={paid.map((receipt) => (
              <div
                key={receipt.receipt_id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">{receipt.name}</p>
                  <p className="text-xs text-muted-foreground">{formatMoment(receipt.created_at)}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-400">+{receipt.reward_amount} WLD</span>
                  <span className="text-xs text-muted-foreground ml-2">+{receipt.experience_amount} EXP</span>
                </div>
              </div>
            ))}
          />
        </section>
      )}
    </div>
  );
}
