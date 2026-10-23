export interface P2PPayload {
  readonly recipientUserId: string;
  readonly amount: string;
  readonly message?: string;
  readonly sticker?: string;
}
export interface P2PAttempt {
  readonly key: string;
  readonly fingerprint: string;
  readonly payload: P2PPayload;
}
export function resolveP2PAttempt(
  previous: P2PAttempt | null,
  payload: P2PPayload,
  generateKey: () => string = () => crypto.randomUUID(),
): P2PAttempt {
  const fingerprint = JSON.stringify([payload.recipientUserId, payload.amount, payload.message ?? null, payload.sticker ?? null]);
  return previous?.fingerprint === fingerprint
    ? previous
    : { key: generateKey(), fingerprint, payload };
}
