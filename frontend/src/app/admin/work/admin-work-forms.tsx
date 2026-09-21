'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IDLE } from '@/lib/action-state';
import { formatMoment, groupDigits } from '@/lib/money';
import { StepUpField } from '../step-up-field';
import type { AdminWorkPolicy, AdminWorkTask } from '../types';
import { updateWorkRewardPolicy, updateWorkTask } from './actions';

const JOB_LABELS: Readonly<Record<string, string>> = {
  farmer: '농부',
  miner: '광부',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

function durationLabel(seconds: number): string {
  return seconds < 60 ? `${seconds}초` : `${Math.round(seconds / 60)}분`;
}

/**
 * 1. 전역 직업 보상 정책 튜닝 카드
 */
export function WorkPolicyTuningCard({
  policy,
}: {
  readonly policy: AdminWorkPolicy;
}) {
  const [state, action] = useActionState(updateWorkRewardPolicy, IDLE);
  const [dailyCap, setDailyCap] = useState<string>(
    policy.daily_cap !== null && policy.daily_cap !== '0' ? policy.daily_cap : '',
  );
  const [weeklyCap, setWeeklyCap] = useState<string>(
    policy.weekly_cap !== null && policy.weekly_cap !== '0' ? policy.weekly_cap : '',
  );
  const [decayPercent, setDecayPercent] = useState<number>(
    policy.repeat_decay_percent ?? 0,
  );
  const [enabled, setEnabled] = useState<boolean>(policy.enabled ?? true);

  const presets = [
    { label: '400 WLD', value: '400' },
    { label: '1,000 WLD', value: '1000' },
    { label: '5,000 WLD', value: '5000' },
    { label: '10,000 WLD', value: '10000' },
    { label: '50,000 WLD', value: '50000' },
    { label: '무제한 (해제)', value: '' },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            전역 직업 보상 한도 &amp; 정책 실시간 튜닝
          </CardTitle>
          <Badge variant={enabled ? 'default' : 'destructive'} className="font-mono">
            {enabled ? '보상 지급 활성화' : '지급 중지됨'}
          </Badge>
        </div>
        <CardDescription>
          사용자 1인당 하루/주간 보상 한도(Daily/Weekly Cap) 및 반복 수행 시 감액률을 실시간으로
          조절합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="daily-cap">1인당 일일 보상 상한 (Daily Cap)</FieldLabel>
                <span className="font-mono text-xs font-semibold text-primary">
                  {dailyCap === '' || dailyCap === '0' ? '무제한' : `${groupDigits(dailyCap)} WLD`}
                </span>
              </div>
              <Input
                id="daily-cap"
                name="daily_cap"
                type="number"
                min={0}
                max={100000000}
                placeholder="비워 두거나 0이면 무제한"
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                className="font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    type="button"
                    variant={dailyCap === p.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setDailyCap(p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <FieldDescription>
                한도 초과 시 당일 추가 보상 지급이 차단되거나 안내됩니다. 비워두면 상한 없음.
              </FieldDescription>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="weekly-cap">1인당 주간 보상 상한 (Weekly Cap)</FieldLabel>
                <span className="font-mono text-xs font-semibold text-primary">
                  {weeklyCap === '' || weeklyCap === '0' ? '무제한' : `${groupDigits(weeklyCap)} WLD`}
                </span>
              </div>
              <Input
                id="weekly-cap"
                name="weekly_cap"
                type="number"
                min={0}
                max={1000000000}
                placeholder="비워 두거나 0이면 무제한"
                value={weeklyCap}
                onChange={(e) => setWeeklyCap(e.target.value)}
                className="font-mono"
              />
              <FieldDescription>
                주간 누적 지급 한도입니다. 비워 두면 무제한으로 지급됩니다.
              </FieldDescription>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="repeat-decay">반복 수행 감액률 (%)</FieldLabel>
                <span className="font-mono text-xs font-semibold text-primary">
                  {decayPercent}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="repeat-decay"
                  min={0}
                  max={50}
                  step={5}
                  value={decayPercent}
                  onChange={(e) => setDecayPercent(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <input
                  type="hidden"
                  name="repeat_decay_percent"
                  value={decayPercent}
                />
              </div>
              <FieldDescription>
                같은 작업을 당일 반복 수행할 때 차감되는 보상 비율 (0% = 매번 전액 지급).
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="work-enabled">전역 보상 지급 스위치</FieldLabel>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    id="work-enabled"
                    name="enabled"
                    value="true"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="font-medium">
                    {enabled ? '전역 직업 보상 시스템 정상 운영' : '긴급 보상 지급 중지 (스위치 OFF)'}
                  </span>
                </label>
              </div>
              <FieldDescription>
                긴급 점검이나 경제 이상 발생 시 보상 지급을 즉시 중지할 수 있습니다.
              </FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="policy-reason">정책 변경 사유 (감사 로그용)</FieldLabel>
            <Input
              id="policy-reason"
              name="reason"
              placeholder="예: 직업 일일 한도 상향 및 경제 활성화 조치"
              defaultValue="관리자 콘솔에서 직업 보상 정책 튜닝"
            />
          </Field>

          <div>
            <StepUpField
              id="admin-work-policy"
              undo="같은 화면에서 이전 수치로 다시 저장할 수 있습니다."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton variant="default">직업 보상 정책 저장</SubmitButton>
            <ActionAlert state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * 2. 개별 작업 행 인터랙티브 튜닝 컴포넌트
 */
function WorkTaskRow({ task }: { readonly task: AdminWorkTask }) {
  const [state, action] = useActionState(updateWorkTask, IDLE);
  const [baseReward, setBaseReward] = useState<string>(task.base_reward);
  const [dailyLimit, setDailyLimit] = useState<number>(task.daily_limit);
  const [minDuration, setMinDuration] = useState<number>(task.minimum_duration_seconds);
  const [active, setActive] = useState<boolean>(task.active);

  return (
    <TableRow className={!active ? 'opacity-60 bg-muted/20' : undefined}>
      <TableCell>
        <span className="grid gap-0.5">
          <b className="text-sm">{task.name}</b>
          <span className="font-mono text-xs text-muted-foreground">{task.code}</span>
        </span>
      </TableCell>
      <TableCell className="text-sm">{jobLabel(task.job_type)}</TableCell>
      <TableCell className="text-center font-mono text-xs">Lv.{task.difficulty}</TableCell>

      {/* 인라인 수정 폼 셀 */}
      <TableCell colSpan={7} className="p-2">
        <form action={action} className="flex flex-wrap items-center justify-end gap-2.5">
          <input type="hidden" name="taskId" value={task.task_id} />
          <input type="hidden" name="taskName" value={task.name} />

          <div className="flex items-center gap-1.5" title="1회 수행 시 지급할 기본 보상(WLD)">
            <span className="text-xs text-muted-foreground whitespace-nowrap">보상:</span>
            <Input
              name="base_reward"
              type="number"
              min={1}
              max={1000000}
              value={baseReward}
              onChange={(e) => setBaseReward(e.target.value)}
              className="h-8 w-24 font-mono text-right text-xs"
              required
            />
            <span className="text-xs font-semibold">WLD</span>
          </div>

          <div className="flex items-center gap-1.5" title="1일 최대 수행 가능 횟수 (0=무제한)">
            <span className="text-xs text-muted-foreground whitespace-nowrap">일일한도:</span>
            <Input
              name="daily_limit"
              type="number"
              min={0}
              max={1000}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="h-8 w-20 font-mono text-right text-xs"
              required
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {dailyLimit === 0 ? '(무제한)' : '회'}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="최소 소요 시간(초)">
            <span className="text-xs text-muted-foreground whitespace-nowrap">소요:</span>
            <Input
              name="minimum_duration_seconds"
              type="number"
              min={5}
              max={86400}
              value={minDuration}
              onChange={(e) => setMinDuration(Number(e.target.value))}
              className="h-8 w-20 font-mono text-right text-xs"
              required
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">초</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs pr-1">
            <input
              type="checkbox"
              name="active"
              value="true"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-primary"
            />
            <span className={active ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {active ? '제공 중' : '중지'}
            </span>
          </label>

          <SubmitButton size="sm" className="h-8 px-2.5 text-xs font-semibold">
            적용
          </SubmitButton>
        </form>
        {state.status !== 'idle' && (
          <div className="pt-1 text-right">
            <ActionAlert state={state} />
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

/**
 * 3. 개별 작업 카탈로그 튜닝 테이블
 */
export function WorkTaskTuningTable({
  tasks,
}: {
  readonly tasks: readonly AdminWorkTask[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">직업별 작업 보상 &amp; 일일 한도 개별 튜닝</CardTitle>
            <CardDescription>
              각 직업 작업의 1회 지급 보상(WLD), 일일 수행 가능 한도(회), 소요 시간 및 제공 상태를
              개별적으로 정밀 조정합니다.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {tasks.length}개 작업 등록됨
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">작업명 / 코드</TableHead>
                <TableHead className="w-20">직업</TableHead>
                <TableHead className="w-16 text-center">난이도</TableHead>
                <TableHead className="text-right">실시간 튜닝 설정 (보상 / 한도 / 소요시간 / 상태)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <WorkTaskRow key={task.task_id} task={task} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
