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
        {isEn ? `⚡ Switch to ${jobName} & Perform` : `⚡ ${jobName}(으)로 전직 후 바로 수행`}
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
  const myTotalDailyLimit = myTasks.reduce((sum, t) => sum + t.daily_limit, 0);
  const myCompletedToday = myTasks.reduce((sum, t) => sum + t.taken_today, 0);
  const isAllMyTasksDone =
    myTasks.length > 0 && myTasks.every((t) => t.taken_today >= t.daily_limit);

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
            <span className="ml-1.5">{isEn ? 'All Career Tasks' : '전체 직업 업무'}</span>
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
              {tasks.length}
            </Badge>
          </Button>
        </div>

        {activeJobType && (
          <div className="flex items-center gap-2 text-xs">
            {isAllMyTasksDone ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1 py-1 px-2.5 font-bold">
                <span className="animate-pulse">⚡</span>
                <span>
                  {isEn
                    ? `Overtime Mode Active (Total ${myCompletedToday} completed)`
                    : `특근 가동 중 (오늘 총 ${myCompletedToday}회 수행)`}
                </span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                <span className="text-emerald-400 font-mono font-bold">
                  {myCompletedToday}/{myTotalDailyLimit}회
                </span>
                <span className="text-muted-foreground">
                  {isEn ? 'Daily Career Quests' : '기본 일일 퀘스트'}
                </span>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 2. 일일 퀘스트 올클리어 축하 배너 */}
      {activeJobType && isAllMyTasksDone && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4 shadow-sm animate-in fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🏆</span>
            <div>
              <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <span>{isEn ? 'Daily Career Quests Completed!' : '오늘의 기본 직업 업무 모두 완수!'}</span>
                <Badge className="bg-amber-500 text-black font-bold text-[10px] px-1.5 py-0">
                  {isEn ? 'Overtime Active' : '특근 모드 가동'}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEn
                  ? 'Overtime has no task-count limit; rewards still follow the economy policy.'
                  : '특근 수행 횟수에는 제한이 없으며, 보상은 경제 정책에 따라 적용됩니다.'}
              </p>
            </div>
          </div>
          <Badge className="bg-amber-600 text-white font-semibold self-end sm:self-auto px-3 py-1">
            ⚡ {isEn ? 'Overtime Available' : '특근 수행 가능'}
          </Badge>
        </div>
      )}

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
            const isOvertime = task.taken_today >= task.daily_limit;

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
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {difficultyLabel(task.difficulty, locale)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center justify-between">
                    <span>{task.name}</span>
                    {isActiveJob && isOvertime && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ⚡ {isEn ? 'Overtime' : '특근 가능'}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">{task.description}</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-2 text-xs py-2">
                  <div className="rounded-lg bg-muted/50 p-2.5 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isOvertime
                          ? (isEn ? 'Overtime WLD' : '특근 WLD 보상')
                          : (isEn ? 'WLD Reward' : 'WLD 보상')}
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        +{task.reward_preview ?? task.base_reward} WLD
                        {isOvertime && <span className="text-[10px] font-normal text-muted-foreground ml-1">(25%)</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        +{task.base_experience} EXP
                        <span className="text-[10px] font-normal text-emerald-400 ml-1">(100%)</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px] px-1">
                    <span>
                      {isEn
                        ? `Duration: ${durationLabel(task.minimum_duration_seconds, locale)}`
                        : `소요 시간: ${durationLabel(task.minimum_duration_seconds, locale)}`}
                    </span>
                    <span className={isOvertime ? 'text-amber-400 font-semibold' : ''}>
                      {isOvertime
                        ? (isEn ? `Today: ${task.taken_today} (Overtime)` : `오늘: ${task.taken_today}회 (특근 중)`)
                        : (isEn ? `Today: ${task.taken_today}/${task.daily_limit}` : `오늘 완료: ${task.taken_today}/${task.daily_limit}회`)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 flex flex-col gap-1.5">
                  <TaskCompleteModalButton task={task} isActiveJob={isActiveJob} />
                  {!isActiveJob && (
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
