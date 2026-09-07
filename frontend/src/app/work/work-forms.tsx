'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { claimReward, completeTaskV2Action, submitTask, switchJobAction, takeTask } from './actions';
import {
  difficultyLabel,
  jobLabel,
  jobMeta,
  type JobMeta,
  type WorkTask,
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
      <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/40 px-3 py-1 font-semibold">
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
  onClose,
}: {
  readonly task: WorkTask;
  readonly onClose: () => void;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const router = useRouter();
  const [state, action] = useActionState(completeTaskV2Action, IDLE);
  const meta = jobMeta(task.job_type, locale);
  const rewardPaused = task.reward_preview === null || task.experience_preview === null;

  useEffect(() => {
    if (state.status === 'ok') router.refresh();
  }, [router, state.status]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-md border-border/80 bg-background/95 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5 font-medium px-2.5 py-1">
              <span>{meta?.icon ?? '💼'}</span>
              <span>{jobLabel(task.job_type, locale)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{difficultyLabel(task.difficulty, locale)}</span>
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {isEn ? `Completed today ${task.taken_today}` : `오늘 ${task.taken_today}회 완료`}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2">{task.name}</CardTitle>
          <CardDescription className="text-sm">{task.description}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="rounded-xl border border-border/50 bg-muted/40 p-3 grid grid-cols-2 gap-2 text-center text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">
                {isEn ? 'WLD paid this run' : '이번 지급 WLD'}
              </span>
              <span className="text-lg font-black text-emerald-400">
                {task.reward_preview === null ? '—' : `+${task.reward_preview} WLD`}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">
                {isEn ? 'Proficiency EXP' : '숙련도 EXP'}
              </span>
              <span className="text-lg font-black text-amber-400">
                {task.experience_preview === null ? '—' : `+${task.experience_preview} EXP`}
              </span>
            </div>
          </div>

          {rewardPaused ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              {isEn
                ? 'Career work payouts are temporarily paused by the current operations policy.'
                : '현재 운영 정책에 따라 직업 업무 보상 지급이 일시 중지되어 있습니다.'}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs leading-5 text-emerald-300">
              {isEn
                ? 'The server validates your active career, writes one idempotent ledger transaction, then records EXP. Repeating the task is allowed.'
                : '서버가 현재 활성 직업을 확인한 뒤 멱등 원장 거래 1건과 숙련도 EXP를 기록합니다. 같은 업무는 반복 수행할 수 있습니다.'}
            </div>
          )}

          {state.status !== 'ok' && (
            <form action={action} className="grid gap-2">
              <input type="hidden" name="taskId" value={task.task_id} />
              <SubmitButton disabled={rewardPaused} className="w-full font-bold">
                {isEn ? 'Perform task and receive reward' : '업무 수행하고 보상 받기'}
              </SubmitButton>
            </form>
          )}

          <ActionAlert state={state} />

          {state.status === 'ok' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-300">
              {isEn
                ? 'Completed. The ledger and career proficiency have been refreshed.'
                : '완료되었습니다. 지갑 원장과 직업 숙련도가 최신 상태로 갱신되었습니다.'}
            </div>
          )}
        </CardContent>

        <div className="flex justify-end gap-2 px-6 pb-5">
          <Button type="button" variant="ghost" onClick={onClose}>
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
}: {
  readonly task: WorkTask;
  readonly isActiveJob: boolean;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [cycle, setCycle] = useState(0);
  const rewardPaused = task.reward_preview === null || task.experience_preview === null;

  const close = () => {
    setIsOpen(false);
    setCycle((value) => value + 1);
  };

  return (
    <div className="w-full">
      <Button
        variant={isActiveJob ? 'default' : 'outline'}
        disabled={!isActiveJob || rewardPaused}
        onClick={() => setIsOpen(true)}
        className="w-full font-semibold shadow-sm transition-all"
      >
        {!isActiveJob
          ? isEn
            ? 'Switch career first'
            : '해당 직업으로 먼저 전직'
          : rewardPaused
            ? isEn
              ? 'Rewards paused'
              : '보상 지급 일시 중지'
            : isEn
              ? 'Perform career task'
              : '직업 업무 수행'}
      </Button>

      {isOpen && <TaskCompletionPanel key={cycle} task={task} onClose={close} />}
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
