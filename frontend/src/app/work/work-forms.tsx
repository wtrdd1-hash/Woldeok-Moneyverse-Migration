'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IDLE } from '@/lib/action-state';
import { claimReward, completeTaskV2Action, submitTask, switchJobAction, takeTask } from './actions';
import type { JobMeta, WorkTask } from './work';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [state, formAction] = useActionState(completeTaskV2Action, IDLE);
  const [, startTransition] = useTransition();

  const handleStartWork = () => {
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const fd = new FormData();
      fd.append('taskId', task.task_id);
      startTransition(() => {
        formAction(fd);
        setIsProcessing(false);
      });
    }, 800);
  };

  const isLimitReached = task.taken_today >= task.daily_limit;

  return (
    <div>
      <Button
        variant={isActiveJob ? 'default' : 'outline'}
        disabled={!isActiveJob || isLimitReached}
        onClick={() => setIsOpen(true)}
        className="w-full font-semibold shadow-sm"
      >
        {!isActiveJob
          ? (isEn ? 'Switch Career First' : '해당 직업 전직 필요')
          : isLimitReached
          ? (isEn ? 'Completed Today' : '오늘 수행 완료')
          : (isEn ? '⚡ Perform Task' : '⚡ 즉시 업무 수행')}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-border/80 bg-background/95 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{task.code}</Badge>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {isEn
                    ? `Daily ${task.taken_today}/${task.daily_limit}`
                    : `일일 ${task.taken_today}/${task.daily_limit}회`}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2">{task.name}</CardTitle>
              <CardDescription className="text-sm">{task.description}</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="rounded-xl border border-border/50 bg-muted/40 p-3 grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {isEn ? 'Base Reward' : '기본 WLD 보상'}
                  </span>
                  <span className="text-base font-bold text-emerald-400">+{task.base_reward} WLD</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {isEn ? 'Proficiency EXP' : '획득 숙련도 EXP'}
                  </span>
                  <span className="text-base font-bold text-amber-400">+{task.base_experience} EXP</span>
                </div>
              </div>

              {isProcessing ? (
                <div className="space-y-2 py-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{isEn ? 'Processing task & executing algorithms...' : '업무 진행 및 알고리즘 검증 중...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <ActionAlert state={state} />

              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => setIsOpen(false)}
                >
                  {isEn ? 'Close' : '닫기'}
                </Button>
                <Button
                  disabled={isProcessing || isLimitReached}
                  onClick={handleStartWork}
                  className="font-bold"
                >
                  {isProcessing
                    ? (isEn ? 'Processing...' : '수행 중...')
                    : (isEn ? 'Complete Task & Claim Reward' : '업무 완료 및 보상 수령')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
