import { describe, expect, it } from 'vitest';
import { filterSearchEntries, searchableEntries } from './search';

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

  it('does not return every route for a blank query', () => {
    const entries = searchableEntries(publicEntries, memberEntries, adminEntries, true, true);
    expect(filterSearchEntries(entries, '   ')).toEqual([]);
  });
});
