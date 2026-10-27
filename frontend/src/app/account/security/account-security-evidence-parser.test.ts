import { describe, expect, it } from 'vitest';
import { parseSecuritySessions, parseLinkedIdentities, parseSecurityEvents } from './account-security-evidence';

const session = {
  sessionId: 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  createdAt: '2026-10-01T01:00:00.000Z', expiresAt: '2027-01-01T00:00:00.000Z',
  reauthenticatedAt: null, current: true, administratorSession: false,
  lastSeenAt: '2026-10-28T01:00:00.000Z', deviceLabel: 'Android phone',
};
const identity = { identityId: 'b9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  provider: 'local_email', displayName: 'Local member', linkedAt: '2026-10-01T01:00:00.000Z' };
const event = { type: 'local_login_succeeded', createdAt: '2026-10-28T01:00:00.000Z' };

describe('owner security evidence parser', () => {
  it('accepts complete API data and verified empty arrays', () => {
    expect(parseSecuritySessions({ sessions: [session] })?.[0]?.current).toBe(true);
    expect(parseLinkedIdentities({ identities: [identity] })?.[0]?.provider).toBe('local_email');
    expect(parseSecurityEvents({ events: [event] })?.[0]?.type).toBe('local_login_succeeded');
    expect(parseSecuritySessions({ sessions: [] })).toEqual([]);
    expect(parseLinkedIdentities({ identities: [] })).toEqual([]);
    expect(parseSecurityEvents({ events: [] })).toEqual([]);
  });
  it('rejects ambiguous, malformed or duplicate sessions', () => {
    expect(parseSecuritySessions({ sessions: [{ ...session, current: 'true' }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [{ ...session, sessionId: 'not-a-uuid' }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [session, session] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [{ ...session, current: false }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [{ ...session, createdAt: 'yesterday' }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [{ ...session, expiresAt: '2026-01-01T00:00:00.000Z' }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: [{ ...session, deviceLabel: '' }] })).toBeNull();
    expect(parseSecuritySessions({ sessions: Array(101).fill(session) })).toBeNull();
  });
  it('rejects unknown or duplicate login identities and invalid dates', () => {
    expect(parseLinkedIdentities({ identities: [{ ...identity, provider: 'superadmin' }] })).toBeNull();
    expect(parseLinkedIdentities({ identities: [identity, identity] })).toBeNull();
    expect(parseLinkedIdentities({ identities: [{ ...identity, linkedAt: 'bad-date' }] })).toBeNull();
    expect(parseLinkedIdentities({ identities: [{ provider: 'local_email' }] })).toBeNull();
    expect(parseLinkedIdentities({ identities: Array(11).fill(identity) })).toBeNull();
  });
  it('rejects malformed security events without displaying them as empty', () => {
    expect(parseSecurityEvents({ events: [{ ...event, createdAt: 'yesterday' }] })).toBeNull();
    expect(parseSecurityEvents({ events: [{ ...event, type: 'PASSWORD_RESET_SECRET=abc' }] })).toBeNull();
    expect(parseSecurityEvents({ events: Array(21).fill(event) })).toBeNull();
    expect(parseSecurityEvents(null)).toBeNull();
  });
  it('drops unneeded metadata rather than sending it to the security UI', () => {
    const parsed = parseSecuritySessions({ sessions: [{ ...session, sessionToken: 'private' }] });
    expect(parsed?.[0]).not.toHaveProperty('sessionToken');
    const events = parseSecurityEvents({ events: [{ ...event, metadata: { ip: 'private' } }] });
    expect(events?.[0]).not.toHaveProperty('metadata');
  });
});
