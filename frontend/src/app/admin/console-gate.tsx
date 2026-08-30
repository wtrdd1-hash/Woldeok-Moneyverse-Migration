'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { IDLE } from '@/lib/action-state';
import {
  beginSecondFactorEnrolment,
  closeConsole,
  confirmSecondFactorEnrolment,
  openConsole,
} from './security-actions';

/**
 * The door into the operations console.
 *
 * Three states, and each of them is a different sentence rather than one
 * generic refusal: no second factor is enrolled yet, one is enrolled and a
 * code is needed, or the console is open and can be closed early.
 *
 * The step-up before this — proving control of the OAuth identity — is the
 * member-side flow that already exists at /account, so this screen links
 * there rather than growing a second copy of it.
 */

export function EnrolSecondFactor() {
  const [beginState, begin] = useActionState(beginSecondFactorEnrolment, IDLE);
  const [confirmState, confirm] = useActionState(confirmSecondFactorEnrolment, IDLE);

  return (
    <div className="grid gap-4">
      <form action={begin}>
        <SubmitButton className="min-h-11 w-fit">인증 앱 등록 시작</SubmitButton>
      </form>
      <ActionAlert state={beginState} />

      <form action={confirm} className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="enrol-code">인증 앱 코드</FieldLabel>
          <Input
            id="enrol-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
          <FieldDescription>
            위에서 받은 키를 인증 앱에 넣고, 앱에 표시된 6자리를 입력하면 등록이 끝납니다.
          </FieldDescription>
        </Field>
        <SubmitButton className="w-fit">등록 마치기 →</SubmitButton>
      </form>
      <ActionAlert state={confirmState} />
    </div>
  );
}

export function OpenConsole() {
  const [state, action] = useActionState(openConsole, IDLE);

  return (
    <div className="grid gap-3">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="console-code">인증 앱 코드</FieldLabel>
          <Input
            id="console-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
          <FieldDescription>
            콘솔 세션은 30분 뒤, 또는 10분간 조작이 없으면 잠깁니다.
          </FieldDescription>
        </Field>
        <SubmitButton className="min-h-11">콘솔 열기 →</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function CloseConsole() {
  const [state, action] = useActionState(closeConsole, IDLE);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <SubmitButton variant="outline" size="sm" className="min-h-11">
          콘솔 닫기
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
