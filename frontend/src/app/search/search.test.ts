import { describe, expect, it } from 'vitest';
import { filterSearchEntries, parseGlobalSearchQuery, resolveSearchAudience, searchableEntries } from './search';

const publicEntries = [{ href: '/guide', label: '이용 방법' }] as const;
const memberEntries = [
  { href: '/wallet', label: '덕지갑' },
  { href: '/guide', label: '중복 가이드' },
] as const;
const adminEntries = [{ href: '/admin/logs', label: '감사 로그' }] as const;

describe('global navigation search', () => {
  it('never exposes member or admin destinations to signed-out visitors', () => {
    expect(searchableEntries(publicEntries, memberEntries, adminEntries, false, false)).toEqual([
      { href: '/guide', label: '이용 방법', access: 'public' },
    ]);
  });

  it('adds member and admin destinations only for authorized viewers and deduplicates paths', () => {
    const entries = searchableEntries(publicEntries, memberEntries, adminEntries, true, true);
    expect(entries.map((entry) => entry.href)).toEqual(['/guide', '/wallet', '/admin/logs']);
  });

  it('matches Korean labels, English labels, and routes', () => {
    const entries = searchableEntries(publicEntries, memberEntries, adminEntries, true, true);
    expect(filterSearchEntries(entries, '지갑').map((entry) => entry.href)).toEqual(['/wallet']);
    expect(filterSearchEntries(entries, 'audit').map((entry) => entry.href)).toEqual(['/admin/logs']);
    expect(filterSearchEntries(entries, '/guide').map((entry) => entry.href)).toEqual(['/guide']);
  });

  it('matches routes via Korean synonyms and financial keywords', () => {
    const stockEntries = [{ href: '/stocks', label: '거래소' }] as const;
    const entries = searchableEntries(stockEntries, [], [], true, false);
    expect(filterSearchEntries(entries, '주식').map((entry) => entry.href)).toEqual(['/stocks']);
    expect(filterSearchEntries(entries, '증권').map((entry) => entry.href)).toEqual(['/stocks']);
    expect(filterSearchEntries(entries, '호가').map((entry) => entry.href)).toEqual(['/stocks']);
  });

  it('does not return every route for a blank query', () => {
    const entries = searchableEntries(publicEntries, memberEntries, adminEntries, true, true);
    expect(filterSearchEntries(entries, '   ')).toEqual([]);
  });
});


describe('global search untrusted input and auth evidence', () => {
  it('rejects duplicate query parameters instead of crashing or picking one', () => {
    expect(parseGlobalSearchQuery(['wallet', 'admin'])).toEqual({ query: '', invalid: true });
    expect(parseGlobalSearchQuery(['wallet'])).toEqual({ query: '', invalid: true });
  });

  it('rejects non-string or over-limit values and never slices surrogate pairs', () => {
    expect(parseGlobalSearchQuery({ nested: 'wallet' })).toEqual({ query: '', invalid: true });
    expect(parseGlobalSearchQuery('a'.repeat(81))).toEqual({ query: '', invalid: true });
    expect(parseGlobalSearchQuery('😀'.repeat(80))).toEqual({ query: '😀'.repeat(80), invalid: false });
  });

  it('normalizes valid queries without treating an empty search as invalid', () => {
    expect(parseGlobalSearchQuery(undefined)).toEqual({ query: '', invalid: false });
    expect(parseGlobalSearchQuery('  지갑  ')).toEqual({ query: '지갑', invalid: false });
    expect(parseGlobalSearchQuery('   ')).toEqual({ query: '', invalid: false });
  });

  it('distinguishes an unavailable viewer API from an authenticated or signed-out viewer', () => {
    expect(resolveSearchAudience(null)).toBe('unknown');
    expect(resolveSearchAudience({ signedIn: true, consentCurrent: true, adminRoles: null } as never)).toBe('unknown');
    expect(resolveSearchAudience({ signedIn: false, consentCurrent: false, adminRoles: [] })).toBe('public');
    expect(resolveSearchAudience({ signedIn: true, consentCurrent: false, adminRoles: ['admin'] })).toBe('public');
    expect(resolveSearchAudience({ signedIn: true, consentCurrent: true, adminRoles: [] })).toBe('member');
    expect(resolveSearchAudience({ signedIn: true, consentCurrent: true, adminRoles: ['admin'] })).toBe('admin');
  });
});
