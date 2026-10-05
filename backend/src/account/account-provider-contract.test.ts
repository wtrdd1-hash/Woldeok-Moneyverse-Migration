import { describe, expect, it } from 'vitest';
import {
  requireIdentityProvider,
  requireLinkedIdentityProvider,
} from './account.repository';

describe('account identity provider contract', () => {
  it('accepts local_email in the linked identity read model', () => {
    expect(requireLinkedIdentityProvider('local_email')).toBe('local_email');
    expect(requireLinkedIdentityProvider('google')).toBe('google');
    expect(requireLinkedIdentityProvider('discord')).toBe('discord');
  });

  it('keeps OAuth linking restricted to google and discord', () => {
    expect(() => requireIdentityProvider('local_email')).toThrow(
      'OAuth provider must be discord or google',
    );
  });

  it('rejects unknown providers from the linked identity read model', () => {
    expect(() => requireLinkedIdentityProvider('unknown')).toThrow(
      'sign-in provider must be discord, google or local_email',
    );
  });
});
