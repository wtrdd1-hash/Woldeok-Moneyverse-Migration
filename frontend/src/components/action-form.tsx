'use client';

import { useFormStatus } from 'react-dom';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import type { ActionState } from '@/lib/action-state';

/**
 * The two pieces every write in this application shares.
 *
 * Both exist so that a submitted form looks the same wherever it appears:
 * the control disables itself while the request is in flight, and the answer
 * arrives in the same place, in the same voice. Sixteen forms hand-rolling
 * that is sixteen chances for one of them to leave a button enabled and take
 * the member's money twice.
 */

export function SubmitButton({
  children,
  className,
  variant,
  size,
  disabled,
  name,
  value,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: React.ComponentProps<typeof Button>['variant'];
  readonly size?: React.ComponentProps<typeof Button>['size'];
  readonly disabled?: boolean;
  /** Submits a value of its own, for a form whose buttons differ by intent. */
  readonly name?: string;
  readonly value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      // A disabled control is what stops a double submission reaching the
      // API at all; the idempotency key is the second line, not the first.
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn('min-h-11', className)}
    >
      {pending && <Spinner />}
      {children}
    </Button>
  );
}

export function ActionAlert({ state }: { readonly state: ActionState }) {
  if (state.status === 'idle' || !state.message) return null;
  const failed = state.status === 'error';
  return (
    <Alert
      variant={failed ? 'destructive' : 'default'}
      // Announced rather than merely displayed: the member pressed a button
      // and the outcome must reach them without their having to hunt for it.
      role="status"
      aria-live="polite"
    >
      {failed ? <CircleAlert /> : <CircleCheck />}
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
