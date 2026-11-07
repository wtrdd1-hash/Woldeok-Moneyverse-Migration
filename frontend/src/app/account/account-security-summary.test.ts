import { describe, expect, it } from 'vitest';
import { accountSecuritySummary } from './account-security-summary';

const ID = '7d3bbfa5-4e7d-44d5-93b4-f28f07a93a45';
const NOW = '2026-11-03T00:00:00.000Z';
const identities = { identities: [{ identityId: ID, provider: 'google', displayName: 'Example', linkedAt: NOW }] };
const sessions = { sessions: [{ sessionId: ID, createdAt: NOW, expiresAt: '2026-12-03T00:00:00.000Z', reauthenticatedAt: null, current: true, administratorSession: false, lastSeenAt: NOW, deviceLabel: 'Browser' }] };

describe('evidence-bound account security overview', () => {
  it('reports only verified owner identity and active-session counts, never a grade', () => {
    expect(accountSecuritySummary(identities, sessions)).toEqual({ linkedMethods: 1, activeSessions: 1 });
  });
  it('does not treat missing, malformed or contradictory owner responses as zero', () => {
    expect(accountSecuritySummary(null, sessions)).toEqual({ linkedMethods: null, activeSessions: 1 });
    expect(accountSecuritySummary(identities, null)).toEqual({ linkedMethods: 1, activeSessions: null });
    expect(accountSecuritySummary({ identities: [{ ...identities.identities[0], provider: 'unknown' }] }, sessions).linkedMethods).toBeNull();
    expect(accountSecuritySummary(identities, { sessions: [] }).activeSessions).toBeNull();
    expect(accountSecuritySummary(identities, { sessions: [sessions.sessions[0], sessions.sessions[0]] }).activeSessions).toBeNull();
  });
  it('keeps verified empty identities distinct from unavailable and never claims protection', () => {
    expect(accountSecuritySummary({ identities: [] }, sessions)).toEqual({ linkedMethods: 0, activeSessions: 1 });
  });
});
