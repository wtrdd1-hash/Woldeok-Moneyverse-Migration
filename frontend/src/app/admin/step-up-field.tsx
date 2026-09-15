import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/** High-risk admin action confirmation: fresh TOTP code plus an explicit undo note. */
export function StepUpField({ id, undo }: { readonly id: string; readonly undo: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={`${id}-code`}>2단계 인증 코드</FieldLabel>
      <Input
        id={`${id}-code`}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        required
        placeholder="123456"
      />
      <FieldDescription>실행 직전 인증 앱의 6자리 코드를 입력하세요. 되돌리기: {undo}</FieldDescription>
    </Field>
  );
}
