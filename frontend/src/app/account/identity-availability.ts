/** An unavailable identities response is unknown, not an empty list. */
export function getIdentitySecuritySummary(
  identities: readonly { readonly provider: string }[] | null,
): {
  readonly count: number | null;
  readonly score: number | null;
  readonly hasLocalIdentity: boolean | null;
  readonly hasSocialIdentity: boolean | null;
} {
  if (identities === null) {
    return { count: null, score: null, hasLocalIdentity: null, hasSocialIdentity: null };
  }
  const hasLocalIdentity = identities.some((identity) => identity.provider === 'local_email');
  const hasSocialIdentity = identities.some((identity) => identity.provider !== 'local_email');
  return {
    count: identities.length,
    score: Math.min(100, (hasSocialIdentity ? 35 : 20) + (identities.length >= 2 ? 35 : 20) + 30),
    hasLocalIdentity,
    hasSocialIdentity,
  };
}
