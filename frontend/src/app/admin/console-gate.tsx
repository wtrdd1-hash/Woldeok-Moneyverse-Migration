'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { FieldDescription } from '@/components/ui/field';
import { IDLE } from '@/lib/action-state';
import { closeConsole, openConsole } from './security-actions';

/**
 * The door into the operations console.
 *
 * Entry uses the authenticated administrator session, role checks, CSRF,
 * network policy, session rotation and audit. The retired TOTP/2FA flow is not
 * presented or callable from this console.
 */

export function OpenConsole({
  disabled = false,
  next = null,
}: {
  readonly disabled?: boolean;
  /** Where to go once the console is open: the page that sent the operator here. */
  readonly next?: string | null;
}) {
  const [state, action] = useActionState(openConsole, IDLE);

  return (
    <div className="grid gap-3">
      <form action={action}>
        {next && <input type="hidden" name="next" value={next} />}
        <SubmitButton disabled={disabled} className="min-h-11">
          관리자 페이지 열기 →
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
      <FieldDescription>
        콘솔 세션은 30분 뒤 또는 10분간 조작이 없으면 잠깁니다.
      </FieldDescription>
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
