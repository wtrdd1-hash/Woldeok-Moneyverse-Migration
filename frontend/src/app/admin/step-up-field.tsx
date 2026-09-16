import { Field, FieldDescription } from '@/components/ui/field';

/** Extra TOTP/2FA was retired. High-risk writes still require admin session, CSRF, role checks and audit. */
export function StepUpField({ undo }: { readonly id: string; readonly undo: string }) {
  return (
    <Field>
      <FieldDescription>변경 전 영향과 복구 방법을 확인하세요. 되돌리기: {undo}</FieldDescription>
    </Field>
  );
}
