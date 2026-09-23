'use client';

import { Sparkles, Briefcase } from 'lucide-react';

import { useActionState, useEffect, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

function TaskCompletionModal({
  open,
  task,
  requestKey,
  onClose,
}: {
  readonly open: boolean;
  readonly task: WorkTask;
  readonly requestKey: string;
  readonly onClose: () => void;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [state, action, pending] = useActionState(completeTaskV2Action, IDLE);
  const rewardPaused = task.reward_preview === null || task.experience_preview === null;
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    setSlow(false);
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), 4_000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !pending) onClose(); }}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 font-medium px-2.5 py-1 text-xs"
            >
              <Briefcase className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{jobLabel(task.job_type, locale)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{difficultyLabel(task.difficulty, locale)}</span>
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[11px] shrink-0">
              {isEn ? `Completed today ${task.taken_today}` : `오늘 ${task.taken_today}회 완료`}
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">{task.name}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {task.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/70 bg-muted/40 p-4 grid grid-cols-2 gap-3 text-center my-3">
          <div className="border-r border-border/50 pr-2">
            <span className="text-xs text-muted-foreground block font-medium mb-1">
              {isEn ? 'WLD reward' : '이번 지급 WLD'}
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-lg sm:text-xl">
              {task.reward_preview === null ? '—' : `+${task.reward_preview} WLD`}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-xs text-muted-foreground block font-medium mb-1">
              {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
            </span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-lg sm:text-xl">
              {task.experience_preview === null ? '—' : `+${task.experience_preview} EXP`}
            </span>
          </div>
        </div>

        {state.status === 'ok' ? (
          <div className="space-y-4 pt-1">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <Sparkles className="size-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base text-foreground">
                {isEn ? 'Task Completed!' : '업무 완료!'}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {state.message || (isEn
                  ? 'WLD reward and career proficiency EXP have been credited safely.'
                  : '지갑에 WLD 보상이 입금되고 직업 숙련도가 상승했습니다.')}
              </p>
            </div>
            <Button
              type="button"
              onClick={onClose}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              {isEn ? 'Close' : '확인 및 닫기'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <form action={action} className="grid gap-2">
              <input type="hidden" name="taskId" value={task.task_id} />
              <input type="hidden" name="idempotencyKey" value={requestKey} />
              <SubmitButton
                disabled={rewardPaused}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98]"
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

            {pending && (
              <div
                className="rounded-xl border border-border/80 bg-muted/70 p-3 text-xs sm:text-sm text-foreground animate-pulse font-medium text-center shadow-sm"
                role="status"
              >
                {slow
                  ? isEn
                    ? 'The response is taking longer than usual. The request is protected against duplicates.'
                    : '응답이 평소보다 늦습니다. 동일 요청은 중복 지급되지 않으며 안전하게 처리됩니다.'
                  : isEn
                    ? 'Recording reward and proficiency safely…'
                    : '보상과 직업 숙련도를 안전하게 저장하고 있어요…'}
              </div>
            )}

            <ActionAlert state={state} />

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={pending}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {isEn ? 'Cancel' : '취소'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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

  const handleOpen = () => {
    setRequestKey(crypto.randomUUID());
    setCycle((value) => value + 1);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setRequestKey('');
    setCycle((value) => value + 1);
  };

  return (
    <div className="w-full">
      <Button
        variant={isActiveJob ? 'default' : 'outline'}
        disabled={!isActiveJob || rewardPaused || Boolean(blockedReason)}
        onClick={handleOpen}
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
                    : '업무 시작하고 보상 받기'}
      </Button>

      {isOpen && requestKey && (
        <TaskCompletionModal
          key={cycle}
          open={isOpen}
          task={task}
          requestKey={requestKey}
          onClose={handleClose}
        />
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
