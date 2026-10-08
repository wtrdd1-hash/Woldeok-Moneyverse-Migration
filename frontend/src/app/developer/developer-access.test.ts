import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync('src/app/developer/page.tsx', 'utf8').replace(/\r\n/g, '\n');
const navSource = readFileSync('src/lib/navigation.ts', 'utf8').replace(/\r\n/g, '\n');

describe('developer portal administrator access guard', () => {
  it('strictly enforces requireAdministrator before rendering developer portal', () => {
    expect(pageSource).toContain("import { requireAdministrator } from '@/lib/session';");
    expect(pageSource).toContain('await requireAdministrator();');
  });

  it('prevents search engine indexing with noindex metadata', () => {
    expect(pageSource).toContain('robots: { index: false, follow: false }');
  });

  it('excludes /developer from public and member navigations while keeping it in admin navigation', () => {
    expect(navSource).not.toContain("PUBLIC_NAV: readonly NavEntry[] = [\n  { href: '/developer'");
    expect(navSource).not.toContain("HEADER_PUBLIC: readonly NavItem[] = [\n      { href: '/developer'");
    const adminNav = navSource.split('export const HEADER_ADMIN: readonly NavItem[] = [')[1] ?? '';
    expect(adminNav).toContain("{ href: '/developer', label: '개발자 포털' }");
  });
});
