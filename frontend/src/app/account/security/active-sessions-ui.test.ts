import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

describe('active-session inventory entry point accessibility and SEO', () => {
  it('remains dynamic and non-indexable with a keyboard-sized explicit download link', () => {
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).toContain('robots: { index: false, follow: false }');
    expect(source).toContain('href="/account/security/sessions.csv"');
    expect(source).toContain('download prefetch={false}');
    expect(source).toContain('className="min-h-11"');
  });
  it('does not present an export action when the authoritative session list failed to load', () => {
    expect(source).toContain('sessionData !== null && (');
  });
});
