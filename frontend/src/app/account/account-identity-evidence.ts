export interface AccountIdentity {
  readonly identityId: string;
  readonly provider: 'discord' | 'google' | 'local_email';
  readonly displayName: string;
  readonly linkedAt: string;
}

export type AccountIdentityEvidence =
  | { readonly status: 'ready'; readonly identities: readonly AccountIdentity[] }
  | { readonly status: 'unavailable'; readonly identities: readonly [] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function parseAccountIdentityEvidence(value: unknown): AccountIdentityEvidence {
  const unavailable: AccountIdentityEvidence = { status: 'unavailable', identities: [] };
  if (!value || typeof value !== 'object' || !('identities' in value) || !Array.isArray(value.identities)) return unavailable;

  const ids = new Set<string>();
  const identities: AccountIdentity[] = [];
  for (const entry of value.identities as unknown[]) {
    if (!entry || typeof entry !== 'object') return unavailable;
    const item = entry as Record<string, unknown>;
    if (typeof item.identityId !== 'string' || !UUID.test(item.identityId) || ids.has(item.identityId.toLowerCase())) return unavailable;
    if (item.provider !== 'discord' && item.provider !== 'google' && item.provider !== 'local_email') return unavailable;
    if (typeof item.displayName !== 'string' || !item.displayName.trim()) return unavailable;
    if (typeof item.linkedAt !== 'string' || !ISO_DATE.test(item.linkedAt) || !Number.isFinite(Date.parse(item.linkedAt))) return unavailable;
    ids.add(item.identityId.toLowerCase());
    identities.push({ identityId: item.identityId, provider: item.provider, displayName: item.displayName, linkedAt: item.linkedAt });
  }
  return { status: 'ready', identities };
}

/** A callback hint only identifies a provider already present in an authenticated read. */
export function confirmedOAuthCallback(provider: string | undefined, evidence: AccountIdentityEvidence): boolean {
  return evidence.status === 'ready' &&
    (provider === 'discord' || provider === 'google') &&
    evidence.identities.some((identity) => identity.provider === provider);
}
