import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/components/site-footer.tsx', 'utf8');

describe('SiteFooter mobile accessibility', () => {
  it('keeps every footer navigation link at least 44px tall with a visible keyboard focus affordance', () => {
    const links = source.match(/className="inline-flex min-h-11[^"]+"/g) ?? [];
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toContain('items-center');
      expect(link).toContain('focus-visible:outline');
    }
  });

  it('uses compact wrapping gaps so 360px layouts do not depend on oversized inter-link spacing', () => {
    expect(source).toContain('gap-x-2 gap-y-1');
  });
});
