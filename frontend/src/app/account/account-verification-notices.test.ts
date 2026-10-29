import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { accountLinkedNotice, accountReauthNotice } from './account-verification-notices';

const NOW = Date.parse('2026-10-29T11:00:00.000Z');
const identity = {
  identityId: 'b9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  provider: 'discord', displayName: 'Member', linkedAt: '2026-10-29T10:00:00.000Z',
};
const currentSession = {
  sessionId: 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  createdAt: '2026-10-28T11:00:00.000Z', expiresAt: '2026-10-30T11:00:00.000Z',
  reauthenticatedAt: '2026-10-29T10:55:00.000Z', current: true,
  administratorSession: false, lastSeenAt: '2026-10-29T10:55:00.000Z', deviceLabel: 'Web',
};

describe('account security callback notices', () => {
  it('ignores query parameters without a recognized outcome', () => {
    expect(accountLinkedNotice(undefined, { identities: [identity] })).toBeNull();
    expect(accountLinkedNotice('unknown', { identities: [identity] })).toBeNull();
    expect(accountReauthNotice(undefined, { sessions: [currentSession] }, NOW)).toBeNull();
    expect(accountReauthNotice('failed', { sessions: [currentSession] }, NOW)).toBeNull();
  });
  it('verifies linked provider from the authenticated backend readback', () => {
    expect(accountLinkedNotice('discord', { identities: [identity] })).toBe('confirmed');
    expect(accountLinkedNotice('google', { identities: [identity] })).toBe('unverified');
    expect(accountLinkedNotice('discord', { identities: [] })).toBe('unverified');
    expect(accountLinkedNotice('discord', null)).toBe('unverified');
    expect(accountLinkedNotice('discord', { identities: [{ ...identity, provider: 'evil' }] })).toBe('unverified');
    expect(accountLinkedNotice('discord', { identities: [{ ...identity, identityId: 'bad' }] })).toBe('unverified');
  });
  it('only confirms a fresh owner session reauthentication', () => {
    expect(accountReauthNotice('done', { sessions: [currentSession] }, NOW)).toBe('confirmed');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, reauthenticatedAt: null }] }, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, reauthenticatedAt: '2026-10-29T10:44:59.000Z' }] }, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, reauthenticatedAt: '2026-10-29T11:00:01.000Z' }] }, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, expiresAt: '2026-10-29T10:59:59.000Z' }] }, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, current: false }] }, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', null, NOW)).toBe('unverified');
    expect(accountReauthNotice('done', { sessions: [{ ...currentSession, sessionId: 'bad' }] }, NOW)).toBe('unverified');
  });
  it('wires the page to both authenticated readback endpoints and fails closed', () => {
    const page = readFileSync('src/app/account/page.tsx', 'utf8');
    expect(page).toContain("'/api/v1/account/security/sessions'");
    expect(page).toContain('accountLinkedNotice(');
    expect(page).toContain('accountReauthNotice(');
    expect(page).toContain('연결 상태를 확인할 수 없습니다');
    expect(page).toContain('본인 확인 상태를 확인할 수 없습니다');
  });
});
