import { parseLinkedIdentities, parseSecuritySessions } from './security/account-security-evidence';

/** These are owner-scoped read-model counts, not a security rating or MFA attestation. */
export interface AccountSecuritySummary {
  readonly linkedMethods: number | null;
  readonly activeSessions: number | null;
}

export function accountSecuritySummary(identityResponse: unknown, sessionResponse: unknown): AccountSecuritySummary {
  const identities = parseLinkedIdentities(identityResponse);
  const sessions = parseSecuritySessions(sessionResponse);
  return {
    linkedMethods: identities?.length ?? null,
    // An authenticated caller should have one current session. An empty read is not evidence of zero devices.
    activeSessions: sessions && sessions.length > 0 ? sessions.length : null,
  };
}
