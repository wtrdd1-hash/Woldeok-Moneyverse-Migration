'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import {
  claimReward,
  completeTaskV2Action,
  submitTask,
  switchJobAction,
  takeTask,
} from './actions';
import {
  difficultyLabel,
  jobLabel,
  jobMeta,
  type JobMeta,
  type WorkTask,
  type WorkTaskBlock,
} from './work';

export function JobSwitchButton({
  job,
  isActive,
  level,
}: {
  readonly job: JobMeta;
  readonly isActive: boolean;
  readonly level: number;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [state, action] = useActionState(switchJobAction, IDLE);

  if (isActive) {
    return (
      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800 px-3 py-1 font-semibold">
        {isEn ? `Active Career (Lv.${level})` : `현재 활성 직업 (Lv.${level})`}
      </Badge>
    );
  }

  const jobName = isEn ? (job.enName ?? job.name) : job.name;

  return (
    <div className="grid gap-1.5 w-full">
      <form action={action} className="w-full">
        <input type="hidden" name="jobType" value={job.code} />
        <SubmitButton variant="outline" className="w-full text-xs font-medium">
          {isEn ? `Switch to ${jobName}` : `${jobName}으로 전직하기`}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

function TaskCompletionPanel({
  task,
  requestKey,
  onClose,
}: {
  readonly task: WorkTask;
  readonly requestKey: string;
  readonly onClose: () => void;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const router = useRouter();
  const [state, action, pending] = useActionState(completeTaskV2Action, IDLE);
  const meta = jobMeta(task.job_type, locale);
  const rewardPaused = task.reward_preview === null || task.experience_preview === null;
  const [slow, setSlow] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Lock body scroll on modal mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Initial scroll to top on modal mount
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (state.status === 'ok') router.refresh();
  }, [router, state.status]);

  useEffect(() => {
    setSlow(false);
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), 4_000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  // Auto smooth scroll to pending status
  useEffect(() => {
    if (pending) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [pending]);

  // Auto smooth scroll when completion state or error is received
  useEffect(() => {
    if (state.status === 'ok' || state.status === 'error' || state.message) {
      const timer = window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-completion-title"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <Card className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile touch grab handle */}
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-muted-foreground/30 sm:hidden" />

        <CardHeader className="shrink-0 p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 font-medium px-2.5 py-1"
            >
              <span>{meta?.icon ?? '💼'}</span>
              <span>{jobLabel(task.job_type, locale)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{difficultyLabel(task.difficulty, locale)}</span>
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
              {isEn ? `Completed today ${task.taken_today}` : `오늘 ${task.taken_today}회 완료`}
            </Badge>
          </div>
          <CardTitle id="task-completion-title" className="text-lg sm:text-xl mt-2 font-bold">{task.name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">{task.description}</CardDescription>
        </CardHeader>

        <CardContent ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain grid gap-3.5 px-4 sm:px-6 py-3">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 grid grid-cols-2 gap-2 text-center text-sm">
            <div className="border-r border-border/40 pr-2">
              <span className="text-xs text-muted-foreground block font-medium">
                {isEn ? 'WLD reward' : '이번 지급 WLD'}
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-base sm:text-lg">
                {task.reward_preview === null ? '—' : `+${task.reward_preview} WLD`}
              </span>
            </div>
            <div className="pl-2">
              <span className="text-xs text-muted-foreground block font-medium">
                {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-base sm:text-lg">
                {task.experience_preview === null ? '—' : `+${task.experience_preview} EXP`}
              </span>
            </div>
          </div>

          <form action={action} className="grid gap-3">
            <input type="hidden" name="taskId" value={task.task_id} />
            <input type="hidden" name="idempotencyKey" value={requestKey} />

            <SubmitButton
              disabled={rewardPaused}
              className="w-full min-h-12 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98]"
            >
              {rewardPaused
                ? isEn
                  ? 'Rewards temporarily unavailable'
                  : '보상 지급 일시 중지'
                : isEn
                  ? 'Complete Task Immediately'
                  : '업무 완료 및 보상 수령'}
            </SubmitButton>
          </form>

          <div ref={resultRef} className="grid gap-2">
            {pending && (
              <div
                className="rounded-xl border border-border/80 bg-muted/70 p-3.5 text-xs sm:text-sm text-foreground animate-pulse shadow-sm font-medium"
                role="status"
              >
                {slow
                  ? isEn
                    ? 'The response is taking longer than usual. The request is protected against duplicates and will time out safely instead of spinning forever.'
                    : '응답이 평소보다 늦습니다. 동일 요청은 중복 지급되지 않으며, 무한 로딩 대신 안전하게 시간 초과 후 다시 시도할 수 있습니다.'
                  : isEn
                    ? 'The server is recording the ledger transaction and proficiency EXP…'
                    : '서버가 원장 거래와 직업 숙련도를 기록하고 있습니다…'}
              </div>
            )}

            <ActionAlert state={state} />

            {state.status === 'ok' && (
              <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 p-3.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <span>
                    {isEn
                      ? 'Completed. The ledger and career proficiency have been refreshed.'
                      : '완료되었습니다. 지갑 원장과 직업 숙련도가 최신 상태로 갱신되었습니다.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <div className="shrink-0 flex items-center justify-end gap-2 px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border/60 bg-muted/20">
          <Button
            type="button"
            variant={state.status === 'ok' ? 'default' : 'ghost'}
            onClick={onClose}
            disabled={pending}
            className={`min-h-11 font-bold ${
              state.status === 'ok'
                ? 'w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'w-full sm:w-auto'
            }`}
          >
            {state.status === 'ok' ? (isEn ? 'Done' : '완료') : isEn ? 'Close' : '닫기'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function TaskCompleteModalButton({
  task,
  isActiveJob,
  blockedReason,
}: {
  readonly task: WorkTask;
  readonly isActiveJob: boolean;
  readonly blockedReason?: WorkTaskBlock;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [requestKey, setRequestKey] = useState('');
  const rewardPaused = task.reward_preview === null || task.experience_preview === null;

  const open = () => {
    setRequestKey(crypto.randomUUID());
    setCycle((value) => value + 1);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setRequestKey('');
    setCycle((value) => value + 1);
  };

  return (
    <div className="w-full">
      <Button
        variant={isActiveJob ? 'default' : 'outline'}
        disabled={!isActiveJob || rewardPaused || Boolean(blockedReason)}
        onClick={open}
        className="w-full font-semibold shadow-sm transition-all"
      >
        {!isActiveJob
          ? isEn
            ? 'Switch career first'
            : '해당 직업으로 먼저 전직'
          : blockedReason === 'weekly'
            ? isEn
              ? 'Weekly reward limit reached'
              : '주간 보상 한도 도달'
            : blockedReason === 'daily'
              ? isEn
                ? 'Daily reward limit reached'
                : '일간 보상 한도 도달'
              : blockedReason === 'task_daily'
                ? isEn
                  ? 'Task daily limit reached'
                  : '업무 일일 횟수 도달'
                : rewardPaused
                  ? isEn
                    ? 'Rewards paused'
                    : '보상 지급 일시 중지'
                  : isEn
                    ? 'Perform career task'
                    : '직업 업무 수행'}
      </Button>

      {isOpen && requestKey && (
        <TaskCompletionPanel key={cycle} task={task} requestKey={requestKey} onClose={close} />
      )}
    </div>
  );
}

export function TakeButton({
  taskId,
  disabled,
  label,
}: {
  readonly taskId: string;
  readonly disabled: boolean;
  readonly label: string;
}) {
  const [state, action] = useActionState(takeTask, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="taskId" value={taskId} />
        <SubmitButton disabled={disabled}>{label}</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function SubmitTaskButton({
  assignmentId,
  disabled,
  label,
}: {
  readonly assignmentId: string;
  readonly disabled: boolean;
  readonly label: string;
}) {
  const [state, action] = useActionState(submitTask, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <SubmitButton variant="outline" disabled={disabled}>
          {label}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function ClaimButton({ assignmentId }: { readonly assignmentId: string }) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [state, action] = useActionState(claimReward, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <SubmitButton>{isEn ? 'Claim Reward' : '보상 받기'}</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
