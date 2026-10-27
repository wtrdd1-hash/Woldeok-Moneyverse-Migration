/** Fail closed: a missing or malformed API response is not a policy version. */
export interface ConsentPolicyEvidence {
  readonly termsVersion: string;
  readonly privacyVersion: string;
}

// Versions are identifiers, not dates. The API accepts up to 64 characters;
// allow the existing dotted/dashed version identifiers, not markup or whitespace.
const VERSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function parseConsentPolicyEvidence(value: unknown): ConsentPolicyEvidence | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = value as Record<string, unknown>;
  if (
    typeof policy.termsVersion !== 'string' ||
    typeof policy.privacyVersion !== 'string' ||
    !VERSION_ID.test(policy.termsVersion) ||
    !VERSION_ID.test(policy.privacyVersion)
  ) {
    return null;
  }
  return { termsVersion: policy.termsVersion, privacyVersion: policy.privacyVersion };
}

/** UI affordance only. NestJS/PostgreSQL still enforce the write authorization. */
export function canPublishConsentPolicy(
  roles: readonly string[],
  policy: ConsentPolicyEvidence | null,
): boolean {
  return policy !== null && roles.includes('superadmin');
}
