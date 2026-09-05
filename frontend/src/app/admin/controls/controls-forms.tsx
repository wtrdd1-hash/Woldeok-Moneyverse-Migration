'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { StepUpField } from '../step-up-field';
import type { FeatureSwitch } from '../types';
import {
  activateDuePolicies,
  createPolicyVersion,
  grantRole,
  revokeRole,
  rollbackPolicy,
  setFeatureSwitch,
} from './actions';

/**
 * The control plane's controls.
 *
 * Every one of them is the same shape, because §14.9 asks for the same four
 * things before any change: the current value beside the value it is about to
 * become, a mandatory reason, a sentence saying how to undo it, and a code
 * typed immediately before the change is made. `ReasonedStepUp` is those last
 * two, written once, so no dialog can quietly ship without them.
 *
 * Two-person approval used to be what stopped a mistake here. It is gone, so
 * the screen is what is left: naming the target, the blast radius and the way
 * back is not decoration, it is the replacement.
 */

const SWITCH_STATES: readonly { readonly value: string; readonly label: string }[] = [
  { value: 'enabled', label: '사용' },
  { value: 'paused', label: '일시 중지' },
  { value: 'safe_mode', label: '안전 모드' },
  { value: 'disabled', label: '중지' },
];

export function SwitchStateBadge({ state }: { readonly state: FeatureSwitch['state'] }) {
  const label = SWITCH_STATES.find((entry) => entry.value === state)?.label ?? state;
  return (
    <Badge variant={state === 'enabled' ? 'secondary' : state === 'disabled' ? 'destructive' : 'outline'}>
      {label}
    </Badge>
  );
}

/**
 * The mandatory reason, then the code and the way back.
 *
 * `StepUpField` is shared with the rest of the console; the reason field is
 * here because only the control plane's commands take one -- the older
 * catalogue commands have no reason parameter in SQL, and a field that went
 * nowhere would be worse than not asking.
 */
function ReasonedStepUp({
  id,
  undo,
  requireCode = true,
}: {
  readonly id: string;
  /** How to reverse this change, in the operator's own words. */
  readonly undo: string;
  readonly requireCode?: boolean;
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`reason-${id}`}>변경 사유</FieldLabel>
        <Textarea
          id={`reason-${id}`}
          name="reason"
          rows={3}
          minLength={10}
          maxLength={1000}
          required
        />
        <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
      </Field>
      {requireCode ? (
        <StepUpField id={id} undo={undo} />
      ) : (
        <FieldDescription>되돌리는 방법: {undo}</FieldDescription>
      )}
    </>
  );
}

export function FeatureSwitchDialog({ feature }: { readonly feature: FeatureSwitch }) {
  const [state, action] = useActionState(setFeatureSwitch, IDLE);
  const [next, setNext] = useState(feature.state === 'enabled' ? 'paused' : 'enabled');
  const nextLabel = SWITCH_STATES.find((entry) => entry.value === next)?.label ?? next;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11">
          상태 변경
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="featureKey" value={feature.feature_key} />
          {/* Radix Select is not a native control, so the choice travels in a
              hidden field the way a <select name> would. */}
          <input type="hidden" name="state" value={next} />
          <DialogHeader>
            <DialogTitle>{feature.title}</DialogTitle>
            <DialogDescription>
              지금 <b>{SWITCH_STATES.find((entry) => entry.value === feature.state)?.label}</b>
              에서 <b>{nextLabel}</b>(으)로 바꿉니다. 새 요청만 막고 진행 중인 처리는 그대로
              끝납니다.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`switch-${feature.feature_key}`}>바꿀 상태</FieldLabel>
            <Select value={next} onValueChange={setNext}>
              <SelectTrigger id={`switch-${feature.feature_key}`} className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SWITCH_STATES.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <ReasonedStepUp
            id={feature.feature_key}
            undo={`같은 화면에서 ${feature.feature_key}을(를) 다시 이전 상태로 되돌립니다.`}
            requireCode={feature.feature_key !== 'economy_auto_policy'}
          />
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton>{nextLabel}(으)로 변경</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewPolicyVersionForm({ activeVersion }: { readonly activeVersion: string | null }) {
  const [state, action] = useActionState(createPolicyVersion, IDLE);

  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="policy-version">새 버전 이름</FieldLabel>
        <Input id="policy-version" name="version" maxLength={64} required autoComplete="off" />
        <FieldDescription>
          현재 적용 중: {activeVersion ?? '없음'} → 새 버전이 발효되면 이전 버전은 보존된 채
          대체됩니다.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="policy-effective-at">발효 시각</FieldLabel>
        <Input id="policy-effective-at" name="effectiveAt" type="datetime-local" />
        <FieldDescription>비워 두면 즉시 발효합니다.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="policy-payload">정책 내용 (JSON)</FieldLabel>
        <Textarea
          id="policy-payload"
          name="payload"
          rows={6}
          className="font-mono text-[0.75rem]"
          placeholder="{}"
        />
      </Field>
      <ReasonedStepUp id="policy-create" undo="이 화면의 '이전 버전으로 되돌리기'를 실행합니다." />
      <SubmitButton className="w-fit">버전 만들기 →</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}

