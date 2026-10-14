/** Only OAuth providers support the account-link flow. Local email is sign-in only. */
export function isLinkableOAuthProvider(provider: { readonly id: string; readonly enabled: boolean }): boolean {
  return provider.enabled === true && (provider.id === 'discord' || provider.id === 'google');
}

/** Keep first-party email credential removal out of the OAuth unlink UI. */
export function canUnlinkOAuthIdentity(provider: string, linkedIdentityCount: number): boolean {
  return linkedIdentityCount > 1 && (provider === 'discord' || provider === 'google');
}
