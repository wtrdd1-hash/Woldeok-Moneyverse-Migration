'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { LOCK_CHOICES } from './coin';
import { playCoin, setSelfLimit } from './actions';

/**
 * The coin game's write surface.
 *
 * Both controls are a `<form action={serverAction}>`, so they work before
 * hydration and carry no CSRF token into the browser — the action fetches one
 * on the server and spends it in the same call. `SubmitButton` disables
 * itself while a request is in flight, which is what stops a second stake
 * being placed by a double click; the idempotency key is the second line of
 * defence, not the first.
 */

export function CoinPlayForm({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  /** True when today's headroom is spent, so the two buttons refuse locally. */
  readonly exhausted: boolean;
}) {
  const [state, action] = useActionState(playCoin, IDLE);

  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="casino-stake">걸 WLD</FieldLabel>
        <AmountInput
          id="casino-stake"
          name="stake"
          defaultValue={minStake}
          placeholder="0"
          required
        />
        <FieldDescription>
          한 판에 {groupDigits(minStake)} ~ {groupDigits(maxStake)} WLD를 걸 수 있어요. 오늘 남은
          베팅 한도는 {groupDigits(remainingStake)} WLD예요.
        </FieldDescription>
      </Field>

      {/* One form, two intents. The face is exactly what the two controls
          differ by and the API takes it as one field, so the button carries
          it rather than a duplicated form doing so. */}
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="choice" value="heads" disabled={exhausted}>
          앞면에 걸기
        </SubmitButton>
        <SubmitButton name="choice" value="tails" variant="outline" disabled={exhausted}>
          뒷면에 걸기
        </SubmitButton>
      </div>

      {exhausted && (
        <p className="text-sm text-muted-foreground">
          오늘 걸 수 있는 한도를 모두 사용했어요. 내일 다시 열려요.
        </p>
      )}

      <ActionAlert state={state} />
    </form>
  );
}

export function SelfLimitForm() {
  const [state, action] = useActionState(setSelfLimit, IDLE);
  const [lock, setLock] = useState<string>('none');

  return (
    <form action={action} className="grid gap-4">
      {/* Radix Select is not a native control, so the chosen value travels in
          a hidden field the way a <select name> would. */}
      <input type="hidden" name="lock" value={lock} />

      <FieldGroup className="gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="casino-bet-limit">하루 베팅 한도</FieldLabel>
          <AmountInput id="casino-bet-limit" name="dailyBetLimit" placeholder="0" required />
          <FieldDescription>하루에 걸 수 있는 WLD의 합계입니다.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="casino-loss-limit">하루 손실 한도</FieldLabel>
          <AmountInput id="casino-loss-limit" name="dailyLossLimit" placeholder="0" required />
          <FieldDescription>하루에 잃을 수 있는 WLD의 합계입니다.</FieldDescription>
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="casino-lock">한도 잠금</FieldLabel>
        <Select value={lock} onValueChange={setLock}>
          <SelectTrigger id="casino-lock" className="min-h-11 w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCK_CHOICES.map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          잠가 두면 그 기간이 끝날 때까지 한도를 다시 바꿀 수 없어요. 스스로 쉬어 가기 위한
          장치입니다.
        </FieldDescription>
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">0으로 두면 그 항목은 오늘 이용하지 않겠다는 뜻이에요.</p>
        <SubmitButton>한도 저장</SubmitButton>
      </div>

      <ActionAlert state={state} />
    </form>
  );
}
