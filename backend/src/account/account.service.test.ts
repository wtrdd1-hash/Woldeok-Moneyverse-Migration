import { describe, expect, it } from 'vitest';
import { AccountService } from './account.service';
import { requireIdentityProvider } from './account.repository';
import type { AccountRepository, LinkedIdentityRow } from './account.repository';

const actor = '00000000-0000-4000-8000-000000000099';
const identityId = '00000000-0000-4000-8000-000000000001';
const linkedAt = new Date('2026-10-11T10:00:00.000Z');

function fakeRepository(rows: readonly LinkedIdentityRow[]): AccountRepository {
  return {
    linkedIdentities: async () => rows,
    linkVerifiedIdentity: async () => { throw new Error('not used'); },
    unlinkIdentity: async () => { throw new Error('not used'); },
    softDelete: async () => { throw new Error('not used'); },
  };
}

describe('linked identity read contract', () => {
  it('reads local_email as a first-party sign-in method', async () => {
    const service = new AccountService(fakeRepository([{
      identity_id: identityId, provider: 'local_email', display_name: 'Local member', linked_at: linkedAt,
    }]));
    await expect(service.linkedIdentities(actor)).resolves.toEqual([{
      identityId, provider: 'local_email', displayName: 'Local member', linkedAt: linkedAt.toISOString(),
    }]);
    expect(() => requireIdentityProvider('local_email')).toThrow();
  });

  it('preserves valid OAuth read behavior', async () => {
    const service = new AccountService(fakeRepository([{
      identity_id: identityId, provider: 'discord', display_name: 'Discord member', linked_at: linkedAt,
    }]));
    expect((await service.linkedIdentities(actor))[0]?.provider).toBe('discord');
  });

  it('fails closed on unknown provider rows', async () => {
    const service = new AccountService(fakeRepository([{
      identity_id: identityId, provider: 'unknown_provider', display_name: 'Unknown', linked_at: linkedAt,
    }]));
    await expect(service.linkedIdentities(actor)).rejects.toThrow();
  });

  it('never permits local_email in OAuth link input', () => {
    expect(requireIdentityProvider('discord')).toBe('discord');
    expect(requireIdentityProvider('google')).toBe('google');
    expect(() => requireIdentityProvider('local_email')).toThrow();
  });
});

describe('unlink receipt and owner readback contract', () => {
  it('returns the database identity ID and exposes the remaining owner sign-in methods', async () => {
    const remainingId = '00000000-0000-4000-8000-000000000002';
    let identities: LinkedIdentityRow[] = [
      { identity_id: identityId, provider: 'google', display_name: 'Google member', linked_at: linkedAt },
      { identity_id: remainingId, provider: 'local_email', display_name: 'Local member', linked_at: linkedAt },
    ];
    const service = new AccountService({
      ...fakeRepository([]),
      linkedIdentities: async () => identities,
      unlinkIdentity: async ({ actorUserId, identityId: requestedId }) => {
        expect(actorUserId).toBe(actor);
        expect(requestedId).toBe(identityId);
        identities = identities.filter((entry) => entry.identity_id !== requestedId);
        return { identity_id: identityId };
      },
    });
    await expect(service.unlinkIdentity(actor, { identityId })).resolves.toEqual({ identityId });
    await expect(service.linkedIdentities(actor)).resolves.toEqual([{
      identityId: remainingId, provider: 'local_email',
      displayName: 'Local member', linkedAt: linkedAt.toISOString(),
    }]);
  });
});
