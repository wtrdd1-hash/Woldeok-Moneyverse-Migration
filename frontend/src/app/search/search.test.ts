import { describe, expect, it } from 'vitest';
import { filterSearchEntries, parseSearchQuery, searchableEntries } from './search';
import { PUBLIC_NAV, MEMBER_NAV, ADMIN_NAV } from '@/lib/navigation';

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


describe('P1 global search input and authority regressions', () => {
  it('rejects duplicate or non-string query parameters without throwing in SSR', () => {
    expect(parseSearchQuery(['wallet', 'admin'])).toEqual({ query: '', invalid: true });
    expect(parseSearchQuery({ nested: 'wallet' })).toEqual({ query: '', invalid: true });
    expect(parseSearchQuery(null)).toEqual({ query: '', invalid: true });
  });

  it('preserves valid Korean and emoji text but refuses control, invalid Unicode and overlong input', () => {
    expect(parseSearchQuery('  주식 😀  ')).toEqual({ query: '주식 😀', invalid: false });
    expect(parseSearchQuery(undefined)).toEqual({ query: '', invalid: false });
    expect(parseSearchQuery('😀'.repeat(80)).invalid).toBe(false);
    expect(parseSearchQuery('😀'.repeat(81)).invalid).toBe(true);
    expect(parseSearchQuery('wallet\nadmin').invalid).toBe(true);
    expect(parseSearchQuery('wallet\ud800').invalid).toBe(true);
  });

  it('does not call member-only bank and wallet destinations public just because they appear in PUBLIC_NAV', () => {
    const guest = searchableEntries(PUBLIC_NAV, MEMBER_NAV, ADMIN_NAV, false, false);
    expect(guest.find((entry) => entry.href === '/wallet')).toBeUndefined();
    expect(guest.find((entry) => entry.href === '/bank')).toBeUndefined();
    const member = searchableEntries(PUBLIC_NAV, MEMBER_NAV, ADMIN_NAV, true, false);
    expect(member.filter((entry) => entry.href === '/wallet')).toEqual([
      expect.objectContaining({ href: '/wallet', access: 'member' }),
    ]);
    expect(member.filter((entry) => entry.href === '/bank')).toEqual([
      expect.objectContaining({ href: '/bank', access: 'member' }),
    ]);
    expect(member.some((entry) => entry.access === 'admin')).toBe(false);
  });
});
