// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/components/site-footer.tsx', 'utf8');

describe('SiteFooter mobile accessibility', () => {
  it('keeps every footer navigation link at least 44px tall with a visible keyboard focus affordance', () => {
    expect(source).toContain("const linkClass = 'inline-flex min-h-11 items-center");
    expect(source).toContain('focus-visible:outline');
    const links = source.match(/<Link href="\/[^"]+" className=\{linkClass\}>/g) ?? [];
    expect(links).toHaveLength(5);
  });

  it('uses compact wrapping gaps so 360px layouts do not depend on oversized inter-link spacing', () => {
    expect(source).toContain('gap-x-2 gap-y-1');
  });
});
