/** The deployment's provider configuration is authoritative only as a complete Nest response. */
export type LoginProviderEvidence =
  | { readonly status: 'unavailable' }
  | { readonly status: 'verified'; readonly localEnabled: boolean; readonly oauthEnabled: readonly ('google' | 'discord')[] };

const REQUIRED_PROVIDERS = ['local_email', 'discord', 'google'] as const;
type ProviderId = (typeof REQUIRED_PROVIDERS)[number];

export function parseLoginProviderEvidence(value: unknown): LoginProviderEvidence {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 'unavailable' };
  const providers = (value as Record<string, unknown>).providers;
  if (!Array.isArray(providers) || providers.length !== REQUIRED_PROVIDERS.length) return { status: 'unavailable' };

  const enabled = new Map<ProviderId, boolean>();
  for (const provider of providers) {
    if (!provider || typeof provider !== 'object' || Array.isArray(provider)) return { status: 'unavailable' };
    const record = provider as Record<string, unknown>;
    if (!REQUIRED_PROVIDERS.some((id) => id === record.id) || typeof record.enabled !== 'boolean') {
      return { status: 'unavailable' };
    }
    const id = record.id as ProviderId;
    if (enabled.has(id)) return { status: 'unavailable' };
    enabled.set(id, record.enabled);
  }
  if (enabled.size !== REQUIRED_PROVIDERS.length) return { status: 'unavailable' };
  return {
    status: 'verified',
    localEnabled: enabled.get('local_email') === true,
    oauthEnabled: (['google', 'discord'] as const).filter((id) => enabled.get(id) === true),
  };
}
