'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useActionState } from 'react';
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

type WorkPhase = 'idle' | 'running' | 'slow_network' | 'done' | 'error';

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
  const [phase, setPhase] = useState<WorkPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [combo, setCombo] = useState(0);
  const [state, formAction] = useActionState(completeTaskV2Action, IDLE);
  const [isPending, startTransition] = useTransition();

  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const meta = jobMeta(task.job_type, locale);
  const isLimitReached = task.taken_today >= task.daily_limit;
  const isBusy = phase === 'running' || phase === 'slow_network' || isPending;
  const overtimeReward = Math.max(30, Math.round(Number(task.base_reward) * 0.25));

  // Sync server action response to UI state
  useEffect(() => {
    if (phase === 'idle') return;

    if (state.status === 'ok') {
      clearAllTimers();
      setProgress(100);
      setPhase('done');
      setCombo((prev) => prev + 1);

      const streakText = combo > 0 ? (isEn ? ` 🔥 ${combo + 1} COMBO STREAK!` : ` 🔥 ${combo + 1}연속 완수 피버!`) : '';
      setStatusText(
        (isEn
          ? 'Transaction confirmed & reward claimed!'
          : '블록체인·원장 검증 완료! 보상이 정상 지급되었습니다.') + streakText,
      );

      // Auto close after 2.2 seconds if user doesn't click
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setPhase('idle');
        setProgress(0);
      }, 2200);
    } else if (state.status === 'error') {
      clearAllTimers();
      setPhase('error');
      setStatusText(
        state.message ?? (isEn ? 'Task execution failed.' : '업무 처리에 실패했습니다.'),
      );
    }
  }, [state, isEn, combo, phase]);

  const handleStartWork = () => {
    clearAllTimers();
    setPhase('running');
    setProgress(15);
    setStatusText(
      isEn
        ? 'Executing algorithms & verifying integrity...'
        : '업무 알고리즘 실행 및 데이터 무결성 검증 중...',
    );

    // Phase 1: Rapid local preparation (15% -> 70%)
    let cur = 15;
    progressTimerRef.current = setInterval(() => {
      cur += 10;
      if (cur >= 70) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        cur = 70;
        setProgress(70);
        setStatusText(
          isEn
            ? 'Transmitting payload & writing to ledger...'
            : '서버 전송 및 원장 멱등 트랜잭션 기록 중...',
        );

        // Slow crawl while waiting for network response (70% -> 88%)
        progressTimerRef.current = setInterval(() => {
          setProgress((p) => (p < 88 ? p + 2 : 88));
        }, 300);

        // Dispatch actual server action
        const fd = new FormData();
        fd.append('taskId', task.task_id);
        startTransition(() => {
          formAction(fd);
        });
      } else {
        setProgress(cur);
      }
    }, 80);

    // Phase 2: Detect slow network / ping delay after 2.5s
    slowTimerRef.current = setTimeout(() => {
      setPhase((prev) => {
        if (prev === 'running') {
          setStatusText(
            isEn
              ? 'Network ping delay detected. Safely keeping idempotent connection...'
              : '네트워크 핑 지연 감지됨. 멱등 트랜잭션 안전 유지 중...',
          );
          return 'slow_network';
        }
        return prev;
      });
    }, 2500);

    // Phase 3: Client timeout after 8.5s (prevent indefinite freeze)
    timeoutTimerRef.current = setTimeout(() => {
      setPhase((prev) => {
        if (prev === 'running' || prev === 'slow_network') {
          clearAllTimers();
          setStatusText(
            isEn
              ? 'Network timeout occurred. Please click [Retry].'
              : '네트워크 핑 손실 또는 응답 지연이 발생했습니다. [다시 시도]를 눌러주세요.',
          );
          return 'error';
        }
        return prev;
      });
    }, 8500);
  };

  return (
    <div>
      <Button
        variant={isActiveJob ? (isLimitReached ? 'default' : 'default') : 'outline'}
        disabled={!isActiveJob}
        onClick={() => {
          setPhase('idle');
          setProgress(0);
          setStatusText('');
          setIsOpen(true);
        }}
        className={`w-full font-semibold shadow-sm transition-all ${
          isActiveJob && isLimitReached
            ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500/50'
            : ''
        }`}
      >
        {!isActiveJob
          ? (isEn ? 'Switch Career First' : '해당 직업 전직 필요')
          : isLimitReached
          ? (isEn ? '🔥 Overtime Work (Unlimited)' : '🔥 추가 특근 수행 (무제한)')
          : (isEn ? '⚡ Perform Task' : '⚡ 즉시 업무 수행')}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-border/80 bg-background/95 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="flex items-center gap-1.5 font-medium px-2.5 py-1">
                  <span>{meta?.icon ?? '💼'}</span>
                  <span>{jobLabel(task.job_type, locale)}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>{difficultyLabel(task.difficulty, locale)}</span>
                </Badge>
                {isLimitReached ? (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1 font-semibold">
                    <span>⚡</span>
                    <span>{isEn ? 'Overtime Mode (Unlimited)' : '추가 특근 (무제한)'}</span>
                  </Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {isEn
                      ? `Daily ${task.taken_today}/${task.daily_limit}`
                      : `일일 ${task.taken_today}/${task.daily_limit}회`}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-2">{task.name}</CardTitle>
              <CardDescription className="text-sm">{task.description}</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="rounded-xl border border-border/50 bg-muted/40 p-3 grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {isLimitReached
                      ? (isEn ? 'Overtime Reward' : '특근 WLD 보상')
                      : (isEn ? 'Base Reward' : '기본 WLD 보상')}
                  </span>
                  <span className="text-base font-bold text-emerald-400">
                    +{isLimitReached ? overtimeReward : task.base_reward} WLD
                    {isLimitReached && <span className="text-[11px] font-normal text-muted-foreground ml-1">(25%)</span>}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {isEn ? 'Proficiency EXP' : '획득 숙련도 EXP'}
                  </span>
                  <span className="text-base font-bold text-amber-400">
                    +{task.base_experience} EXP
                    <span className="text-[11px] font-normal text-emerald-400 ml-1">(100%)</span>
                  </span>
                </div>
              </div>

              {isLimitReached && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-300 text-center flex items-center justify-center gap-1.5">
                  <span>⚡</span>
                  <span>{isEn ? 'Daily quota completed! You can now perform unlimited overtime to earn EXP and level up.' : '기본 일일 횟수 달성! 멈추지 않고 추가 특근을 통해 숙련도 EXP 100%와 WLD를 무제한 획득할 수 있습니다.'}</span>
                </div>
              )}

              {phase !== 'idle' ? (
                <div className="space-y-2 py-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span
                      className={
                        phase === 'slow_network'
                          ? 'text-amber-400 font-semibold animate-pulse'
                          : phase === 'done'
                          ? 'text-emerald-400 font-semibold'
                          : phase === 'error'
                          ? 'text-rose-400 font-semibold'
                          : 'text-muted-foreground'
                      }
                    >
                      {statusText}
                    </span>
                    <span className="font-mono text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ease-out rounded-full ${
                        phase === 'slow_network'
                          ? 'bg-amber-500 animate-pulse'
                          : phase === 'done'
                          ? 'bg-emerald-500'
                          : phase === 'error'
                          ? 'bg-rose-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <ActionAlert state={state} />

              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="ghost"
                  disabled={isBusy && phase === 'running'}
                  onClick={() => {
                    clearAllTimers();
                    setIsOpen(false);
                    setPhase('idle');
                  }}
                >
                  {isEn ? 'Close' : '닫기'}
                </Button>
                <Button
                  disabled={isBusy && phase !== 'slow_network'}
                  onClick={handleStartWork}
                  className={`font-bold transition-all ${
                    isLimitReached && phase !== 'error' && phase !== 'done'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : ''
                  }`}
                  variant={phase === 'error' ? 'destructive' : 'default'}
                >
                  {phase === 'running'
                    ? (isEn ? 'Processing...' : '수행 중...')
                    : phase === 'slow_network'
                    ? (isEn ? 'Connecting...' : '응답 대기 중...')
                    : phase === 'done'
                    ? (isEn ? 'Completed ✓' : '완료됨 ✓')
                    : phase === 'error'
                    ? (isEn ? 'Retry' : '다시 시도')
                    : isLimitReached
                    ? (isEn ? '🔥 Perform Overtime & Claim' : '🔥 추가 특근 수행 및 보상 수령')
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
