import { describe, expect, it } from 'vitest';
import { parseLoginProviderEvidence } from './login-provider-evidence';

describe('deployment sign-in provider evidence', () => {
  it('preserves explicitly enabled and disabled providers from the Nest contract', () => {
    expect(parseLoginProviderEvidence({ providers: [
      { id: 'local_email', enabled: true },
      { id: 'discord', enabled: false },
      { id: 'google', enabled: true },
    ] })).toEqual({ status: 'verified', localEnabled: true, oauthEnabled: ['google'] });
  });

  it('distinguishes a verified disabled deployment from an outage', () => {
    expect(parseLoginProviderEvidence({ providers: [
      { id: 'local_email', enabled: false },
      { id: 'discord', enabled: false },
      { id: 'google', enabled: false },
    ] })).toEqual({ status: 'verified', localEnabled: false, oauthEnabled: [] });
    expect(parseLoginProviderEvidence(null)).toEqual({ status: 'unavailable' });
  });

  it.each([
    undefined, null, {}, { providers: 'offline' }, { providers: [] },
    { providers: [{ id: 'local_email', enabled: true }] },
    { providers: [
      { id: 'local_email', enabled: true }, { id: 'discord', enabled: true }, { id: 'discord', enabled: false },
    ] },
    { providers: [
      { id: 'local_email', enabled: true }, { id: 'discord', enabled: 'true' }, { id: 'google', enabled: true },
    ] },
    { providers: [
      { id: 'local_email', enabled: true }, { id: 'discord', enabled: false }, { id: 'facebook', enabled: true },
    ] },
    { providers: [
      { id: 'local_email', enabled: true }, { id: 'discord', enabled: false }, null,
    ] },
  ])('fails closed on malformed or partial upstream evidence %#', (payload) => {
    expect(parseLoginProviderEvidence(payload)).toEqual({ status: 'unavailable' });
  });
});
