'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IDLE } from '@/lib/action-state';
import { enterEvent } from './actions';

export function EnterButton({ eventId }: { readonly eventId: string }) {
  const [state, action] = useActionState(enterEvent, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="eventId" value={eventId} />
        <InputGroup className="w-28">
          <InputGroupInput
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={1}
            aria-label="참가 횟수"
          />
          <InputGroupAddon align="inline-end">회</InputGroupAddon>
        </InputGroup>
        <SubmitButton>참가하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
