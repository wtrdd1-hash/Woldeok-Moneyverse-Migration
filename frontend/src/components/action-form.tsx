'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CircleAlert, CircleCheck, CircleMinus, Info, X } from 'lucide-react';
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

/** How long an outcome stays on screen before it takes itself away. */
const DISMISS_AFTER_MS = 5000;

export function ActionAlert({ state }: { readonly state: ActionState }) {
  // Keyed on the state object rather than its text: `useActionState` hands
  // back a new object per submission, so submitting twice and getting the
  // same answer twice shows it twice, which is what tells the member the
  // second attempt was heard.
  const [dismissed, setDismissed] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    setDismissed(false);
    if (state.status === 'idle' || !state.message) return;

    // Re-checked on a tick rather than one timeout, so hovering or focusing
    // the alert holds it: five seconds is not long for a sentence explaining
    // what went wrong, and reading it should not be a race.
    const started = Date.now();
    let elapsed = 0;
    let last = started;
    const timer = setInterval(() => {
      const now = Date.now();
      if (!paused.current) elapsed += now - last;
      last = now;
      if (elapsed >= DISMISS_AFTER_MS) {
        clearInterval(timer);
        setDismissed(true);
      }
    }, 250);
    return () => clearInterval(timer);
  }, [state]);

  if (state.status === 'idle' || !state.message || dismissed) return null;
  const failed = state.status === 'error';
  const negative = state.status === 'ok' && state.tone === 'negative';
  const neutral = state.status === 'ok' && state.tone === 'neutral';

  return (
    <Alert
      variant={failed ? 'destructive' : 'default'}
      // Announced rather than merely displayed: the member pressed a button
      // and the outcome must reach them without their having to hunt for it.
      role="status"
      aria-live="polite"
      className={cn(
        'pr-12',
        negative && 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
        neutral && 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      )}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={() => {
        paused.current = false;
      }}
    >
      {failed ? (
        <CircleAlert />
      ) : negative ? (
        <CircleMinus />
      ) : neutral ? (
        <Info />
      ) : (
        <CircleCheck />
      )}
      <AlertDescription>{state.message}</AlertDescription>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="알림 닫기"
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-md text-current opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <X className="size-4" />
      </button>
    </Alert>
  );
}
