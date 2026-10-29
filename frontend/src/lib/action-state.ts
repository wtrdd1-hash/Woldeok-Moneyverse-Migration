/**
 * What a form gets back from a server action.
 *
 * In its own module, free of `server-only`, because both halves need it: the
 * action that produces it and the client component that renders it. The three
 * states are the ones a member can actually distinguish — nothing has
 * happened yet, it worked, or it was refused and here is why.
 */
export interface ActionState {
  readonly status: 'idle' | 'ok' | 'error';
  readonly message?: string;
  /** Machine-readable reason for actionable recovery; never infer this from translated copy. */
  readonly errorCode?: 'reauthentication_required' | 'transfer_verification_pending';
  /** The exact transfer command held after an outcome that could have committed. */
  readonly transferAttempt?: {
    readonly recipientUserId: string;
    readonly amount: string;
    readonly idempotencyKey: string;
  };
  /** Optional semantic tone for a successfully processed outcome. */
  readonly tone?: 'success' | 'neutral' | 'negative';
}

export const IDLE: ActionState = { status: 'idle' };
