'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { claimTodayEvent } from './actions';

/**
 * The one control 16.1's daily event has.
 *
 * It carries the day and nothing else. The event is not a field, because the
 * database draws it from the member and the Seoul date and would ignore one
 * anyway -- and a hidden input naming the event would invite the belief that
 * changing it changes the reward.
 *
 * `label` and `disabled` are required rather than optional. The card knows
 * why a claim is unavailable -- already taken, or no work behind the member
 * yet -- and a default hidden in here would be a second place for that
 * wording to live.
 */
export function ClaimEventButton({
  eventDate,
  label,
  disabled,
}: {
  readonly eventDate: string;
  readonly label: string;
  readonly disabled: boolean;
}) {
  const [state, action] = useActionState(claimTodayEvent, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="eventDate" value={eventDate} />
        <SubmitButton disabled={disabled}>{label}</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
