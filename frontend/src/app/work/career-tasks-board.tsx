'use client';

import { useState, useActionState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { switchJobAction } from './actions';
import { TaskCompleteModalButton } from './work-forms';
import {
  boardOrder,
  difficultyLabel,
  durationLabel,
  jobLabel,
  jobMeta,
  type WorkTask,
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
    <form action={action} className="w-full mt-1.5">
      <input type="hidden" name="jobType" value={jobCode} />
      <SubmitButton
        variant="ghost"
        className="w-full text-xs text-muted-foreground hover:text-foreground h-7 py-1 px-2 border border-border/40 hover:border-border"
      >
        {isEn ? `Switch to ${jobName}` : `${jobName}(으)로 전직하기`}
      </SubmitButton>
    </form>
  );
}

export function CareerTasksBoard({
  tasks,
  activeJobType,
}: {
  readonly tasks: readonly WorkTask[];
  readonly activeJobType?: string | null | undefined;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const [filter, setFilter] = useState<'my_job' | 'all'>(
    activeJobType ? 'my_job' : 'all',
  );

  const activeMeta = activeJobType ? jobMeta(activeJobType, locale) : undefined;
  const activeJobName = activeJobType ? jobLabel(activeJobType, locale) : '';

  const myTasks = activeJobType
    ? tasks.filter((t) => t.job_type === activeJobType)
    : [];
  const myCompletedToday = myTasks.reduce((sum, t) => sum + t.taken_today, 0);

  const displayTasks =
    filter === 'my_job' && activeJobType && myTasks.length > 0
      ? boardOrder(myTasks, activeJobType)
      : boardOrder(tasks, activeJobType);

  return (
    <div className="grid gap-4">
      {/* 1. 탭 필터 및 상단 대시보드 뱃지 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 border border-border/60 rounded-xl p-3 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          {activeJobType && (
            <Button
              size="sm"
              variant={filter === 'my_job' ? 'default' : 'outline'}
              onClick={() => setFilter('my_job')}
              className={`font-semibold text-xs transition-all ${
                filter === 'my_job'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  : ''
              }`}
            >
              <span>{activeMeta?.icon ?? '💼'}</span>
              <span className="ml-1.5">
                {isEn ? `My Career: ${activeJobName}` : `내 직업 전용 (${activeJobName})`}
              </span>
              <Badge className="ml-2 bg-black/20 text-white border-0 text-[10px] px-1.5 py-0">
                {myTasks.length}
              </Badge>
            </Button>
          )}

          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="font-semibold text-xs"
          >
            <span>🌐</span>
            <span className="ml-1.5">{isEn ? 'Explore Other Careers' : '다른 직업 둘러보기'}</span>
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
              {tasks.length}
            </Badge>
          </Button>
        </div>

        {activeJobType && (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                <span className="text-emerald-400 font-mono font-bold">
                  {myCompletedToday}회 완료 · 반복 가능
                </span>
                <span className="text-muted-foreground">
                  {isEn ? 'Career work today' : '오늘의 직업 업무'}
                </span>
            </Badge>
          </div>
        )}
      </div>

      {/* 3. 업무 카드 그리드 */}
      {displayTasks.length === 0 ? (
        <EmptyState
          title={
            isEn
              ? 'No tasks available in this category.'
              : '선택한 직업에 등록된 업무가 없어요.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayTasks.map((task) => {
            const isActiveJob = activeJobType === task.job_type;
            const meta = jobMeta(task.job_type, locale);

            return (
              <Card
                key={task.task_id}
                className={`flex flex-col justify-between transition-all ${
                  isActiveJob
                    ? 'border-amber-500/50 dark:border-amber-500/30 bg-card shadow-md ring-1 ring-amber-500/20'
                    : 'opacity-70 bg-muted/20 border-dashed hover:opacity-100 hover:border-solid transition-opacity'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isActiveJob ? 'default' : 'outline'}
                        className={`text-xs ${
                          isActiveJob
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold'
                            : ''
                        }`}
                      >
                        {meta?.icon ?? '💼'} {jobLabel(task.job_type, locale)}
                      </Badge>
                      {isActiveJob && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-0 text-[10px] px-1.5 py-0 font-bold">
                          ✨ {isEn ? 'Mine' : '내 직업'}
                        </Badge>
                      )}
                      {task.recommended && (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] px-1.5 py-0 font-bold">
                          ★ {isEn ? 'Today’s pick' : '오늘 추천'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {difficultyLabel(task.difficulty, locale)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center justify-between">
                    <span>{task.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">{task.description}</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-2 text-xs py-2">
                  <div className="rounded-lg bg-muted/50 p-2.5 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isEn ? 'WLD this run' : '이번 지급 WLD'}
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {task.reward_preview === null ? '—' : `+${task.reward_preview} WLD`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        {task.experience_preview === null ? '—' : `+${task.experience_preview} EXP`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px] px-1">
                    <span>
                      {isEn
                        ? `Duration: ${durationLabel(task.minimum_duration_seconds, locale)}`
                        : `소요 시간: ${durationLabel(task.minimum_duration_seconds, locale)}`}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {isEn ? `Completed today: ${task.taken_today}` : `오늘 ${task.taken_today}회 완료`}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  {isActiveJob ? (
                    <TaskCompleteModalButton task={task} isActiveJob />
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
