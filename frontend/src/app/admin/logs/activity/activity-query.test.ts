import { describe, expect, it } from 'vitest';
import { parseActivityQuery, parseActivityLogs, resolveActivityMember } from './activity-query';

const alice = '850e7583-6589-4371-bffd-e76c3e9f8d31';
const bob = '999488db-d28e-4a53-9a10-7dca4eeabd1a';
const members = [
  { user_id: alice, display_name: 'Alice' },
  { user_id: bob, display_name: 'Alicia' },
];
const row = {
  id: '9007199254740993', user_id: alice,
  username: 'Alice', session_id: 's1', event_type: 'page_view', path: '/shop',
  target_label: null, dwell_time_ms: null, ip: null, user_agent: null,
  metadata: {}, created_at: '2026-10-27T00:00:00.000Z',
};

describe('admin activity query normalization', () => {
  it('keeps a bounded server-compatible limit and page', () => {
    expect(parseActivityQuery({ limit: '100', page: '2' })).toMatchObject({ limit: 100, page: 2, offset: 100 });
    expect(parseActivityQuery({ limit: '9999', page: 'NaN' })).toMatchObject({ limit: 50, page: 1, offset: 0 });
    expect(parseActivityQuery({ limit: '-1', page: '1e9' })).toMatchObject({ limit: 50, page: 1, offset: 0 });
    expect(parseActivityQuery({ limit: '30', page: '9999999999999' })).toMatchObject({ limit: 30, page: 1, offset: 0 });
    expect(parseActivityQuery({ limit: '50', page: '1000' })).toMatchObject({ limit: 50, page: 1000, offset: 49950 });
    expect(parseActivityQuery({ limit: '50', page: '1001' })).toMatchObject({ limit: 50, page: 1, offset: 0 });
  });
  it('only accepts recognized event types and time granularities', () => {
    expect(parseActivityQuery({ eventType: 'admin_request', granularity: 'month' })).toMatchObject({ eventType: 'admin_request', granularity: 'month', periods: 24 });
    expect(parseActivityQuery({ eventType: 'anything', granularity: 'bad' })).toMatchObject({ eventType: '', granularity: 'day', periods: 30 });
  });
});

describe('verified member resolution for authenticated backend UUID contract', () => {
  it('passes a valid UUID without requiring the directory', () => {
    expect(resolveActivityMember(alice.toUpperCase(), null)).toEqual({ status: 'resolved', userId: alice });
  });
  it('resolves an exact case-insensitive nickname to its UUID', () => {
    expect(resolveActivityMember(' ALICE ', members)).toEqual({ status: 'resolved', userId: alice });
  });
  it('allows a unique partial nickname but never chooses the first ambiguous match', () => {
    expect(resolveActivityMember('lici', members)).toEqual({ status: 'resolved', userId: bob });
    expect(resolveActivityMember('ali', members)).toEqual({ status: 'ambiguous' });
  });
  it('does not broaden a filtered query when the directory is unavailable or the name is unknown', () => {
    expect(resolveActivityMember('Alice', null)).toEqual({ status: 'unavailable' });
    expect(resolveActivityMember('nobody', members)).toEqual({ status: 'not_found' });
    expect(resolveActivityMember('Alice', [{ display_name: 'Alice', user_id: 'not-uuid' }])).toEqual({ status: 'unavailable' });
  });
  it('keeps unfiltered queries explicit', () => {
    expect(resolveActivityMember('', null)).toEqual({ status: 'all' });
  });
});

describe('activity log evidence validation', () => {
  it('accepts actual backend-shaped records including an empty result', () => {
    expect(parseActivityLogs([row], 50)).toEqual([row]);
    expect(parseActivityLogs([{ ...row, session_id: null }], 50)).toEqual([{ ...row, session_id: null }]);
    expect(parseActivityLogs([], 50)).toEqual([]);
  });
  it('rejects malformed, duplicate, oversized and contradictory records instead of displaying false emptiness', () => {
    expect(parseActivityLogs(null, 50)).toBeNull();
    expect(parseActivityLogs({ logs: [] }, 50)).toBeNull();
    expect(parseActivityLogs([row, row], 50)).toBeNull();
    expect(parseActivityLogs([row, { ...row, id: '9007199254740994' }], 1)).toBeNull();
    expect(parseActivityLogs([{ ...row, metadata: null }], 50)).toBeNull();
    expect(parseActivityLogs([{ ...row, created_at: 'invalid' }], 50)).toBeNull();
    expect(parseActivityLogs([{ ...row, dwell_time_ms: -1 }], 50)).toBeNull();
    expect(parseActivityLogs([{ ...row, user_id: 'not-uuid' }], 50)).toBeNull();
  });
});
