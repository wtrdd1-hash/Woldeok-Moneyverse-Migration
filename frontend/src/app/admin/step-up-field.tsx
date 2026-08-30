'use client';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/**
 * The code an operator types immediately before a high-risk change, and the
 * sentence saying how to undo what they are about to do.
 *
 * One component, used by every high-risk dialog in the console, because §14.9
 * asks for both on all of them and a dialog that forgot one would look
 * exactly like a dialog that did not need one. Two-person approval used to be
 * what caught a change nobody had thought through; this is what replaced it,
 * so it cannot be optional.
 *
 * The API gives a spent code two minutes (`SecondFactorGuard`), which is why
 * it is asked for here rather than on a separate screen: a step-up that
 * outlives the dialog it was asked on authorises whatever comes next instead
 * of this.
 */
export function StepUpField({
  id,
  undo,
}: {
  readonly id: string;
  /** How to reverse this change, in words the operator can act on. */
  readonly undo: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`step-up-${id}`}>인증 앱 코드</FieldLabel>
      <Input
        id={`step-up-${id}`}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
      />
      <FieldDescription>되돌리는 방법: {undo}</FieldDescription>
    </Field>
  );
}
