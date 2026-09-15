import { Field, FieldDescription } from '@/components/ui/field';

/**
 * High-risk admin actions keep their explicit undo/recovery guidance, but the
 * retired authenticator-code step no longer appears in the UI. Authorization,
 * the admin session, CSRF, reason capture and server-side audit remain active.
 */
export function StepUpField({ undo }: { readonly id: string; readonly undo: string }) {
  return (
    <Field>
      <FieldDescription>되돌리기: {undo}</FieldDescription>
    </Field>
  );
}
