export interface AccountIdentity {
  readonly identityId: string;
  readonly provider: string;
  readonly displayName: string;
  readonly linkedAt: string;
}

export type AccountIdentityEvidence =
  | {
      readonly status: 'unavailable';
      readonly identities: readonly AccountIdentity[];
      readonly methodCount: null;
      readonly providerCount: null;
    }
  | {
      readonly status: 'empty' | 'available';
      readonly identities: readonly AccountIdentity[];
      readonly methodCount: number;
      readonly providerCount: number;
    };

const unavailable: AccountIdentityEvidence = {
  status: 'unavailable',
  identities: [],
  methodCount: null,
  providerCount: null,
};

function isAccountIdentity(value: unknown): value is AccountIdentity {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.identityId === 'string' && record.identityId.trim().length > 0 &&
    typeof record.provider === 'string' && record.provider.trim().length > 0 &&
    typeof record.displayName === 'string' &&
    typeof record.linkedAt === 'string' && Number.isFinite(Date.parse(record.linkedAt))
  );
}

export function resolveIdentityEvidence(response: unknown): AccountIdentityEvidence {
  if (typeof response !== 'object' || response === null || !('identities' in response)) {
    return unavailable;
  }
  const identities = response.identities;
  if (!Array.isArray(identities) || !identities.every(isAccountIdentity)) {
    return unavailable;
  }
  return {
    status: identities.length > 0 ? 'available' : 'empty',
    identities,
    methodCount: identities.length,
    providerCount: new Set(identities.map((identity: AccountIdentity) => identity.provider)).size,
  };
}
