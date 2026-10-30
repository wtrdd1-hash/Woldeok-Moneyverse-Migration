'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Compass, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { switchJobAction } from './actions';
import { TakeButton } from './work-forms';
import { dailyQuotaLabel } from './work-quota';
import { filterWorkTasks, filterWorkTasksByMinReward } from './work-search';
import {
  boardOrder,
  difficultyLabel,
  durationLabel,
  jobLabel,
  type WorkQuotaBlock,
  type WorkTask,
  workTaskBlock,
} from './work';

function QuickCareerSwitchButton({
  jobCode,
  jobName,
}: {
  readonly jobCode: string;
  readonly jobName: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [, action] = useActionState(switchJobAction, IDLE);

  return (
    <form action={action} className="w-full mt-1">
      <input type="hidden" name="jobType" value={jobCode} />
      <SubmitButton
        variant="ghost"
        className="w-full text-xs text-muted-foreground hover:text-foreground min-h-9 h-9 py-1 px-2 border border-border/40 hover:border-border rounded-xl font-medium"
      >
        {isEn ? `Switch to ${jobName}` : `${jobName}(으)로 전직하기`}
      </SubmitButton>
    </form>
  );
}

export function CareerTasksBoard({
  tasks,
  activeJobType,
  quotaBlock,
  selectedDifficulty,
  selectedMaxDuration,
  selectedAvailableOnly = false,
}: {
  readonly tasks: readonly WorkTask[];
  readonly activeJobType?: string | null | undefined;
  readonly quotaBlock?: WorkQuotaBlock | null;
  readonly selectedDifficulty?: string | null;
  readonly selectedMaxDuration?: string | null;
  readonly selectedAvailableOnly?: boolean;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const [filter, setFilter] = useState<'my_job' | 'all'>(activeJobType ? 'my_job' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minReward, setMinReward] = useState('');

  const activeJobName = activeJobType ? jobLabel(activeJobType, locale) : '';

  const myTasks = activeJobType ? tasks.filter((t) => t.job_type === activeJobType) : [];
  const myCompletedToday = myTasks.reduce((sum, t) => sum + t.taken_today, 0);

  const scopedTasks = filter === 'my_job' && activeJobType && myTasks.length > 0 ? myTasks : tasks;
  const displayTasks = boardOrder(filterWorkTasksByMinReward(filterWorkTasks(scopedTasks, searchQuery), minReward), activeJobType);

  return (
    <div className="grid gap-4 w-full max-w-full min-w-0">
      <div className="flex flex-col gap-3 bg-card/60 border border-border/60 rounded-xl p-3 backdrop-blur-sm shadow-sm w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-[400px]:gap-2 flex-wrap min-w-0">
            {activeJobType && (
              <Button
                size="sm"
                variant={filter === 'my_job' ? 'default' : 'outline'}
                onClick={() => setFilter('my_job')}
                className="font-semibold text-xs h-8 sm:h-9 py-1 px-2.5 rounded-lg"
              >
                <Briefcase className="size-3.5 shrink-0" />
                <span className="ml-1.5 truncate">
                  {isEn ? `My Career (${activeJobName})` : `내 직업 (${activeJobName})`}
                </span>
                <Badge className="ml-1.5 border-0 bg-amber-950/15 px-1.5 py-0 text-[10px] text-amber-950 dark:bg-black/25 dark:text-white">
                  {myTasks.length}
                </Badge>
              </Button>
            )}

            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="font-semibold text-xs h-8 sm:h-9 py-1 px-2.5 rounded-lg"
            >
              <Compass className="size-3.5 shrink-0" />
              <span className="ml-1.5">
                {isEn ? 'Explore Other Careers' : '다른 직업 둘러보기'}
              </span>
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {tasks.length}
              </Badge>
            </Button>
          </div>

          {activeJobType && (
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 max-w-full truncate">
                <span className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  {myCompletedToday}회 완료
                </span>
                <span className="text-muted-foreground">
                  · {isEn ? 'Today' : '오늘'}
                </span>
              </Badge>
            </div>
          )}
        </div>

        <form action="/work" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end min-w-0">
          <label className="grid flex-1 gap-1 text-xs text-muted-foreground min-w-0">
            <span>{isEn ? 'Maximum task duration' : '최대 업무 수행시간'}</span>
            <select
              name="maxDurationSeconds"
              defaultValue={selectedMaxDuration ?? ''}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{isEn ? 'Any duration' : '전체 시간'}</option>
              {['60', '120', '180', '300', '600', '900'].map((seconds) => (
                <option key={seconds} value={seconds}>
                  {isEn ? `Up to ${Number(seconds) / 60} min` : `${Number(seconds) / 60}분 이내`}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex min-h-10 items-center gap-2 text-xs text-foreground">
            <input type="checkbox" name="availableOnly" value="1" defaultChecked={selectedAvailableOnly}
              className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring" />
            {isEn ? 'Only tasks with daily quota remaining' : '일일 수행 한도가 남은 업무만 보기'}
          </label>
          <Button type="submit" size="sm" className="min-h-10">{isEn ? 'Apply' : '적용'}</Button>
          <Link href="/work" className="inline-flex min-h-10 items-center justify-center rounded-md border border-input px-3 text-xs font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            {isEn ? 'Reset duration filter' : '시간 필터 초기화'}
          </Link>
        </form>
        <label className="grid gap-1 text-xs text-muted-foreground min-w-0">
          <span>{isEn ? 'Find a task' : '업무 검색'}</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              isEn ? 'Search by task, description, or career…' : '업무명, 설명, 직업으로 검색…'
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground min-w-0">
          <span>{isEn ? 'Minimum estimated WLD reward' : '최소 예상 WLD 보상'}</span>
          <select
            aria-label={isEn ? 'Minimum WLD reward' : '최소 WLD 보상'}
            value={minReward}
            onChange={(event) => setMinReward(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{isEn ? 'Any reward' : '전체 보상'}</option>
            {['50', '100', '200', '500', '1000'].map((value) => (
              <option key={value} value={value}>{value} WLD+</option>
            ))}
          </select>
        </label>
      </div>

      {displayTasks.length === 0 ? (
        <EmptyState
          title={
            searchQuery.trim() || minReward || selectedMaxDuration || selectedAvailableOnly
              ? isEn
                ? 'No work tasks match your filters.'
                : '선택한 조건에 맞는 업무가 없어요.'
              : isEn
                ? 'No tasks available in this category.'
                : '선택한 직업에 등록된 업무가 없어요.'
          }
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {displayTasks.map((task) => {
            const isActiveJob = activeJobType === task.job_type;
            const blockedReason = workTaskBlock(task, quotaBlock ?? null);

            return (
              <Card
                key={task.task_id}
                className={`flex flex-col justify-between h-full min-h-[320px] overflow-hidden transition-all duration-150 active:scale-[0.99] w-full min-w-0 ${
                  isActiveJob
                    ? 'border-amber-500/50 dark:border-amber-500/30 bg-card shadow-md ring-1 ring-amber-500/20'
                    : 'opacity-75 bg-muted/20 border-dashed hover:opacity-100 hover:border-solid transition-opacity'
                }`}
              >
                <CardHeader className="pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <Badge
                        variant={isActiveJob ? 'default' : 'outline'}
                        className={`text-xs ${
                          isActiveJob
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 font-semibold'
                            : ''
                        }`}
                      >
                        <span className="flex items-center gap-1"><Briefcase className="size-3 shrink-0" /> {jobLabel(task.job_type, locale)}</span>
                      </Badge>
                      {isActiveJob && (
                        <Badge className="bg-amber-50 text-amber-800 border-0 dark:bg-amber-950/50 dark:text-amber-200 text-[10px] px-1.5 py-0 font-bold">
                          <span className="flex items-center gap-1"><Sparkles className="size-2.5 text-amber-500 shrink-0" /> {isEn ? 'Mine' : '내 직업'}</span>
                        </Badge>
                      )}
                      {task.recommended && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800 text-[10px] px-1.5 py-0 font-bold">
                          <span className="flex items-center gap-1"><Star className="size-2.5 text-emerald-500 fill-emerald-500 shrink-0" /> {isEn ? 'Today’s pick' : '오늘 추천'}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {difficultyLabel(task.difficulty, locale)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center justify-between">
                    <span className="truncate">{task.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 min-h-[32px]">{task.description}</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-2 text-xs py-2 min-w-0">
                  <div className="rounded-lg bg-muted/50 p-2.5 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isEn ? 'WLD this run' : '이번 지급 WLD'}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-sm">
                        {task.reward_preview === null ? '—' : `+${task.reward_preview} WLD`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 font-mono text-sm">
                        {task.experience_preview === null ? '—' : `+${task.experience_preview} EXP`}
                      </span>
                    </div>
                  </div>

                  {/* 통화 유통속도 및 보상 페이싱 인디케이터 (Velocity & Pacing) */}
                  <div className="flex items-center justify-between gap-1 text-[11px] px-2 py-1 rounded bg-background/60 border border-border/40 font-mono">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {task.settlement_mode ?? 'ACTIVE'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.repeat_factor && (
                        <span className={task.taken_today > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-muted-foreground'}>
                          x{task.repeat_factor} {task.taken_today > 0 ? (isEn ? 'decay' : '감쇠') : (isEn ? 'rate' : '배율')}
                        </span>
                      )}
                      {task.reason_codes?.includes('REPEAT_DECAY_APPLIED') && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                          {isEn ? 'Pacing' : '페이싱'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-muted-foreground text-[11px] px-1 min-w-0">
                    <span className="truncate">
                      {isEn
                        ? `Duration: ${durationLabel(task.minimum_duration_seconds, locale)}`
                        : `소요: ${durationLabel(task.minimum_duration_seconds, locale)}`}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                      {dailyQuotaLabel(task.taken_today, task.daily_limit, isEn)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2.5 pb-4 px-5 shrink-0">
                  {isActiveJob ? (
                    <TakeButton
                      taskId={task.task_id}
                      disabled={
                        Boolean(blockedReason) ||
                        task.reward_preview === null ||
                        task.experience_preview === null
                      }
                      label={
                        isEn
                          ? `Start task · minimum ${durationLabel(task.minimum_duration_seconds, locale)}`
                          : `업무 맡기 · 최소 ${durationLabel(task.minimum_duration_seconds, locale)}`
                      }
                    />
                  ) : (
                    <QuickCareerSwitchButton
                      jobCode={task.job_type}
                      jobName={jobLabel(task.job_type, locale)}
                    />
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
