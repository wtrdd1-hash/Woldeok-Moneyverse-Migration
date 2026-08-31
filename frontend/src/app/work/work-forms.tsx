'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { claimReward, submitTask, takeTask } from './actions';

/**
 * The three buttons of the loop, each its own form.
 *
 * One form per action rather than one form with three buttons: each carries a
 * different id, each gets its own outcome, and `SubmitButton` disables only
 * the control that was pressed. A member with two tasks open must be able to
 * submit one while the other is still waiting out its minimum duration.
 */

export function TakeButton({
  taskId,
  disabled,
  label,
}: {
  readonly taskId: string;
  readonly disabled?: boolean;
  readonly label?: string;
}) {
  const [state, action] = useActionState(takeTask, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="taskId" value={taskId} />
        <SubmitButton disabled={disabled}>{label ?? '이 작업 맡기'}</SubmitButton>
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
  readonly disabled?: boolean;
  readonly label?: string;
}) {
  const [state, action] = useActionState(submitTask, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <SubmitButton variant="outline" disabled={disabled}>
          {label ?? '작업 제출하기'}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function ClaimButton({ assignmentId }: { readonly assignmentId: string }) {
  const [state, action] = useActionState(claimReward, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <SubmitButton>보상 받기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
