import { describe, expect, it } from 'vitest';
import { parseAuditSearchResponse, resolveAuditIdentity } from './audit-search-evidence';

const A = 'c091eab0-a4bc-4f2a-b8a8-16b5d2e5a099';
const B = '8c4b26a8-b27a-4cb2-8c9d-1669f3c4a003';
const directory = (users: unknown[], hasMore = false) => ({ users, scope: { kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore } });
const row = (sequence: string) => ({
  sequence, audit_id: sequence.endsWith('3') ? A : B, created_at: '2026-10-27T12:00:00.000Z', hash_version: 2,
  actor_user_id: A, action: 'users.restrict', feature: 'users', target_kind: 'user', target_id: B,
  subject_user_id: B, transaction_id: null, request_id: null, trace_id: null,
  session_hash: null, client_ip: null, outcome: 'success', response_status: 200,
  metadata: {}, context: {}, previous_integrity_hash: null, integrity_hash: 'a'.repeat(64),
});

describe('admin audit identity evidence', () => {
  it('allows exact UUID without a directory and normalizes case', () => {
    expect(resolveAuditIdentity(A.toUpperCase(), null)).toEqual({ status: 'resolved', userId: A });
  });
  it('does not claim a member is missing when the API fails', () => {
    expect(resolveAuditIdentity('Alice', null)).toEqual({ status: 'unavailable' });
  });
  it('does not resolve a nickname from a truncated wealth-ordered directory', () => {
    expect(resolveAuditIdentity('Alice', directory([{ user_id: A, display_name: 'Alice' }], true))).toEqual({ status: 'unavailable' });
  });
  it('resolves a unique exact nickname only from a complete verified directory', () => {
    expect(resolveAuditIdentity(' ALICE ', directory([{ user_id: A, display_name: 'Alice' }]))).toEqual({ status: 'resolved', userId: A });
  });
  it('rejects partial nicknames rather than selecting an unrelated member', () => {
    expect(resolveAuditIdentity('Ali', directory([{ user_id: A, display_name: 'Alice' }]))).toEqual({ status: 'not_found' });
  });
  it('rejects ambiguous case-insensitive exact nicknames', () => {
    expect(resolveAuditIdentity('alice', directory([{ user_id: A, display_name: 'Alice' }, { user_id: B, display_name: 'ALICE' }]))).toEqual({ status: 'ambiguous' });
  });
  it('rejects malformed and duplicated directory identities', () => {
    expect(resolveAuditIdentity('Alice', directory([{ user_id: 'bad', display_name: 'Alice' }]))).toEqual({ status: 'unavailable' });
    expect(resolveAuditIdentity('Alice', directory([{ user_id: A, display_name: 'Alice' }, { user_id: A, display_name: 'Alice' }]))).toEqual({ status: 'unavailable' });
  });
  it('does not trust a directory with missing provenance or overlong input', () => {
    expect(resolveAuditIdentity('Alice', { users: [{ user_id: A, display_name: 'Alice' }] })).toEqual({ status: 'unavailable' });
    expect(resolveAuditIdentity('A'.repeat(81), directory([]))).toEqual({ status: 'invalid' });
  });
});

describe('admin audit PostgreSQL response evidence', () => {
  it('accepts a verified bounded descending page and exact server cursor', () => {
    const result = parseAuditSearchResponse({ events: [row('9007199254740993'), row('9007199254740992')], nextCursor: '9007199254740992' }, 30);
    expect(result?.events).toHaveLength(2);
    expect(result?.nextCursor).toBe('9007199254740992');
  });
  it('distinguishes a verified empty page from failed or malformed responses', () => {
    expect(parseAuditSearchResponse({ events: [], nextCursor: null }, 30)).toEqual({ events: [], nextCursor: null });
    expect(parseAuditSearchResponse(null, 30)).toBeNull();
    expect(parseAuditSearchResponse({ events: [], nextCursor: '123' }, 30)).toBeNull();
  });
  it('rejects fabricated cursors, repeated or ascending sequence and duplicates', () => {
    expect(parseAuditSearchResponse({ events: [row('5')], nextCursor: '6' }, 30)).toBeNull();
    expect(parseAuditSearchResponse({ events: [row('5'), row('6')], nextCursor: '6' }, 30)).toBeNull();
    expect(parseAuditSearchResponse({ events: [row('5'), row('5')], nextCursor: '5' }, 30)).toBeNull();
  });
  it('rejects invalid evidence fields, oversized results and cursor replay', () => {
    expect(parseAuditSearchResponse({ events: [{ ...row('5'), audit_id: 'bad' }], nextCursor: '5' }, 30)).toBeNull();
    expect(parseAuditSearchResponse({ events: [{ ...row('5'), integrity_hash: 'not-a-hash' }], nextCursor: '5' }, 30)).toBeNull();
    expect(parseAuditSearchResponse({ events: [row('5'), row('4')], nextCursor: '4' }, 1)).toBeNull();
    expect(parseAuditSearchResponse({ events: [row('5')], nextCursor: '5' }, 30, '5')).toBeNull();
  });
});
