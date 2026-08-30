'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IDLE } from '@/lib/action-state';
import { orderFromNpc, recordProgress, setNotifications } from './actions';

/**
 * The engagement loop's write surface.
 *
 * Every control is a `<form action={serverAction}>`, so it works before
 * hydration and carries no CSRF token into the browser -- the action fetches
 * one on the server and spends it in the same call. `SubmitButton` disables
 * itself while a request is in flight, which is what stops a second step of
 * progress being recorded by a double click; the idempotency key the action
 * mints per submission is the second line of defence, not the first.
 */

/**
 * One step of progress, recorded by the member.
 *
 * One button and no number field. The API accepts an amount and defaults it
 * to one, and a press of this button means exactly one thing done -- a member
 * who could type 1,000 into it would be finishing goals rather than playing.
 */
export function RecordProgressButton({ code }: { readonly code: string }) {
  const [state, action] = useActionState(recordProgress, IDLE);
  return (
    <div className="grid w-full gap-2">
      <form action={action}>
        <input type="hidden" name="code" value={code} />
        <SubmitButton>진행 1회 기록</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

export function NpcOrderButton({ code }: { readonly code: string }) {
  const [state, action] = useActionState(orderFromNpc, IDLE);
  return (
    <div className="grid w-full gap-2">
      <form action={action}>
        <input type="hidden" name="npcCode" value={code} />
        <SubmitButton>주문 받기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * Whether the member hears about their goals.
 *
 * `enabled` is null when the board could not be read, and the page says so
 * beside this form. The box then shows the preference a member has by default
 * -- `member_engagement_dashboard` coalesces a missing row to true -- rather
 * than an unchecked box, which would look like a setting they had chosen.
 *
 * The checkbox is not the field. Radix renders a button rather than a native
 * input, and an unchecked box submits nothing at all; a hidden field carrying
 * 'true' or 'false' is what makes "switch this off" arrive as a decision
 * instead of as an absence the action would have to guess about.
 */
export function NotificationForm({ enabled }: { readonly enabled: boolean | null }) {
  const [state, action] = useActionState(setNotifications, IDLE);
  const [notify, setNotify] = useState(enabled ?? true);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="notificationsEnabled" value={notify ? 'true' : 'false'} />

      <div className="flex items-start gap-3">
        <Checkbox
          id="engagement-notifications"
          checked={notify}
          onCheckedChange={(value) => setNotify(value === true)}
          className="mt-1 size-5"
        />
        <Label htmlFor="engagement-notifications" className="text-sm font-normal">
          퀘스트와 NPC 주문 알림을 받을게요.
        </Label>
      </div>

      <SubmitButton className="w-fit">알림 설정 저장</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
