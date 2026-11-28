'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { FieldDescription } from '@/components/ui/field';
import { IDLE } from '@/lib/action-state';
import { closeConsole, openConsole } from './security-actions';
import { ADMIN_CHROME_COPY } from './admin-copy';
import { useAdminCopy } from './use-admin-copy';

/**
 * The door into the operations console.
 *
 * Entry uses the authenticated administrator session, role checks, CSRF,
 * network policy, session rotation and audit. The retired TOTP/2FA flow is not
 * presented or callable from this console.
 */

export function OpenConsole({
  disabled = false,
  next = null,
}: {
  readonly disabled?: boolean;
  /** Where to go once the console is open: the page that sent the operator here. */
  readonly next?: string | null;
}) {
  const [state, action] = useActionState(openConsole, IDLE);
  const { c } = useAdminCopy(ADMIN_CHROME_COPY);

  return (
    <div className="grid gap-3">
      <form action={action}>
        {next && <input type="hidden" name="next" value={next} />}
        <SubmitButton disabled={disabled} className="min-h-11">
          {c('gateOpen')}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
      <FieldDescription>
        {c('gateSessionNote')}
      </FieldDescription>
    </div>
  );
}

export function CloseConsole() {
  const [state, action] = useActionState(closeConsole, IDLE);
  const { c } = useAdminCopy(ADMIN_CHROME_COPY);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <SubmitButton variant="outline" size="sm" className="min-h-11">
          {c('gateClose')}
        </SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
