import { describe, expect, it } from 'vitest';
import { canUnlinkOAuthIdentity, isLinkableOAuthProvider } from './identity-provider';

describe('account OAuth link choices', () => {
  it('offers enabled Discord and Google identities', () => {
    expect(isLinkableOAuthProvider({ id: 'discord', enabled: true })).toBe(true);
    expect(isLinkableOAuthProvider({ id: 'google', enabled: true })).toBe(true);
  });

  it('never presents local email, unknown or disabled providers as OAuth links', () => {
    expect(isLinkableOAuthProvider({ id: 'local_email', enabled: true })).toBe(false);
    expect(isLinkableOAuthProvider({ id: 'unknown', enabled: true })).toBe(false);
    expect(isLinkableOAuthProvider({ id: 'google', enabled: false })).toBe(false);
  });
});

describe('account OAuth unlink choices', () => {
  it('does not show unlink for local email or the last sign-in method', () => {
    expect(canUnlinkOAuthIdentity('local_email', 2)).toBe(false);
    expect(canUnlinkOAuthIdentity('discord', 1)).toBe(false);
    expect(canUnlinkOAuthIdentity('google', 2)).toBe(true);
    expect(canUnlinkOAuthIdentity('unknown', 3)).toBe(false);
  });
});
