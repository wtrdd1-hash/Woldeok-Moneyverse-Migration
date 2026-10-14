import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = (file: string) => readFileSync(path.join(process.cwd(), 'src', file), 'utf8');

const blogPages = [
  'app/blog/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/admin/blog/page.tsx',
];

describe('Blog layout boundaries', () => {
  it('renders the site shell exactly once in the root layout', () => {
    expect(source('app/layout.tsx')).toContain('<SiteShell>{children}</SiteShell>');
    for (const page of blogPages) {
      expect(source(page), page).not.toContain('<SiteShell>');
      expect(source(page), page).not.toContain("import { SiteShell }");
    }
  });

  it('makes the blog operations page accessible from the administrator navigation', () => {
    expect(source('components/admin-sub-nav.tsx')).toMatch(/href:\s*'\/admin\/blog',\s*label:\s*'[^']+'/);
  });
});
