import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('published announcement body search SEO and accessibility boundary', () => {
  it('keeps canonical page query-independent and search on a separate noindex route', () => {
    const canonical = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    const search = readFileSync(new URL('./body/page.tsx', import.meta.url), 'utf8');
    expect(canonical).toContain('export const revalidate = 60');
    expect(canonical).not.toContain('searchParams');
    expect(canonical).toContain('action="/announcements/body"');
    expect(canonical).toContain('htmlFor="notice-body"');
    expect(search).toContain("export const dynamic = 'force-dynamic'");
    expect(search).toContain('robots: { index: false, follow: true }');
    expect(search).toContain('data === null');
    expect(search).toContain('data.announcements.length === 0');
  });
});