export function PolicyRollbackDialog({
  activeVersion,
  previousVersion,
}: {
  readonly activeVersion: string | null;
  readonly previousVersion: string | null;
}) {
  const [state, action] = useActionState(rollbackPolicy, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="min-h-11" disabled={!previousVersion}>
          이전 버전으로 되돌리기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>정책 되돌리기</DialogTitle>
            <DialogDescription>
              지금 적용 중인 <b>{activeVersion ?? '없음'}</b>을(를) 되돌리고{' '}
              <b>{previousVersion ?? '없음'}</b>을(를) 다시 적용합니다. 이미 기록된 원장 거래는
              바뀌지 않고, 이후 거래부터 이전 정책을 따릅니다.
            </DialogDescription>
          </DialogHeader>
          <ReasonedStepUp
            id="policy-rollback"
            undo={`${activeVersion ?? '되돌린 버전'}의 내용으로 새 버전을 다시 만듭니다.`}
          />
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton variant="destructive">되돌리기</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ActivateDuePoliciesForm() {
  const [state, action] = useActionState(activateDuePolicies, IDLE);

  return (
    <div className="grid gap-2">
      <form action={action} className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="activation-code" className="text-xs">
            인증 앱 코드
          </FieldLabel>
          <Input
            id="activation-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </Field>
        <SubmitButton variant="outline" size="sm" className="min-h-11">
          예약된 버전 지금 발효
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

const ROLES: readonly { readonly value: string; readonly label: string }[] = [
  { value: 'operator', label: 'operator — 카탈로그와 콘텐츠' },
  { value: 'approver', label: 'approver — 사용자와 감사 기록 열람' },
  { value: 'server_operator', label: 'server_operator — 서버 운영' },
  { value: 'superadmin', label: 'superadmin — 전부. 넘기면 지금 보유자는 잃습니다' },
];

export function RoleDesignationForm({ operation }: { readonly operation: 'grant' | 'revoke' }) {
  const [state, action] = useActionState(operation === 'grant' ? grantRole : revokeRole, IDLE);
  const [role, setRole] = useState('operator');
  const choices = operation === 'grant' ? ROLES : ROLES.filter((entry) => entry.value !== 'superadmin');

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="role" value={role} />
      <Field>
        <FieldLabel htmlFor={`role-user-${operation}`}>대상 사용자 ID</FieldLabel>
        <Input
          id={`role-user-${operation}`}
          name="userId"
          placeholder="UUID"
          autoComplete="off"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`role-${operation}`}>역할</FieldLabel>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id={`role-${operation}`} className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {choices.map((entry) => (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <ReasonedStepUp
        id={`role-${operation}`}
        undo={
          operation === 'grant'
            ? '같은 화면에서 그 역할을 회수합니다. 최고관리자는 회수할 수 없고 다른 계정에 다시 넘겨야 합니다.'
            : '같은 화면에서 그 역할을 다시 부여합니다.'
        }
      />
      <SubmitButton
        variant={operation === 'revoke' ? 'destructive' : 'default'}
        className="w-fit"
      >
        {operation === 'grant' ? '역할 부여' : '역할 회수'}
      </SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
